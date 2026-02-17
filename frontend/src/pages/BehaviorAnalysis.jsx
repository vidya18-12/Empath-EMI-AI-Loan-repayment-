import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import {
    Brain,
    TrendingUp,
    AlertTriangle,
    MessageSquare,
    Activity,
    Users,
    Search,
    ChevronDown,
    ChevronUp,
    Target,
    Zap,
    Shield,
    Scale,
    Filter,
    X,
    ArrowUpRight,
    ArrowDownRight,
    Activity as ActivityIcon,
    Sparkles,
    RotateCcw,
    MapPin,
    Navigation as NavigationIcon,
    Camera
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    AreaChart, Area
} from 'recharts';

const BehaviorAnalysis = () => {
    const [borrowers, setBorrowers] = useState([]);
    const [filteredBorrowers, setFilteredBorrowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBorrower, setSelectedBorrower] = useState(null);
    const [activeSegment, setActiveSegment] = useState('ALL');
    const { user } = useAuth();
    const isManager = user?.role === 'manager';
    const isAdmin = user?.role === 'admin';

    // Role-specific theme engine
    const theme = {
        primary: isAdmin ? 'yellow-500' : 'cyan-500',
        secondary: isAdmin ? 'yellow-600' : 'blue-600',
        bgGradient: isAdmin ? 'from-yellow-600/20' : 'from-primary-600/10',
        glow: isAdmin ? 'shadow-yellow-500/20' : 'shadow-cyan-500/20',
        text: isAdmin ? 'Executive Portfolio' : 'Neural Network',
        icon: isAdmin ? Shield : Brain
    };

    useEffect(() => {
        fetchBorrowers();
    }, []);

    useEffect(() => {
        let result = borrowers;

        if (searchTerm) {
            result = result.filter(b =>
                b.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.loanId?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (activeSegment !== 'ALL') {
            result = result.filter(b => b.riskLevel === activeSegment);
        }

        setFilteredBorrowers(result);
    }, [searchTerm, borrowers, activeSegment]);

    const fetchBorrowers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/borrowers');
            const allBorrowers = response.data.data || [];

            const sorted = allBorrowers.sort((a, b) => {
                const riskOrder = { 'CRITICAL_RISK': 4, 'HIGH_RISK': 3, 'MODERATE_RISK': 2, 'NORMAL_RISK': 1, 'PENDING': 0 };
                return (riskOrder[b.riskLevel] || 0) - (riskOrder[a.riskLevel] || 0);
            });

            setBorrowers(sorted);
            setFilteredBorrowers(sorted);
        } catch (error) {
            console.error('Failed to load borrowers', error);
            const errorMsg = error.response?.data?.error || 'Failed to initialize behavioral matrix';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleTacticalIntervention = (borrower) => {
        toast.info(`Tactical intervention authorized for ${borrower.customerName}`, {
            icon: '🎯'
        });
        // In a real flow, this would trigger an agent call or high-priority SMS
        setSelectedBorrower(null);
    };

    const getRiskConfig = (risk) => {
        const configs = {
            'CRITICAL_RISK': { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'CRITICAL RISK' },
            'HIGH_RISK': { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'HIGH RISK' },
            'MODERATE_RISK': { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', label: 'MODERATE RISK' },
            'NORMAL_RISK': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'NORMAL RISK' },
            'PENDING': { color: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10', label: 'PENDING' },
        };
        return configs[risk] || configs['PENDING'];
    };

    const calculateSentimentScore = (borrower) => {
        if (borrower.behavioralAnalysis?.stressLevel) {
            switch (borrower.behavioralAnalysis.stressLevel) {
                case 'Critical': return 15;
                case 'High': return 30;
                case 'Moderate': return 55;
                case 'Low': return 85;
                default: return 50;
            }
        }
        return 50;
    };

    const generateBehaviorMetrics = (borrower) => {
        const sentiment = calculateSentimentScore(borrower);
        return [
            { metric: 'Communication', score: Math.min(100, sentiment + 10) },
            { metric: 'Cooperation', score: sentiment },
            { metric: 'Commitment', score: Math.max(0, sentiment - 10) },
            { metric: 'Reliability', score: Math.max(0, sentiment - 5) },
            { metric: 'Response', score: Math.min(100, sentiment + 5) },
        ];
    };

    const aggregateMetrics = {
        avgSentiment: Math.round(borrowers.reduce((acc, b) => acc + calculateSentimentScore(b), 0) / (borrowers.length || 1)),
        criticalCount: borrowers.filter(b => ['CRITICAL_RISK', 'HIGH_RISK', 'MODERATE_RISK'].includes(b.riskLevel)).length,
        recoveryMomentum: borrowers.length > 0 ? `+${(borrowers.filter(b => b.emiPlanStatus === 'accepted').length / borrowers.length * 100).toFixed(1)}%` : '0%',
        activeInterventions: borrowers.filter(b => b.emiPlanStatus !== 'none' || b.behavioralAnalysis?.stressLevel !== 'Unknown').length
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in py-2">
            {/* Behavioral Command Header */}
            <div className={`relative overflow-hidden rounded-[3rem] p-10 bg-gradient-to-br ${theme.bgGradient} to-transparent border border-white/5 mb-12`}>
                <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-${theme.primary}/5 blur-[120px] -mr-48 -mt-48 animate-pulse-slow`}></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <div className={`w-14 h-14 rounded-2xl bg-${theme.primary}/10 flex items-center justify-center border border-${theme.primary}/20 ${theme.glow}`}>
                                <theme.icon className={`w-8 h-8 text-${theme.primary}`} />
                            </div>
                            <div>
                                <h1 className="text-5xl font-black text-white tracking-tighter">
                                    {isAdmin ? 'Executive' : 'Behavioral'} <span className={`text-${theme.primary}`}>{isAdmin ? 'Portfolio' : 'Matrix'}</span>
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <Sparkles className={`w-3 h-3 text-${theme.primary} opacity-50`} />
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                        {isAdmin ? 'High-Level Asset Stability Intelligence' : 'Real-time Psychological Risk Trajectory'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="glass px-8 py-4 rounded-[2rem] border border-white/10 flex items-center gap-10">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">{isAdmin ? 'Lending Health' : 'Portfolio Mood'}</p>
                                <div className="flex items-center gap-3">
                                    <span className={`text-2xl font-black ${aggregateMetrics.avgSentiment > 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {aggregateMetrics.avgSentiment > 50 ? (isAdmin ? 'SECURE' : 'STABLE') : (isAdmin ? 'VULNERABLE' : 'CONTESTED')}
                                    </span>
                                    <div className={`w-3 h-3 rounded-full ${aggregateMetrics.avgSentiment > 50 ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse shadow-glow-sm`}></div>
                                </div>
                            </div>
                            <div className="w-px h-12 bg-white/10"></div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Active Pulse</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-white">{borrowers.length}</span>
                                    <span className="text-[10px] font-bold text-gray-600 uppercase">Nodes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Holistic Intelligence Gauges */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: isAdmin ? 'Portfolio Exposure' : 'Psychological Risk', value: isAdmin ? `₹${(aggregateMetrics.criticalCount * 96000).toLocaleString()}` : `${aggregateMetrics.criticalCount}`, trend: isAdmin ? 'Managed' : 'Elevated', color: isAdmin ? 'yellow' : 'rose', icon: isAdmin ? Shield : AlertTriangle, sub: isAdmin ? 'At-Risk Equity' : 'Elevated Nodes' },
                    { label: 'Network Sentiment', value: `${aggregateMetrics.avgSentiment}%`, trend: 'Aggregated', color: 'cyan', icon: Zap, sub: 'Mean Probability' },
                    { label: isAdmin ? 'ROI Momentum' : 'Recovery Velocity', value: aggregateMetrics.recoveryMomentum, trend: 'Net Gain', color: 'emerald', icon: TrendingUp, sub: 'Closure Rate' },
                    { label: 'Active Guard', value: aggregateMetrics.activeInterventions, trend: 'Synchronized', color: 'purple', icon: Target, sub: 'Live Protocols' },
                ].map((stat, i) => (
                    <div key={i} className={`glass rounded-[2.5rem] p-8 border border-white/5 relative group overflow-hidden transition-all duration-500 hover:border-${stat.color}-500/30`}>
                        <div className={`absolute -right-4 -bottom-4 w-32 h-32 bg-${stat.color}-500/5 blur-3xl rounded-full group-hover:bg-${stat.color}-500/15 transition-all duration-700`}></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-glow-sm`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                                </div>
                                <span className={`text-[8px] font-black px-2 py-1 bg-${stat.color}-500/10 text-${stat.color}-400 rounded-lg border border-${stat.color}-500/20 uppercase tracking-widest`}>
                                    {stat.trend}
                                </span>
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                <h3 className="text-3xl font-black text-white tracking-tight leading-none mb-2">{stat.value}</h3>
                                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{stat.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Role-Specific Intelligence Layer */}
            {isAdmin && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
                    <div className="glass rounded-[3rem] p-10 border border-yellow-500/10 bg-gradient-to-br from-yellow-500/5 to-transparent relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full group-hover:bg-yellow-500/10 transition-all"></div>
                        <h3 className="text-[10px] font-black text-yellow-500/50 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                            <Shield className="w-5 h-5" />
                            Risk Equilibrium
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Critical Exposure', value: '12%', color: 'rose' },
                                { label: 'At-Risk Equity', value: '28%', color: 'yellow' },
                                { label: 'Secured Assets', value: '60%', color: 'emerald' },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                                        <span className="text-gray-500">{item.label}</span>
                                        <span className={`text-${item.color}-400`}>{item.value}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full bg-${item.color}-500/50`} style={{ width: item.value }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass rounded-[3rem] p-10 border border-yellow-500/10 bg-gradient-to-br from-yellow-500/5 to-transparent relative overflow-hidden group">
                        <h3 className="text-[10px] font-black text-yellow-500/50 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                            <TrendingUp className="w-5 h-5" />
                            Sentiment Velocity
                        </h3>
                        <div className="flex items-end gap-2 h-32">
                            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                <div key={i} className="flex-1 bg-yellow-500/10 rounded-t-lg transition-all hover:bg-yellow-500/30 group-hover:h-full relative cursor-help" style={{ height: `${h}%` }}>
                                    <div className="absolute inset-x-0 top-0 h-1 bg-yellow-400 opacity-0 hover:opacity-100"></div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">7-Day Aggregated Mood Pulse</p>
                    </div>

                    <div className="glass rounded-[3rem] p-10 border border-yellow-500/10 bg-gradient-to-br from-yellow-500/5 to-transparent relative overflow-hidden group">
                        <h3 className="text-[10px] font-black text-yellow-500/50 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                            <Zap className="w-5 h-5" />
                            Recovery Efficacy
                        </h3>
                        <div className="flex flex-col items-center justify-center h-40">
                            <div className="relative">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * 0.22} className="text-yellow-500 drop-shadow-glow" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black text-white">78%</span>
                                    <span className="text-[8px] font-black text-gray-500 uppercase">Yield</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isManager && (
                <div className="space-y-8 animate-slide-up">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Tactical Intervention Queue */}
                        <div className="glass rounded-[3rem] p-10 border border-cyan-500/10 bg-gradient-to-br from-cyan-500/5 to-transparent relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-xs font-black text-cyan-500/50 uppercase tracking-[0.4em] flex items-center gap-4">
                                    <Zap className="w-5 h-5" />
                                    Tactical Intervention Queue
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{borrowers.filter(b => ['CRITICAL_RISK', 'HIGH_RISK'].includes(b.riskLevel)).length} Priority</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {borrowers.filter(b => ['CRITICAL_RISK', 'HIGH_RISK'].includes(b.riskLevel)).slice(0, 3).map((b, i) => (
                                    <div key={i} className="glass-light rounded-3xl p-5 border border-white/5 flex items-center gap-4 hover:border-cyan-500/30 transition-all group cursor-pointer" onClick={() => setSelectedBorrower(b)}>
                                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-black border border-rose-500/20 text-xs">
                                            {b.customerName?.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors leading-tight">{b.customerName}</p>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{b.loanId}</p>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-gray-700 group-hover:text-cyan-500 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mission Intelligence Feed */}
                        <div className="glass rounded-[3rem] p-10 border border-cyan-500/10 bg-gradient-to-br from-cyan-500/5 to-transparent relative overflow-hidden group">
                            <h3 className="text-xs font-black text-cyan-500/50 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                                <MapPin className="w-5 h-5" />
                                Mission Intelligence Feed
                            </h3>
                            <div className="space-y-4">
                                {borrowers.flatMap(b => (b.fieldVisits || []).map(v => ({ ...v, customerName: b.customerName }))).sort((a, b) => new Date(b.visitedAt) - new Date(a.visitedAt)).slice(0, 3).length > 0 ? (
                                    borrowers.flatMap(b => (b.fieldVisits || []).map(v => ({ ...v, customerName: b.customerName, borrowerId: b._id })))
                                        .sort((a, b) => new Date(b.visitedAt) - new Date(a.visitedAt))
                                        .slice(0, 3)
                                        .map((v, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                                                    <img src={v.photoUrl.startsWith('/') ? `http://localhost:5000${v.photoUrl}` : v.photoUrl} className="w-full h-full object-cover" alt="Field" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="text-[10px] font-black text-white truncate uppercase tracking-widest">{v.customerName}</p>
                                                        <span className="text-[8px] font-black text-cyan-400 uppercase">LIVE</span>
                                                    </div>
                                                    <p className="text-[9px] text-gray-500 truncate italic">"{v.notes.substring(0, 40)}..."</p>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <div className="h-48 flex flex-col items-center justify-center opacity-20">
                                        <Camera className="w-10 h-10 mb-4" />
                                        <p className="text-xs font-bold uppercase tracking-widest">No field intel yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Response Velocity Gauges */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {[
                            { label: 'Chat Velocity', value: '85%', color: 'cyan', trend: '+12%' },
                            { label: 'Plan Retention', value: '92%', color: 'emerald', trend: '+5%' },
                            { label: 'Response Delta', value: '4.2m', color: 'purple', trend: '-1.5m' },
                            { label: 'Auth Ratio', value: '64%', color: 'rose', trend: '+8%' },
                        ].map((gauge, i) => (
                            <div key={i} className="glass-light rounded-[2rem] p-6 border border-white/5 flex flex-col items-center text-center group hover:border-cyan-500/20 transition-all">
                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-3">{gauge.label}</span>
                                <div className={`text-xl font-black text-white group-hover:text-${gauge.color}-400 transition-colors`}>{gauge.value}</div>
                                <div className={`mt-2 px-2 py-0.5 rounded-full bg-${gauge.color}-500/10 text-[8px] font-black text-${gauge.color}-400 border border-${gauge.color}-500/20`}>
                                    {gauge.trend}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Matrix Filter & Search */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                <div className="flex-1 w-full relative group">
                    <div className={`absolute -inset-1 bg-gradient-to-r ${isAdmin ? 'from-yellow-500/20 to-yellow-600/20' : 'from-cyan-500/20 to-blue-600/20'} rounded-[1.5rem] blur opacity-0 group-focus-within:opacity-100 transition-opacity`}></div>
                    <div className="relative">
                        <Search className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 ${isAdmin ? 'text-yellow-500/50' : 'text-cyan-500/50'} group-focus-within:text-white transition-colors`} />
                        <input
                            type="text"
                            placeholder="Initialize query by name or loan ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/5 rounded-[1.5rem] focus:outline-none font-bold text-white text-sm placeholder:text-gray-600 transition-all backdrop-blur-xl"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-[1.5rem] border border-white/5 backdrop-blur-xl shrink-0">
                    {['ALL', 'CRITICAL_RISK', 'HIGH_RISK', 'MODERATE_RISK', 'NORMAL_RISK'].map((seg) => (
                        <button
                            key={seg}
                            onClick={() => setActiveSegment(seg)}
                            className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeSegment === seg
                                ? `${isAdmin ? 'bg-yellow-500 text-black shadow-yellow-500/20' : 'bg-cyan-500 text-black shadow-cyan-500/20'} shadow-lg scale-105`
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            {seg.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Behavior Segment Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 min-h-[400px]">
                {filteredBorrowers.map((borrower) => {
                    const config = getRiskConfig(borrower.riskLevel);
                    const sentiment = calculateSentimentScore(borrower);
                    return (
                        <div
                            key={borrower._id}
                            onClick={() => setSelectedBorrower(borrower)}
                            className={`glass rounded-[2.5rem] p-7 border border-white/5 hover:border-${theme.primary}/30 transition-all duration-500 cursor-pointer group relative overflow-hidden flex flex-col h-full hover:-translate-y-2`}
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 ${config.bg} blur-[60px] -mr-16 -mt-16 group-hover:opacity-100 opacity-30 transition-opacity duration-700`}></div>

                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className={`w-14 h-14 rounded-2xl bg-${theme.primary}/10 p-0.5 border border-${theme.primary}/20 shadow-glow-sm group-hover:rotate-6 transition-transform duration-500`}>
                                    <div className="w-full h-full rounded-2xl bg-dark-500 flex items-center justify-center text-xl font-black text-white">
                                        {borrower.customerName?.charAt(0)}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${config.bg} ${config.color} ${config.border}`}>
                                        {config.label}
                                    </span>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={`w-1 h-3 rounded-full ${i * 30 <= sentiment ? `bg-${theme.primary}` : 'bg-white/10'}`}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 relative z-10">
                                <h3 className="text-xl font-black text-white mb-1 group-hover:text-white transition-colors">{borrower.customerName}</h3>
                                <p className={`text-[10px] font-black text-${theme.primary} uppercase tracking-[0.2em] mb-6 opacity-60`}>{borrower.loanId}</p>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                        <span className="text-gray-500">Asset Exposure</span>
                                        <span className={`${config.color} text-sm`}>₹{borrower.outstandingBalance?.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${isAdmin ? 'from-yellow-400 to-yellow-600' : 'from-cyan-400 to-blue-600'} transition-all duration-1000`}
                                            style={{ width: `${Math.min(100, (borrower.outstandingBalance / 100000) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                                <div className={`px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 group-hover:bg-${theme.primary}/5 transition-colors`}>
                                    <div className={`w-2 h-2 rounded-full ${['High', 'Critical'].includes(borrower.behavioralAnalysis?.stressLevel) ? 'bg-rose-500 shadow-rose-500/50' : 'bg-emerald-500 shadow-emerald-500/50'} shadow-sm animate-pulse`}></div>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">
                                        {borrower.behavioralAnalysis?.stressLevel || 'Nominal'} Pulse
                                    </span>
                                </div>
                                <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 bg-${theme.primary}/10`}>
                                    <ArrowUpRight className={`w-4 h-4 text-${theme.primary}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Neural Deep-Dive Modal Overlay */}
            {selectedBorrower && (
                <>
                    <div
                        className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100] transition-opacity duration-500"
                        onClick={() => setSelectedBorrower(null)}
                    />
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none">
                        <div className={`w-full max-w-4xl glass rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden pointer-events-auto animate-scale-in flex flex-col max-h-[90vh] relative`}>
                            <div className={`absolute top-0 right-0 w-[400px] h-[400px] bg-${theme.primary}/5 blur-[100px] -mr-48 -mt-48`}></div>

                            {/* Modal Header */}
                            <div className={`p-6 md:p-8 border-b border-white/5 bg-gradient-to-r ${theme.bgGradient} to-transparent flex items-center justify-between relative z-10`}>
                                <div className="flex items-center gap-6 md:gap-8">
                                    <div className={`w-20 h-20 rounded-[2rem] bg-${theme.primary}/10 p-0.5 border border-${theme.primary}/20 shadow-glow-md`}>
                                        <div className="w-full h-full rounded-[2rem] bg-dark-500 flex items-center justify-center text-3xl font-black text-white">
                                            {selectedBorrower.customerName?.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-4 mb-2">
                                            <h2 className="text-3xl font-black text-white tracking-tighter">{selectedBorrower.customerName}</h2>
                                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getRiskConfig(selectedBorrower.riskLevel).bg} ${getRiskConfig(selectedBorrower.riskLevel).color} ${getRiskConfig(selectedBorrower.riskLevel).border} shadow-sm`}>
                                                {selectedBorrower.riskLevel?.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <Target className={`w-3.5 h-3.5 text-${theme.primary}`} />
                                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">ID: {selectedBorrower.loanId}</p>
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-white/10"></div>
                                            <p className={`text-[11px] font-black text-${theme.primary} tracking-widest uppercase`}>₹{selectedBorrower.outstandingBalance?.toLocaleString()} EXPOSURE</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedBorrower(null)}
                                    className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 group active:scale-95"
                                >
                                    <X className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
                                </button>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide relative z-10">
                                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
                                    {/* Behavioral Landscape */}
                                    <div className="space-y-10">
                                        <div className="glass-light rounded-[2.5rem] p-6 border border-white/5 relative overflow-hidden group">
                                            <div className={`absolute top-0 right-0 w-48 h-48 bg-${theme.primary}/5 rounded-full blur-[80px] -mr-24 -mt-24`}></div>
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                                <Activity className={`w-4 h-4 text-${theme.primary}`} />
                                                Neural Risk Projection
                                            </h3>
                                            <div className="h-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart data={generateBehaviorMetrics(selectedBorrower)}>
                                                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900 }} />
                                                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                                                        <Radar
                                                            name="Vector Score"
                                                            dataKey="score"
                                                            stroke={isAdmin ? '#f59e0b' : '#06b6d4'}
                                                            fill={`url(#modalRadarGradient)`}
                                                            fillOpacity={0.7}
                                                            strokeWidth={4}
                                                        />
                                                        <defs>
                                                            <linearGradient id="modalRadarGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor={isAdmin ? '#f59e0b' : '#06b6d4'} stopOpacity={0.9} />
                                                                <stop offset="95%" stopColor={isAdmin ? '#d97706' : '#2563eb'} stopOpacity={0.9} />
                                                            </linearGradient>
                                                        </defs>
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="glass-light rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between min-h-[90px]">
                                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-3">Intent Calibration</p>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${['Will Pay', 'Likely'].includes(selectedBorrower.behavioralAnalysis?.willingnessToPay) ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-rose-500 shadow-rose-500/50'} shadow-md animate-pulse`}></div>
                                                    <span className={`text-lg font-black text-white truncate`}>
                                                        {selectedBorrower.behavioralAnalysis?.willingnessToPay || 'NEUTRAL'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="glass-light rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between min-h-[90px]">
                                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-3">Distress Level</p>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${['Critical', 'High'].includes(selectedBorrower.behavioralAnalysis?.stressLevel) ? 'bg-rose-500 shadow-rose-500/50' : 'bg-emerald-500 shadow-emerald-500/50'} shadow-md animate-pulse`}></div>
                                                    <span className={`text-lg font-black text-white truncate`}>
                                                        {selectedBorrower.behavioralAnalysis?.stressLevel?.toUpperCase() || 'MINIMAL'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action & Insights */}
                                    <div className="space-y-10">
                                        <div className="glass-light rounded-[2.5rem] p-8 border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                                                <Sparkles className={`w-4 h-4 text-${theme.primary}`} />
                                                Core Behavioral Insights
                                            </h3>
                                            <div className={`p-6 bg-dark-500/50 rounded-2xl border border-white/5 mb-6 relative overflow-hidden`}>
                                                <div className={`absolute top-0 left-0 w-1 h-full bg-${theme.primary}`}></div>
                                                <p className="text-xl font-black text-white capitalize leading-tight mb-3">
                                                    {selectedBorrower.behavioralAnalysis?.primaryIssue || 'Stable Baseline Detection'}
                                                </p>
                                                <p className="text-[11px] font-medium text-gray-500 leading-relaxed italic">
                                                    "{selectedBorrower.behavioralAnalysis?.detailedInsights || 'Continuous monitoring active. Behavioral deviations remain within predicted corridors for this risk profile.'}"
                                                </p>
                                            </div>

                                            {/* Field Visit Report Overlay */}
                                            {selectedBorrower.fieldVisits?.length > 0 && (
                                                <div className="mt-8 pt-8 border-t border-white/5">
                                                    <h4 className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        Verified On-Ground Intelligence
                                                    </h4>
                                                    <div className="flex gap-6">
                                                        <div className="w-[120px] h-[120px] rounded-2xl overflow-hidden border border-white/10 relative group shrink-0">
                                                            <img
                                                                src={selectedBorrower.fieldVisits[selectedBorrower.fieldVisits.length - 1].photoUrl}
                                                                alt="Verified Site"
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                                                                <div className="flex items-center gap-1.5 text-[7px] font-black text-white uppercase tracking-widest">
                                                                    <NavigationIcon className="w-2.5 h-2.5 text-cyan-400" />
                                                                    GPS SECURE
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 space-y-3">
                                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 h-full flex flex-col justify-center">
                                                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Executive Summary</p>
                                                                <p className="text-[11px] font-bold text-white leading-relaxed line-clamp-3">
                                                                    {selectedBorrower.fieldVisits[selectedBorrower.fieldVisits.length - 1].notes}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex items-center justify-between px-1">
                                                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">
                                                            VECTORED AT: {new Date(selectedBorrower.fieldVisits[selectedBorrower.fieldVisits.length - 1].visitedAt).toLocaleString()}
                                                        </span>
                                                        <div className="flex gap-1">
                                                            <div className="w-1 h-1 rounded-full bg-cyan-500 shadow-glow-sm"></div>
                                                            <div className="w-1 h-1 rounded-full bg-cyan-500/50"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className={`glass-light rounded-[2.5rem] p-8 border border-white/5 bg-gradient-to-br ${theme.bgGradient} to-transparent`}>
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                                                <Zap className={`w-4 h-4 text-${theme.primary}`} />
                                                Strategic Command Protocols
                                            </h3>
                                            <div className="space-y-5">
                                                {[
                                                    { label: 'Recommended Action', value: selectedBorrower.riskLevel === 'CRITICAL_RISK' ? 'Immediate Legal Escalation' : 'Empathetic Debt Restructuring', status: 'PRIORITY' },
                                                    { label: 'Assigned Regional Lead', value: selectedBorrower.assignedFieldExecutive?.name || 'Awaiting Field Allocation', status: selectedBorrower.assignedFieldExecutive ? 'ACTIVE' : 'QUEUED' },
                                                    { label: 'Settlement Probability', value: selectedBorrower.riskLevel === 'CRITICAL_RISK' ? '14%' : '82%', status: 'PREDICTED' }
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                                        <div>
                                                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">{item.label}</p>
                                                            <p className="text-sm font-black text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">{item.value}</p>
                                                        </div>
                                                        <span className={`text-[8px] font-black px-2 py-1 bg-white/10 rounded-lg text-gray-400 uppercase tracking-widest border border-white/10 shrink-0`}>{item.status}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => handleTacticalIntervention(selectedBorrower)}
                                                className={`w-full mt-6 bg-${theme.primary} text-black font-black py-4 rounded-3xl text-xs uppercase tracking-[0.3em] shadow-lg hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3 group`}
                                            >
                                                Authorize Tactical Intervention
                                                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default BehaviorAnalysis;
