import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import {
    Users,
    AlertCircle,
    CheckCircle,
    PhoneOff,
    TrendingUp,
    Upload,
    Activity,
    Calendar,
    Target,
    Zap,
    ArrowRight,
    FileText
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchStats();
        if (user?.role === 'manager' || user?.role === 'admin') {
            const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
            fetchNotifications();
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            const unread = response.data.data;
            if (unread.length > 0) {
                unread.forEach(notif => {
                    toast((t) => (
                        <div className="flex flex-col">
                            <span className="font-bold text-white">{notif.title}</span>
                            <span className="text-sm text-gray-300">{notif.message}</span>
                            <span className="text-sm text-gray-300">{notif.message}</span>
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => {
                                        api.put(`/notifications/${notif._id}/read`);
                                        toast.dismiss(t.id);
                                    }}
                                    className="text-xs bg-white/10 hover:bg-white/20 text-white font-bold py-1.5 px-3 rounded-lg transition-all"
                                >
                                    Dismiss
                                </button>
                                {notif.relatedData?.downloadUrl && (
                                    <a
                                        href={notif.relatedData.downloadUrl}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs bg-gradient-primary text-white font-bold py-1.5 px-3 rounded-lg hover:shadow-glow-sm transition-all flex items-center gap-1"
                                    >
                                        <Upload className="w-3 h-3 rotate-180" /> Download
                                    </a>
                                )}
                            </div>
                        </div>
                    ), {
                        duration: 6000,
                        icon: '🔔',
                        style: {
                            borderRadius: '1.2rem',
                            background: '#1e293b',
                            color: '#fff',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            backdropFilter: 'blur(10px)'
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Failed to fetch notifications');
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/borrowers/stats');
            setStats(response.data.data);
        } catch (error) {
            toast.error('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            await api.post('/borrowers/upload', formData);
            toast.success('File uploaded successfully!');
            setFile(null);
            fetchStats();
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Upload failed';
            const details = error.response?.data?.details;
            const message = error.response?.data?.message;

            if (details && Array.isArray(details)) {
                toast.error(`${errorMsg}: ${details.join(', ')}`, { duration: 8000 });
                if (message) {
                    setTimeout(() => toast(message, { icon: 'ℹ️', duration: 10000 }), 1000);
                }
            } else {
                toast.error(errorMsg);
            }
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="spinner"></div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Borrowers',
            value: stats?.totalBorrowers || 0,
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            textColor: 'text-cyan-400',
        },
        {
            title: 'Overdue Borrowers',
            value: stats?.overdueBorrowers || 0,
            icon: AlertCircle,
            color: 'from-rose-500 to-pink-500',
            textColor: 'text-rose-400',
        },
        {
            title: 'Plan Accepted',
            value: stats?.plansAccepted || 0,
            icon: CheckCircle,
            color: 'from-emerald-500 to-teal-500',
            textColor: 'text-emerald-400',
        },
        {
            title: 'High Risk Customers',
            value: stats?.highRiskCount || 0,
            icon: Zap,
            color: 'from-yellow-500 to-orange-500',
            textColor: 'text-yellow-400',
        },
    ];

    const riskData = stats?.riskDistribution?.map(item => ({
        name: item._id,
        value: item.count,
    })) || [];

    const COLORS = {
        NORMAL_RISK: '#10b981', // Emerald
        MODERATE_RISK: '#06b6d4', // Cyan
        HIGH_RISK: '#8b5cf6', // Purple
        CRITICAL_RISK: '#f43f5e', // Rose
        PENDING: '#64748b', // Slate
    };

    return (
        <div className="space-y-8 animate-fade-in py-2">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Platform <span className="gradient-text">Overview</span>
                    </h1>
                    <p className="text-gray-400 font-medium mt-1">
                        AI-Powered loan recovery & risk analysis dashboard
                    </p>
                </div>

                <div className="flex items-center gap-3 glass px-5 py-2.5 rounded-2xl border border-white/5 shadow-glow-sm">
                    <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">System Status</span>
                        <span className="text-xs font-black text-emerald-400">OPERATIONAL</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.title}
                            className="glass-light rounded-3xl p-6 border border-white/5 hover:border-primary-500/30 transition-all duration-500 group relative overflow-hidden card-hover"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 blur-[50px] group-hover:opacity-10 transition-opacity`}></div>

                            <div className="flex items-center justify-between mb-6">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg shadow-black/20`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white/5 px-2 py-1 rounded-lg">
                                    LIVE DATA
                                </div>
                            </div>

                            <div className="relative">
                                <p className="text-4xl font-black text-white tracking-tighter mb-1">
                                    {stat.value}
                                </p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
                                    {stat.title}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions & Assignments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Admin Quick Actions */}
                {user?.role === 'admin' && (
                    <>
                        <div className="lg:col-span-1 glass rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-[80px]"></div>

                            <div className="relative">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-sm">
                                        <Upload className="w-5 h-5 text-white" />
                                    </div>
                                    Quick Actions
                                </h2>

                                <div className="group border-2 border-dashed border-white/10 hover:border-cyan-400/50 rounded-[2rem] p-8 transition-all duration-300 bg-white/5">
                                    <div className="text-center mb-6">
                                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <Target className="w-7 h-7 text-cyan-400" />
                                        </div>
                                        <h3 className="font-bold text-lg text-white">Upload Data</h3>
                                        <p className="text-sm text-gray-400 mt-1">Excel sheets (.xlsx, .xls)</p>
                                    </div>

                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleFileChange}
                                        id="file-upload"
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="block w-full text-center py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-all font-bold text-gray-300 hover:text-white text-sm"
                                    >
                                        {file ? file.name : 'Choose File'}
                                    </label>

                                    {file && (
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploading}
                                            className="mt-4 w-full bg-gradient-primary hover:shadow-glow-md text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {uploading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Zap className="w-4 h-4" />}
                                            {uploading ? 'Processing...' : 'Confirm Upload'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>


                    </>
                )}

                {/* Risk Distribution Chart */}
                <div className={`${user?.role === 'admin' ? 'lg:col-span-2' : 'lg:col-span-3'} glass rounded-[2.5rem] p-8 border border-white/5`}>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            Risk Analysis Distribution
                        </h2>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="text-[10px] font-bold text-gray-400">STABLE</span>
                            </div>
                        </div>
                    </div>

                    {riskData.length > 0 ? (
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={riskData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {riskData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#64748b'} className="hover:opacity-80 transition-opacity" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: '#1e293b',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '1rem',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                            color: '#fff'
                                        }}
                                        itemStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Legend
                                        iconType="circle"
                                        layout="vertical"
                                        verticalAlign="middle"
                                        align="right"
                                        wrapperStyle={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[350px] flex items-center justify-center flex-col text-gray-500 gap-4">
                            <Target className="w-16 h-16 opacity-10" />
                            <p className="font-bold tracking-widest text-sm">NO DATA DETECTED</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Manager Assignments Grid */}
            {user?.role === 'manager' && (
                <div className="glass rounded-[2.5rem] p-8 border border-white/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                    <Calendar className="w-5 h-5 text-cyan-400" />
                                </div>
                                Recent Assignments
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">Review new recovery cases assigned for action</p>
                        </div>
                        <button
                            onClick={() => navigate('/borrowers')}
                            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all font-bold text-xs tracking-widest text-cyan-400"
                        >
                            VIEW DIRECTORY
                        </button>
                    </div>

                    {stats?.recentAssignments && stats.recentAssignments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {stats.recentAssignments.slice(0, 12).map((borrower) => (
                                <div
                                    key={borrower._id}
                                    className="glass-light rounded-[2rem] p-6 hover:border-primary-500/30 transition-all duration-300 relative group overflow-hidden border border-white/5"
                                >
                                    <div className="relative z-10 space-y-5">
                                        <div className="flex items-start justify-between">
                                            <div className="max-w-[70%]">
                                                <h3 className="text-lg font-bold text-white truncate">{borrower.customerName}</h3>
                                                <p className="text-[10px] font-black text-cyan-400/70 tracking-tighter uppercase">{borrower.loanId}</p>
                                            </div>
                                            <div className={`px-2.5 py-1.5 rounded-xl border ${borrower.riskLevel === 'CRITICAL_RISK' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                                borrower.riskLevel === 'HIGH_RISK' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                                                    borrower.riskLevel === 'MODERATE_RISK' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                } text-[9px] font-black tracking-widest uppercase`}>
                                                {borrower.riskLevel?.split('_')[0] || 'STABLE'}
                                            </div>
                                        </div>

                                        <div className="bg-dark-500/50 rounded-2xl p-4 space-y-3 border border-white/5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">Loan Total</span>
                                                <span className="text-white font-black">₹{borrower.loanAmount?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">Outstanding</span>
                                                <span className="text-rose-400 font-black">₹{borrower.outstandingBalance?.toLocaleString()}</span>
                                            </div>
                                            <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-500 text-[9px] font-bold uppercase tracking-widest">Days Overdue</span>
                                                    <span className={`text-xl font-black ${borrower.overdueDays > 60 ? 'text-rose-500' : 'text-yellow-500'}`}>
                                                        {borrower.overdueDays || 0}
                                                    </span>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center p-0.5">
                                                    <div className="w-full h-full rounded-full bg-dark-500 flex items-center justify-center text-[10px] font-black text-white">
                                                        {(borrower.overdueDays / 365 * 100).toFixed(0)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                                                <span className="text-gray-500 text-[9px] font-bold uppercase block mb-1">Due Date</span>
                                                <span className="text-white text-[11px] font-bold">
                                                    {new Date(borrower.dueDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                                                <span className="text-gray-500 text-[9px] font-bold uppercase block mb-1">Status</span>
                                                <span className="text-cyan-400 text-[11px] font-bold uppercase tracking-tighter">
                                                    {borrower.emiPlanStatus || 'PENDING'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-dark-400/30 rounded-[2.5rem] border border-dashed border-white/10">
                            <Activity className="w-16 h-16 text-gray-700 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-bold text-gray-500">No Assignments Found</p>
                            <p className="text-gray-600 text-sm mt-1">Assignments will appear here once allocated by admin.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Admin Live Tracker Table */}
            {user?.role === 'admin' && (
                <div className="glass rounded-[2.5rem] p-8 border border-white/5 overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                                <Activity className="w-5 h-5 text-primary-400" />
                            </div>
                            Live Recovery Tracker
                        </h2>
                        <div className="animate-pulse flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow-sm"></span>
                            <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">Streaming live</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto -mx-8">
                        <table className="min-w-full text-sm">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Borrower Identity</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Assigned Manager</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Risk Level</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Plan Status</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats?.recentAssignments?.map((borrower) => (
                                    <tr key={borrower._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">{borrower.customerName}</div>
                                            <div className="text-[10px] font-bold text-gray-500 tracking-tighter">{borrower.loanId}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-primary-400">
                                                    {borrower.assignedManager?.name?.charAt(0) || 'M'}
                                                </div>
                                                <span className="font-semibold text-gray-300">
                                                    {borrower.assignedManager?.name || 'In Allocation'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg border uppercase tracking-widest ${borrower.riskLevel === 'CRITICAL_RISK' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                                borrower.riskLevel === 'HIGH_RISK' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                                                    borrower.riskLevel === 'MODERATE_RISK' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                                                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {borrower.riskLevel?.replace('_', ' ') || 'NORMAL'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${borrower.emiPlanStatus === 'accepted' ? 'bg-emerald-500 shadow-glow-sm' :
                                                    borrower.emiPlanStatus === 'rejected' ? 'bg-rose-500' :
                                                        borrower.emiPlanStatus === 'pending' ? 'bg-cyan-500 animate-pulse' :
                                                            'bg-slate-700'
                                                    }`}></div>
                                                <span className="font-bold text-xs uppercase tracking-tighter text-gray-400">
                                                    {borrower.emiPlanStatus || 'none'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-gray-500 hover:text-white transition-colors">
                                                <ArrowRight className="w-4 h-4 ml-auto" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
