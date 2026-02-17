import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import {
    MessageSquare,
    Send,
    Bot,
    TrendingUp,
    Users,
    CheckCircle,
    Clock,
    Zap,
    Activity,
    Search,
    X,
    Shield,
    ChevronRight,
    Sparkles,
    Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AIChatbot = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalConversations: 0,
        messagesCreated: 0,
        plansSuggested: 0,
        plansAccepted: 0
    });

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/chatbot/conversations');
            setConversations(response.data.data || []);

            const totalConversations = response.data.count || 0;
            const plansSuggested = response.data.data?.filter(c => c.conversationState === 'plan_suggested').length || 0;

            setStats({
                totalConversations,
                messagesCreated: totalConversations,
                plansSuggested,
                plansAccepted: 0
            });
        } catch (error) {
            console.error('Failed to fetch conversations');
        } finally {
            setLoading(false);
        }
    };

    const handleStartOutreach = async () => {
        try {
            setLoading(true);
            const response = await api.post('/chatbot/start', {
                minOverdueDays: 7,
                limit: 50
            });

            const contacted = response.data.data.borrowersContacted || [];
            const successNames = contacted.filter(r => r.messageSent).map(r => r.borrowerName);
            const failures = contacted.filter(r => !r.messageSent);

            if (successNames.length > 0) {
                toast.success(`Automated outreach initiated for: ${successNames.join(', ')}`, {
                    duration: 5000,
                    icon: '🚀'
                });
            }

            if (failures.length > 0) {
                const firstError = failures[0].error || 'Unknown error';
                toast.error(`Failed to message ${failures.length} borrower(s): ${firstError}`, {
                    duration: 6000
                });
            }

            if (successNames.length === 0 && failures.length === 0) {
                toast.success('Outreach check completed. No overdue borrowers found.');
            }

            // Immediate refresh and then another after a short delay for DB consistency
            fetchConversations();
            setTimeout(fetchConversations, 1000);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to start automated outreach');
        } finally {
            setLoading(false);
        }
    };

    const [selectedBorrower, setSelectedBorrower] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const chatEndRef = React.useRef(null);

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

    const fetchMessages = async () => {
        try {
            const response = await api.get(`/messages/${selectedBorrower.borrowerId}`);
            setMessages(response.data.data);
        } catch (error) {
            console.error('Failed to fetch messages');
        }
    };

    const openChat = (conversation) => {
        setSelectedBorrower(conversation);
        setIsChatOpen(true);
        setMessages([]);
    };

    const handleDeleteSession = async (e, borrowerId) => {
        e.stopPropagation(); // Prevent opening chat
        if (!window.confirm('Are you sure you want to delete this session? This will remove all automated messages for this borrower.')) {
            return;
        }

        try {
            setLoading(true);
            await api.delete(`/chatbot/conversation/${borrowerId}`);
            toast.success('Session deleted successfully');
            fetchConversations();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete session');
        } finally {
            setLoading(false);
        }
    };

    const getStateConfig = (state) => {
        switch (state) {
            case 'initiated':
                return { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' };
            case 'plan_suggested':
                return { color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/20' };
            case 'plan_accepted':
                return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
            case 'plan_rejected':
                return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
            case 'resolved':
                return { color: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10' };
            default:
                return { color: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10' };
        }
    };

    return (
        <div className="space-y-8 animate-fade-in py-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        AI Chatbot <span className="gradient-text">Terminal</span>
                    </h1>
                    <p className="text-gray-400 font-medium mt-1">Autonomous borrower engagement & neural EMI restructuring</p>
                </div>

                <div className="flex items-center gap-3 bg-dark-500/50 px-5 py-3 rounded-2xl border border-white/5 shadow-glow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow-sm animate-pulse"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Neural Agent Online</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Neural Sessions', value: stats.totalConversations, icon: MessageSquare, color: 'from-cyan-500/20 to-blue-500/20', textColor: 'text-cyan-400' },
                    { label: 'Outreach Pulse', value: stats.messagesCreated, icon: Send, color: 'from-primary-500/20 to-purple-500/20', textColor: 'text-primary-400' },
                    { label: 'AI Proposals', value: stats.plansSuggested, icon: Sparkles, color: 'from-purple-500/20 to-rose-500/20', textColor: 'text-purple-400' },
                    { label: 'Acceptance Rate', value: '42%', icon: CheckCircle, color: 'from-emerald-500/20 to-cyan-500/20', textColor: 'text-emerald-400' }
                ].map((stat, i) => (
                    <div key={i} className="glass rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className={`text-3xl font-black ${stat.textColor} tracking-tight`}>{stat.value}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass rounded-[2.5rem] p-8 border border-white/5 bg-gradient-to-r from-primary-600/10 to-transparent">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-sm">
                            <Bot className="w-9 h-9 text-white animate-float" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">Mass Borrower Outreach</h2>
                            <p className="text-sm font-medium text-gray-400">Deploy AI agents to target borrowers overdue by 7+ days</p>
                        </div>
                    </div>
                    <button
                        onClick={handleStartOutreach}
                        disabled={loading}
                        className="w-full md:w-auto bg-white text-black font-black py-4 px-10 rounded-2xl text-xs uppercase tracking-widest transition-all hover:-translate-y-1 hover:shadow-glow-sm active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Initializing...' : 'Launch Automated Sequence'}
                    </button>
                </div>
            </div>

            <div className="glass rounded-[2.5rem] border border-white/5 p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <Activity className="w-6 h-6 text-primary-400" />
                        Live Neural Feed
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Filter sessions..."
                            className="bg-dark-500/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-white outline-none focus:border-primary-500 w-48 transition-all"
                        />
                    </div>
                </div>

                {loading && conversations.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="spinner mx-auto"></div>
                        <p className="text-gray-500 font-bold mt-4 uppercase text-[10px] tracking-widest">Synchronizing Logs...</p>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-20 bg-dark-500/20 rounded-[2rem] border border-dashed border-white/5">
                        <Bot className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Diagnostic: No active sessions detected</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {conversations.map((conversation) => {
                            const config = getStateConfig(conversation.conversationState);
                            return (
                                <div
                                    key={conversation.borrowerId}
                                    onClick={() => openChat(conversation)}
                                    className="glass-light rounded-[2rem] p-6 border border-white/5 hover:border-primary-500/30 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-500/10 transition-colors"></div>

                                    <div className="flex items-start justify-between mb-4 relative z-10">
                                        <div className="flex-1">
                                            <p className="font-black text-white group-hover:text-primary-400 transition-colors tracking-tight">
                                                {conversation.borrowerName}
                                            </p>
                                            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">
                                                {conversation.loanId}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest ${config.bg} ${config.color} border ${config.border}`}>
                                                {conversation.conversationState?.replace('_', ' ')}
                                            </span>
                                            <button
                                                onClick={(e) => handleDeleteSession(e, conversation.borrowerId)}
                                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                                                title="Delete Session"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                    {conversation.overdueDays > 0 && (
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${conversation.overdueDays > 60 ? 'bg-rose-500' : 'bg-primary-500'}`} style={{ width: `${Math.min(100, (conversation.overdueDays / 90) * 100)}%` }}></div>
                                            </div>
                                            <span className="text-[9px] font-black text-gray-500 uppercase">{conversation.overdueDays}D</span>
                                        </div>
                                    )}

                                    <div className="bg-dark-500/30 rounded-xl p-4 mb-4 border border-white/5">
                                        <p className="text-[11px] text-gray-400 line-clamp-2 italic font-medium leading-relaxed">
                                            "{conversation.lastMessageText}"
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between relative z-10 pt-2">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                            <Clock className="w-3 h-3" />
                                            <span>{new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-primary-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* AI Chat Drawer */}
            {isChatOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] transition-opacity duration-300"
                        onClick={() => setIsChatOpen(false)}
                    />
                    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] glass z-[101] flex flex-col border-l border-white/10 animate-slide-in shadow-2xl overflow-hidden">
                        <div className="p-8 pb-6 border-b border-white/5 bg-gradient-to-r from-primary-600/10 to-transparent">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-primary p-0.5 shadow-glow-sm">
                                        <div className="w-full h-full rounded-2xl bg-dark-500 flex items-center justify-center">
                                            <span className="text-xl font-black text-white">
                                                {selectedBorrower?.borrowerName?.charAt(0)}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tight">{selectedBorrower?.borrowerName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{selectedBorrower?.loanId}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${getStateConfig(selectedBorrower?.conversationState).color}`}>
                                                {selectedBorrower?.conversationState?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setIsChatOpen(false)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-dark-500/20">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="spinner mb-4"></div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Decrypting Logs...</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isBorrower = msg.senderModel === 'Borrower';
                                    return (
                                        <div
                                            key={idx}
                                            className={`flex flex-col ${isBorrower ? 'items-start' : 'items-end'}`}
                                        >
                                            <div className={`max-w-[85%] p-5 rounded-[2rem] shadow-sm text-sm font-medium leading-relaxed relative ${isBorrower
                                                ? 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none'
                                                : 'bg-primary-600/20 text-white border border-primary-500/20 rounded-tr-none'
                                                }`}>
                                                {msg.content}

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
                                                {msg.metadata?.plansOffered && (
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

                                                {msg.isAutomated && msg.senderModel === 'Manager' && (
                                                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                                                        <Bot className="w-3.5 h-3.5 text-primary-400" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary-400/70">Neural Autonomous Response</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`flex items-center gap-2 mt-2 px-1 ${isBorrower ? 'flex-row' : 'flex-row-reverse'}`}>
                                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                                    {isBorrower ? 'BORROWER' : 'AI NEURAL AGENT'}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-6 border-t border-white/5 bg-dark-500/50">
                            <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow-sm"></div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Neural Monitoring Active</p>
                                </div>
                                <Shield className="w-4 h-4 text-gray-600" />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AIChatbot;
