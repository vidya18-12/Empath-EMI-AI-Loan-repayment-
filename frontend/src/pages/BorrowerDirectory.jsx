import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import {
    Search,
    AlertCircle,
    ChevronRight,
    Filter,
    MessageSquare,
    Send,
    X,
    UserPlus,
    Activity,
    Clock,
    TrendingUp,
    ArrowRight,
    Shield,
    Phone,
    Zap,
    Scale,
    Users,
    MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BorrowerDirectory = () => {
    const [borrowers, setBorrowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedBorrower, setSelectedBorrower] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const chatEndRef = useRef(null);
    const { user } = useAuth();
    const [managers, setManagers] = useState([]);
    const [assigningId, setAssigningId] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [fieldExecutives, setFieldExecutives] = useState([]);

    useEffect(() => {
        fetchBorrowers();
    }, []);

    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'manager')) {
            fetchManagers();
            fetchFieldExecutives();
        }
    }, [user]);

    useEffect(() => {
        let interval;
        if (isChatOpen && selectedBorrower) {
            fetchMessages();
            interval = setInterval(fetchMessages, 5000);
        }
        return () => clearInterval(interval);
    }, [isChatOpen, selectedBorrower]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchBorrowers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/borrowers');
            setBorrowers(response.data.data);
        } catch (error) {
            toast.error('Failed to load borrowers');
        } finally {
            setLoading(false);
        }
    };

    const fetchManagers = async () => {
        try {
            const response = await api.get('/auth/managers');
            const managersList = response.data.data;
            setManagers(managersList);
        } catch (error) {
            console.error('Failed to fetch managers');
        }
    };

    const fetchFieldExecutives = async () => {
        try {
            const response = await api.get('/auth/field-executives');
            setFieldExecutives(response.data.data);
        } catch (error) {
            console.error('Failed to fetch field executives');
        }
    };

    const handleAssign = async (borrowerId, managerId) => {
        try {
            await api.put(`/borrowers/${borrowerId}/assign`, { managerId });
            toast.success('Borrower assigned successfully');
            fetchBorrowers();
            setAssigningId(null);
        } catch (error) {
            toast.error('Assignment failed');
        }
    };

    const handleAssignField = async (borrowerId, fieldExecutiveId) => {
        try {
            await api.put(`/borrowers/${borrowerId}/assign-field`, { fieldExecutiveId });
            toast.success('Field Executive assigned');
            fetchBorrowers();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Assignment failed');
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await api.get(`/messages/${selectedBorrower._id}`);
            setMessages(response.data.data);

            if (user?.role === 'manager') {
                const recRes = await api.get(`/borrowers/${selectedBorrower._id}/latest-recommendation`);
                setRecommendation(recRes.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch messages');
        }
    };

    const handleGenerateEMI = async () => {
        try {
            setIsGenerating(true);
            const response = await api.get(`/borrowers/${selectedBorrower._id}/suggest-emi`);
            setRecommendation({
                ...response.data.data,
                status: 'Draft',
                riskLevel: selectedBorrower.riskLevel
            });
        } catch (error) {
            toast.error('Failed to generate EMI suggestion');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendRecommendation = async () => {
        try {
            await api.post(`/borrowers/${selectedBorrower._id}/recommend-emi`, recommendation);
            toast.success('Recommendation sent to borrower');
            fetchMessages();
        } catch (error) {
            toast.error('Failed to send recommendation');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await api.post('/messages', {
                recipientId: selectedBorrower._id,
                content: newMessage
            });
            setNewMessage('');
            fetchMessages();
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    const openChat = (borrower) => {
        setSelectedBorrower(borrower);
        setIsChatOpen(true);
        setMessages([]);
    };

    const filteredBorrowers = borrowers.filter(
        (b) =>
            b.customerName.toLowerCase().includes(search.toLowerCase()) ||
            b.loanId.toLowerCase().includes(search.toLowerCase())
    );

    const getRiskBadge = (risk) => {
        const colors = {
            NORMAL_RISK: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            MODERATE_RISK: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            HIGH_RISK: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            CRITICAL_RISK: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            PENDING: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
        };
        return colors[risk] || colors.PENDING;
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Borrower <span className="gradient-text">Directory</span>
                    </h1>
                    <p className="text-gray-400 font-medium mt-1">Manage and monitor recovery portfolio in real-time</p>
                </div>

                <div className="flex items-center gap-3 glass px-5 py-2.5 rounded-2xl border border-white/5 shadow-glow-sm">
                    <Users className="w-5 h-5 text-primary-400" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Records</span>
                        <span className="text-xs font-black text-white">{borrowers.length}</span>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="glass rounded-[2.5rem] p-2 border border-white/5 shadow-xl">
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Quick search by name, loan ID, or identifiers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-dark-500/50 border-none rounded-[2rem] focus:ring-1 focus:ring-primary-500 transition-all duration-300 outline-none font-bold text-white placeholder:text-gray-600"
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Customer Identity</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Loan Exposure</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Address</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">EMI Details</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Risk Assessment</th>
                                {user?.role === 'admin' ? (
                                    <>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Internal Assignment</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Field Deployment</th>
                                    </>
                                ) : (
                                    <th className="px-8 py-6 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredBorrowers.map((borrower) => (
                                <tr key={borrower._id} className="group hover:bg-white/5 transition-all duration-200 cursor-pointer" onClick={() => user?.role === 'manager' && openChat(borrower)}>
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">{borrower.customerName}</div>
                                        <div className="text-[11px] font-bold text-gray-500 mt-1 flex items-center gap-1.5 uppercase tracking-tighter">
                                            <Phone className="w-3 h-3 text-primary-500/50" />
                                            {borrower.phoneNumber}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-black text-white">₹{borrower.loanAmount.toLocaleString('en-IN')}</div>
                                        <div className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">ID: {borrower.loanId}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-white group-hover:text-cyan-400 transition-colors uppercase text-xs">{borrower.address || 'N/A'}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-black text-white">₹{borrower.emiAmount?.toLocaleString('en-IN') || 0}</div>
                                        <div className={`flex items-center gap-1 mt-1 text-[9px] font-black uppercase ${borrower.isOverdue ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            <Clock className="w-3 h-3" />
                                            {borrower.daysPastDue || 0} DPD
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 text-[9px] font-black rounded-lg border uppercase tracking-widest ${getRiskBadge(borrower.riskLevel)}`}>
                                            {borrower.riskLevel.replace('_', ' ')}
                                        </span>
                                    </td>
                                    {user?.role === 'admin' ? (
                                        <>
                                            <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                                                <div className="relative max-w-[180px]">
                                                    <select
                                                        className="w-full bg-dark-400/50 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-gray-300 outline-none focus:border-primary-500 appearance-none cursor-pointer"
                                                        value={borrower.assignedManager?._id || borrower.assignedManager || (managers.length > 0 ? managers[0]._id : '')}
                                                        onChange={(e) => handleAssign(borrower._id, e.target.value)}
                                                    >
                                                        {managers.map(m => (
                                                            <option key={m._id} value={m._id} className="bg-dark-500 text-white">{m.name}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <UserPlus className="w-3.5 h-3.5 text-gray-500" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                                                {['HIGH_RISK', 'CRITICAL_RISK'].includes(borrower.riskLevel) ? (
                                                    <div className="relative max-w-[180px]">
                                                        <select
                                                            className="w-full bg-dark-400/50 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-gray-300 outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                                                            value={borrower.assignedFieldExecutive?._id || borrower.assignedFieldExecutive || ''}
                                                            onChange={(e) => handleAssignField(borrower._id, e.target.value)}
                                                        >
                                                            <option value="" className="bg-dark-500 text-white">Select Executive</option>
                                                            {fieldExecutives.map(fe => (
                                                                <option key={fe._id} value={fe._id} className="bg-dark-500 text-white">{fe.name}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                            <MapPin className="w-3.5 h-3.5 text-gray-500" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-gray-600 uppercase italic">Not Applicable</span>
                                                )}
                                            </td>
                                        </>
                                    ) : (
                                        <td className="px-8 py-6 text-right">
                                            <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-gradient-primary text-gray-400 hover:text-white flex items-center justify-center transition-all group-hover:shadow-glow-sm ml-auto">
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Chat Drawer Overlay */}
            {isChatOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[55] transition-opacity duration-500"
                        onClick={() => setIsChatOpen(false)}
                    />
                    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] glass z-[60] flex flex-col border-l border-white/10 animate-slide-in shadow-2xl overflow-hidden">
                        {/* Drawer Header Area */}
                        <div className="p-8 pb-6 border-b border-white/5 bg-gradient-to-r from-primary-600/10 to-transparent">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-primary p-0.5 shadow-glow-sm">
                                        <div className="w-full h-full rounded-2xl bg-dark-500 flex items-center justify-center">
                                            <span className="text-xl font-black text-white">
                                                {selectedBorrower?.customerName?.charAt(0)}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tight">{selectedBorrower?.customerName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{selectedBorrower?.loanId}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                            <span className="text-[10px] font-bold text-gray-500">EMI Recovery Terminal</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => {
                                    setIsChatOpen(false);
                                    setRecommendation(null);
                                }} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Risk Status in Header */}
                            <div className="flex items-center gap-3 bg-dark-500/50 p-4 rounded-2xl border border-white/5">
                                <Shield className="w-5 h-5 text-primary-400" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Risk Exposure</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${getRiskBadge(selectedBorrower?.riskLevel)}`}>
                                            {selectedBorrower?.riskLevel?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div className={`h-full rounded-full ${selectedBorrower?.riskLevel === 'CRITICAL_RISK' ? 'w-full bg-rose-500' :
                                            selectedBorrower?.riskLevel === 'HIGH_RISK' ? 'w-3/4 bg-orange-500' :
                                                selectedBorrower?.riskLevel === 'MODERATE_RISK' ? 'w-1/2 bg-cyan-500' :
                                                    'w-1/4 bg-emerald-500'
                                            }`}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recommendation Terminal - AI Powered */}
                        {user?.role === 'manager' && (
                            <div className="p-6 bg-dark-400/30 border-b border-white/5">
                                <div className="flex items-center gap-2 mb-4 px-1">
                                    <Zap className="w-4 h-4 text-cyan-400" />
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">AI Resolution Suite</h4>
                                </div>

                                {selectedBorrower?.riskLevel !== 'PENDING' && (
                                    <>
                                        {!recommendation ? (
                                            <button
                                                onClick={handleGenerateEMI}
                                                disabled={isGenerating}
                                                className="w-full bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10 rounded-2xl p-4 py-6 transition-all group flex flex-col items-center gap-3 border-dashed hover:border-cyan-400/50"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Activity className={`w-6 h-6 ${isGenerating ? 'animate-pulse' : ''}`} />
                                                </div>
                                                <span className="text-xs font-black tracking-widest uppercase">
                                                    {isGenerating ? 'Synthesizing Data...' : 'Generate Optimized EMI Plan'}
                                                </span>
                                            </button>
                                        ) : (
                                            <div className="glass-light rounded-3xl p-6 border border-cyan-400/30 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 rounded-full blur-2xl -mr-12 -mt-12"></div>

                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <h5 className="text-sm font-bold text-white tracking-tight">
                                                            {recommendation.riskLevel?.includes('Auto-Revised') ? 'Proposed Recovery Plan B' : 'AI Strategic Recommendation'}
                                                        </h5>
                                                        <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter">Verified Financial Strategy</p>
                                                    </div>
                                                    <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${recommendation.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                        recommendation.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                                            'bg-white/5 text-gray-400 border border-white/10'
                                                        }`}>
                                                        {recommendation.status}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-6">
                                                    <div className="bg-dark-500/50 p-4 rounded-2xl border border-white/5">
                                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Target EMI</span>
                                                        <span className="text-xl font-black text-white">₹{recommendation.suggestedEMI?.toLocaleString()}</span>
                                                    </div>
                                                    <div className="bg-dark-500/50 p-4 rounded-2xl border border-white/5">
                                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Tenure Shift</span>
                                                        <span className="text-xl font-black text-cyan-400">+{recommendation.extendedTenure} MO</span>
                                                    </div>
                                                </div>

                                                {recommendation.status === 'Draft' && (
                                                    <button
                                                        onClick={handleSendRecommendation}
                                                        className="w-full bg-gradient-primary hover:shadow-glow-md text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 translate-y-0 hover:-translate-y-0.5"
                                                    >
                                                        Deploy Official Offer
                                                        <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Secure Messaging Terminal */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-dark-500/20">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex flex-col ${msg.senderModel === 'Manager' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] p-5 rounded-[1.8rem] relative group border ${msg.senderModel === 'Manager'
                                        ? 'bg-gradient-primary text-white border-white/10 rounded-tr-none shadow-glow-sm'
                                        : 'bg-white/5 text-gray-200 border-white/5 rounded-tl-none backdrop-blur-sm'
                                        }`}>
                                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 px-1">
                                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {msg.senderModel === 'Borrower' && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-dark-400 rounded-full border border-white/5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${msg.sentiment === 'High' ? 'bg-rose-500' :
                                                    msg.sentiment === 'Moderate' ? 'bg-orange-500' :
                                                        'bg-emerald-500'
                                                    }`}></div>
                                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
                                                    {msg.sentiment || 'NEUTRAL'} Stress
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-6 bg-dark-500/50 border-t border-white/5 backdrop-blur-xl">
                            <div className="flex gap-4 items-center bg-white/5 p-2.5 rounded-[1.8rem] border border-white/10 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all shadow-inner">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Execute encrypted message..."
                                    className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-sm font-bold text-white placeholder:text-gray-600"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="w-12 h-12 bg-gradient-primary rounded-2xl text-white hover:shadow-glow-md disabled:opacity-20 disabled:hover:shadow-none transition-all flex items-center justify-center shrink-0"
                                >
                                    <Send className="w-5 h-5 translate-x-0.5" />
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default BorrowerDirectory;
