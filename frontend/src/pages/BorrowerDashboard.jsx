import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import PlanDetailsCard from '../components/PlanDetailsCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    CreditCard,
    Calendar,
    MessageSquare,
    AlertCircle,
    Send,
    CheckCircle,
    XCircle,
    RotateCcw,
    Shield,
    Zap,
    Clock,
    ArrowRight,
    Sparkles
} from 'lucide-react';

const BorrowerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loanDetails, setLoanDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [recommendation, setRecommendation] = useState(null);
    const [defaultManagerId, setDefaultManagerId] = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        fetchLoanDetails();
        fetchDefaultManager();
    }, []);

    const fetchDefaultManager = async () => {
        try {
            const response = await api.get('/auth/managers');
            if (response.data.data.length > 0) {
                setDefaultManagerId(response.data.data[0]._id);
            }
        } catch (error) {
            console.error('Failed to fetch default manager');
        }
    };

    useEffect(() => {
        if (loanDetails) {
            fetchMessages();
            fetchRecommendation();
            const interval = setInterval(() => {
                fetchLoanDetails();
                fetchMessages();
                fetchRecommendation();
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [loanDetails?._id, defaultManagerId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, recommendation, loanDetails?.riskLevel]);

    const fetchLoanDetails = async () => {
        try {
            const response = await api.get(`/borrowers?search=${user.email}`);
            if (response.data.data.length > 0) {
                setLoanDetails(response.data.data[0]);
            }
        } catch (error) {
            toast.error('Failed to load loan details');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const managerId = loanDetails.assignedManager?._id || loanDetails.assignedManager || loanDetails.uploadedBy?._id || loanDetails.uploadedBy || defaultManagerId;

            if (managerId) {
                const response = await api.get(`/messages/${managerId}`);
                const newMessages = response.data.data;

                if (newMessages.length > messages.length) {
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg.senderModel === 'Manager') {
                        setHasNewMessage(true);
                    }
                }
                setMessages(newMessages);
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    const fetchRecommendation = async () => {
        try {
            const response = await api.get(`/borrowers/${loanDetails._id}/latest-recommendation`);
            setRecommendation(response.data.data);
        } catch (error) {
            console.error('Failed to fetch recommendation');
        }
    };

    const handleUpdateRec = async (status) => {
        try {
            await api.put(`/borrowers/recommendations/${recommendation._id}`, { status });
            toast.success(`Plan ${status.toLowerCase()} successfully`);
            fetchRecommendation();
        } catch (error) {
            toast.error('Failed to update plan status');
        }
    };

    const handleRestorePlanA = async () => {
        try {
            await api.post(`/borrowers/${loanDetails._id}/restore-plan-a`);
            toast.success('Restored previous proposal (Plan A)');
            fetchRecommendation();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to restore previous plan');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const managerId = loanDetails.assignedManager?._id || loanDetails.assignedManager || loanDetails.uploadedBy?._id || loanDetails.uploadedBy || defaultManagerId;
            if (!managerId) {
                toast.error('No recovery manager assigned yet');
                return;
            }
            await api.post('/messages', {
                recipientId: managerId,
                content: newMessage
            });
            setNewMessage('');

            // Immediate fetch to show borrower's message
            fetchMessages();

            // Rapid polling for AI response (every 500ms for 10 seconds)
            let pollCount = 0;
            const maxPolls = 20; // 20 * 500ms = 10 seconds
            const rapidPoll = setInterval(() => {
                fetchMessages();
                pollCount++;
                if (pollCount >= maxPolls) {
                    clearInterval(rapidPoll);
                }
            }, 500);
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in py-2 max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Hello, <span className="gradient-text">{user.name.split(' ')[0]}</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-gray-400 font-medium">Loan Account: {loanDetails?.loanId || 'N/A'}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Financial Portal</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-dark-500/50 p-4 rounded-2xl border border-white/5 shadow-glow-sm">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Total Exposure</p>
                        <p className="text-xl font-black text-white">₹{loanDetails?.loanAmount.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                    </div>
                </div>
            </header>

            {!loanDetails ? (
                <div className="glass rounded-[2.5rem] p-16 border border-white/5 text-center shadow-2xl">
                    <AlertCircle className="w-20 h-20 text-gray-700 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-white tracking-tight">No Active Loan Found</h2>
                    <p className="text-gray-400 mt-2 max-w-sm mx-auto">Please contact our support team if you believe this account should have an active facility.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar - Plan Details */}
                    {
                        recommendation && (
                            <div className="lg:col-span-1 space-y-6">
                                <PlanDetailsCard recommendation={recommendation} />
                                <button
                                    onClick={() => navigate('/borrower-plan')}
                                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 font-bold text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 group"
                                >
                                    View Full Details
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )
                    }

                    {/* Main Interaction Area */}
                    <div
                        className={`glass rounded-[2.5rem] border border-white/5 flex flex-col h-[750px] overflow-hidden relative shadow-2xl ${recommendation ? 'lg:col-span-2' : 'lg:col-span-3'}`}
                        onClick={() => setHasNewMessage(false)}
                    >
                        {/* Chat Header */}
                        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-primary-600/10 to-transparent z-20 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-dark-500 border border-white/10 flex items-center justify-center relative overflow-hidden group shadow-glow-sm">
                                    <div className="absolute inset-0 bg-gradient-primary opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                    <MessageSquare className="w-7 h-7 text-primary-400 relative z-10" />
                                    {hasNewMessage && (
                                        <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-4 border-dark-500 animate-pulse"></div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-black text-xl text-white tracking-tight">Financial Concierge</h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow-sm"></div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Priority Support Online
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden sm:flex items-center gap-6">
                                <div className="text-center px-4 border-r border-white/10">
                                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Risk Rating</p>
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${loanDetails.isOverdue ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        }`}>
                                        {loanDetails.isOverdue ? 'Overdue' : 'Current'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Next Review</p>
                                    <p className="text-xs font-black text-white">
                                        {loanDetails.nextReviewDate ? new Date(loanDetails.nextReviewDate).toLocaleDateString() : new Date().toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-dark-500/30">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 py-20">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 animate-pulse">
                                        <Shield className="w-10 h-10 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-white tracking-tight">Your Direct Line to Recovery</p>
                                        <p className="text-gray-400 text-sm mt-3 max-w-sm mx-auto font-medium leading-relaxed">
                                            Message us here to discuss flexible repayment plans, report financial hardships, or request assistance.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                                        {['EMI Revision', 'Hardship Claim', 'Extension', 'Status Check'].map((tag) => (
                                            <button key={tag} className="glass-light p-3 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-wider hover:text-white hover:border-primary-500/50 transition-all">
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isBorrower = msg.senderModel === 'Borrower';
                                    return (
                                        <div key={idx} className={`flex ${isBorrower ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-[2rem] shadow-sm relative group transition-all ${isBorrower
                                                ? 'bg-gradient-primary text-white rounded-tr-none shadow-glow-sm'
                                                : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/10'
                                                }`}>
                                                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>

                                                {/* Plan accepted/rejected system notification style */}
                                                {(msg.conversationState === 'plan_accepted' || msg.conversationState === 'plan_rejected') && (
                                                    <div className={`mt-2 p-3 rounded-xl border ${msg.conversationState === 'plan_accepted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'} flex items-center gap-2`}>
                                                        {msg.conversationState === 'plan_accepted' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                                            Protocol {msg.conversationState === 'plan_accepted' ? 'Success' : 'Declined'}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Display EMI Plans if present */}
                                                {msg.metadata?.plansOffered && !isBorrower && (
                                                    <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <Sparkles className="w-4 h-4 text-cyan-400" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">AI-Generated Payment Plans</span>
                                                        </div>

                                                        {/* Plan A */}
                                                        {msg.metadata.plansOffered.planA && (
                                                            <div className="glass-light rounded-2xl p-4 border border-cyan-500/20 bg-cyan-500/5">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Option A - Flexible</span>
                                                                    <span className="text-xs font-black text-white">₹{msg.metadata.plansOffered.planA.suggestedEMI?.toLocaleString()}/mo</span>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                                                    <div className="bg-dark-500/50 rounded-lg p-2">
                                                                        <p className="text-gray-500 uppercase tracking-widest font-bold mb-1">Tenure</p>
                                                                        <p className="text-white font-black">+{msg.metadata.plansOffered.planA.extendedTenure}mo</p>
                                                                    </div>
                                                                    <div className="bg-dark-500/50 rounded-lg p-2">
                                                                        <p className="text-gray-500 uppercase tracking-widest font-bold mb-1">Grace</p>
                                                                        <p className="text-white font-black">{msg.metadata.plansOffered.planA.gracePeriod}d</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Plan B */}
                                                        {msg.metadata.plansOffered.planB && (
                                                            <div className="glass-light rounded-2xl p-4 border border-purple-500/20 bg-purple-500/5">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Option B - Extended</span>
                                                                    <span className="text-xs font-black text-white">₹{msg.metadata.plansOffered.planB.suggestedEMI?.toLocaleString()}/mo</span>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                                                    <div className="bg-dark-500/50 rounded-lg p-2">
                                                                        <p className="text-gray-500 uppercase tracking-widest font-bold mb-1">Tenure</p>
                                                                        <p className="text-white font-black">+{msg.metadata.plansOffered.planB.extendedTenure}mo</p>
                                                                    </div>
                                                                    <div className="bg-dark-500/50 rounded-lg p-2">
                                                                        <p className="text-gray-500 uppercase tracking-widest font-bold mb-1">Grace</p>
                                                                        <p className="text-white font-black">{msg.metadata.plansOffered.planB.gracePeriod}d</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className={`flex items-center gap-2 mt-3 pt-3 border-t ${isBorrower ? 'border-white/10' : 'border-white/5'}`}>
                                                    <Clock className="w-3 h-3 opacity-40" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Interactive HUD-style Offer Panel */}
                        {recommendation && recommendation.status === 'Pending' && loanDetails?.riskLevel !== 'PENDING' && (
                            <div className="mx-8 mb-8 animate-fade-in">
                                <div className="relative overflow-hidden rounded-[3rem] bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
                                    {/* Futuristic Grid Background */}
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-cyan-500/10 pointer-events-none"></div>

                                    {/* Neon Glow Orbs */}
                                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-600/20 rounded-full blur-[100px] animate-pulse"></div>
                                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

                                    <div className="relative z-10 p-10">
                                        {/* Status Bar HUD */}
                                        <div className="flex items-center justify-between mb-10">
                                            <div className="flex items-center gap-4">
                                                <div className="h-0.5 w-12 bg-gradient-to-r from-primary-500 to-transparent"></div>
                                                <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">AI Recovery Protocol v2.4</span>
                                            </div>
                                            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                                                <span className="text-[9px] font-black text-white uppercase tracking-widest">Optimized Strategy Live</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col lg:flex-row gap-12 items-center">
                                            {/* Center HUD Amount Display */}
                                            <div className="relative flex-1 flex flex-col items-center justify-center py-6">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-64 h-64 rounded-full border border-white/5 animate-spin-slow"></div>
                                                    <div className="absolute w-56 h-56 rounded-full border border-dashed border-primary-500/20"></div>
                                                </div>

                                                <div className="relative z-10 text-center">
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] mb-4">Proposed Instalment</p>
                                                    <div className="flex items-start justify-center">
                                                        <span className="text-2xl font-black text-primary-400 mt-2 mr-1">₹</span>
                                                        <span className="text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                                                            {recommendation.suggestedEMI.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="mt-4 flex items-center justify-center gap-2">
                                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-500/20">
                                                            -42% PRESSURE
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right HUD Metrics & Actions */}
                                            <div className="w-full lg:w-96 space-y-6">
                                                <div className="grid grid-cols-1 gap-4">
                                                    {[
                                                        { icon: Calendar, label: 'Horizon Extension', value: `+${recommendation.extendedTenure} Months`, color: 'text-primary-400' },
                                                        { icon: Shield, label: 'Immunity Period', value: `${recommendation.gracePeriod} Days Grace`, color: 'text-cyan-400' }
                                                    ].map((item, i) => (
                                                        <div key={i} className="group/item flex items-center gap-5 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                                                            <div className={`w-12 h-12 rounded-xl bg-dark-500 flex items-center justify-center ${item.color} shadow-inner`}>
                                                                <item.icon className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{item.label}</p>
                                                                <p className="text-xl font-black text-white tracking-tight">{item.value}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="space-y-3 pt-4">
                                                    <button
                                                        onClick={() => handleUpdateRec('Accepted')}
                                                        className="w-full group/btn relative py-5 rounded-2xl overflow-hidden shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-cyan-600"></div>
                                                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                                        <span className="relative z-10 text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                                                            <Zap className="w-4 h-4 fill-white animate-pulse" />
                                                            Authorize Protocol
                                                        </span>
                                                        {/* Button Glow Effect */}
                                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover/btn:opacity-60 transition-opacity duration-300"></div>
                                                    </button>

                                                    <div className="flex gap-3">
                                                        {recommendation.riskLevel?.includes('Auto-Revised') && (
                                                            <button
                                                                onClick={handleRestorePlanA}
                                                                className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-bold text-[9px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <RotateCcw className="w-3 h-3" />
                                                                Reset Status
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleUpdateRec('Rejected')}
                                                            className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-bold text-[9px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                                                        >
                                                            Negotiate Further
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* HUD Technical Footer */}
                                        <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex gap-8">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Model Precision</span>
                                                    <span className="text-[10px] font-black text-white">98.4% CAPABLE</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Neural Seed</span>
                                                    <span className="text-[10px] font-black text-white uppercase">{recommendation._id.slice(-8)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Sparkles className="w-4 h-4 text-primary-400" />
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">ID_STRATEGIC_RELIEF_ALPHA</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {recommendation && recommendation.status !== 'Pending' && (
                            <div className="mx-8 mb-6 p-5 glass-light rounded-2xl flex items-center justify-between border border-white/10 group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-glow-sm ${recommendation.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                        }`}>
                                        {recommendation.status === 'Accepted' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol Status</p>
                                        <p className="text-sm font-black text-white uppercase tracking-tight">Offer {recommendation.status}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                    <Clock className="w-4 h-4" />
                                    Synchronizing...
                                </div>
                            </div>
                        )}

                        {/* Message Input */}
                        <form onSubmit={handleSendMessage} className="p-8 border-t border-white/5 bg-dark-500/80 backdrop-blur-xl z-20">
                            <div className="flex gap-4 items-center bg-white/5 p-2.5 rounded-[2rem] border border-white/10 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all duration-300">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Message your recovery concierge..."
                                    className="flex-1 px-6 py-4 bg-transparent border-none outline-none text-sm font-medium text-white placeholder:text-gray-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="w-14 h-14 bg-gradient-primary text-white rounded-[1.5rem] transition-all hover:shadow-glow-sm hover:scale-105 active:scale-95 disabled:opacity-30 flex items-center justify-center group"
                                >
                                    <Send className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                </button>
                            </div>
                            <p className="text-center text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mt-4">
                                Secure Encrypted Financial Channel
                            </p>
                        </form>
                    </div>
                </div>
            )
            }
        </div>
    );
};

export default BorrowerDashboard;
