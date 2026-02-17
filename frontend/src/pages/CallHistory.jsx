import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import {
    Phone,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    Calendar,
    User,
    Hash,
    Activity,
    ChevronRight,
    Search,
    Mic,
    MessageSquare,
    Zap
} from 'lucide-react';
import { format } from 'date-fns';

const CallHistory = () => {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCall, setSelectedCall] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchCalls();
    }, []);

    const fetchCalls = async () => {
        try {
            const response = await api.get('/calls');
            setCalls(response.data.data);
        } catch (error) {
            toast.error('Failed to load call history');
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'completed':
                return {
                    icon: CheckCircle,
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    label: 'Success'
                };
            case 'not_answered':
            case 'switched_off':
            case 'no_response':
                return {
                    icon: XCircle,
                    color: 'text-rose-400',
                    bg: 'bg-rose-500/10',
                    border: 'border-rose-500/20',
                    label: 'No Answer'
                };
            default:
                return {
                    icon: Clock,
                    color: 'text-gray-400',
                    bg: 'bg-white/5',
                    border: 'border-white/10',
                    label: 'Pending'
                };
        }
    };

    const filteredCalls = calls.filter(call =>
        call.borrower?.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        call.borrower?.loanId?.toLowerCase().includes(search.toLowerCase())
    );

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
                        Call <span className="gradient-text">Logs</span>
                    </h1>
                    <p className="text-gray-400 font-medium mt-1">AI-driven automated recovery call analysis</p>
                </div>

                <div className="flex items-center gap-3 glass px-5 py-2.5 rounded-2xl border border-white/5 shadow-glow-sm">
                    <Mic className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Sprints</span>
                        <span className="text-xs font-black text-white">{calls.length} Sessions</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Call List - 5 Columns */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="glass rounded-[2rem] p-2 border border-white/5 shadow-xl">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Filter records..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-dark-500/50 border-none rounded-[1.5rem] focus:ring-1 focus:ring-primary-500 transition-all duration-300 outline-none font-bold text-white text-sm placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl h-[calc(100vh-320px)] flex flex-col">
                        <div className="p-6 border-b border-white/5 bg-white/5">
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Session feed</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <div className="divide-y divide-white/5">
                                {filteredCalls.map((call) => {
                                    const config = getStatusConfig(call.status);
                                    const StatusIcon = config.icon;
                                    return (
                                        <div
                                            key={call._id}
                                            onClick={() => setSelectedCall(call)}
                                            className={`p-6 cursor-pointer hover:bg-white/5 transition-all duration-300 group ${selectedCall?._id === call._id ? 'bg-gradient-to-r from-primary-500/10 to-transparent border-l-4 border-l-primary-500' : 'border-l-4 border-l-transparent'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className={`w-8 h-8 rounded-xl ${config.bg} flex items-center justify-center border ${config.border}`}>
                                                            <StatusIcon className={`w-4 h-4 ${config.color}`} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white group-hover:text-cyan-400 transition-colors whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                                                {call.borrower?.customerName}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">ID: {call.borrower?.loanId}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 pl-11">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                                                            <Calendar className="w-3 h-3" />
                                                            {format(new Date(call.callTimestamp), 'MMM dd')}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                                                            <Clock className="w-3 h-3" />
                                                            {format(new Date(call.callTimestamp), 'hh:mm a')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2 px-1">
                                                    <span className="text-[9px] font-black text-primary-500/80 uppercase tracking-widest bg-primary-500/5 px-2 py-1 rounded-lg border border-primary-500/10 leading-none">
                                                        ATT {call.attemptNumber}
                                                    </span>
                                                    {selectedCall?._id === call._id && (
                                                        <ChevronRight className="w-4 h-4 text-primary-500 animate-pulse" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transcript Viewer - 7 Columns */}
                <div className="lg:col-span-7">
                    <div className="glass rounded-[2.5rem] border border-white/5 shadow-2xl h-full flex flex-col overflow-hidden">
                        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-primary-600/5 to-transparent">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-dark-500 flex items-center justify-center border border-white/5">
                                        <FileText className="w-6 h-6 text-primary-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white tracking-tight">Technical Transcript</h2>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Automated transcription active</p>
                                    </div>
                                </div>
                                {selectedCall && (
                                    <div className="flex items-center gap-2 bg-dark-500/50 px-4 py-2 rounded-xl border border-white/5">
                                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-xs font-black text-white uppercase">{selectedCall.duration}s Session</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedCall ? (
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-dark-500/20">
                                {/* Metadata Ribbon */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-8 border-b border-white/5">
                                    <div className="bg-dark-500/50 p-4 rounded-2xl border border-white/5">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Status</span>
                                        <span className={`text-xs font-black uppercase tracking-widest ${getStatusConfig(selectedCall.status).color}`}>
                                            {selectedCall.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="bg-dark-500/50 p-4 rounded-2xl border border-white/5">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Exposure</span>
                                        <span className="text-xs font-black text-white">₹{selectedCall.borrower?.loanAmount?.toLocaleString()}</span>
                                    </div>
                                    <div className="bg-dark-500/50 p-4 rounded-2xl border border-white/5">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Attempt</span>
                                        <span className="text-xs font-black text-white">Sequence {selectedCall.attemptNumber}</span>
                                    </div>
                                    <div className="bg-dark-500/50 p-4 rounded-2xl border border-white/5">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Identifier</span>
                                        <span className="text-xs font-black text-cyan-400 uppercase">#{selectedCall.borrower?.loanId}</span>
                                    </div>
                                </div>

                                {selectedCall.transcript ? (
                                    <div className="space-y-6 relative">
                                        {/* Timeline Line */}
                                        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-primary-500/50 via-cyan-500/30 to-primary-500/50"></div>

                                        {selectedCall.transcript.split('\n').map((line, idx) => {
                                            const isAI = line.startsWith('AI:');
                                            const content = line.replace(/^(AI:|Customer:)/, '').trim();
                                            return (
                                                <div key={idx} className="flex gap-6 items-start relative z-10">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${isAI ? 'bg-gradient-primary' : 'bg-dark-400 border border-white/10'
                                                        }`}>
                                                        {isAI ? <Zap className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-gray-400" />}
                                                    </div>
                                                    <div className={`flex-1 p-6 rounded-[2rem] border relative ${isAI ? 'bg-primary-500/10 border-primary-500/20 rounded-tl-none' : 'bg-white/5 border-white/10 rounded-tl-none backdrop-blur-sm'
                                                        }`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isAI ? 'text-primary-400' : 'text-gray-500'}`}>
                                                                {isAI ? 'EMPATH RECOVERY AI' : 'CUSTOMER RESPONSE'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-medium leading-relaxed text-gray-200">
                                                            {content}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                                        <MessageSquare className="w-12 h-12 text-gray-600 mb-4" />
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No Transcript Available for this Session</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-dark-500/10">
                                <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center mb-8 border border-white/5 shadow-inner">
                                    <Activity className="w-10 h-10 text-gray-700 animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Intelligence Terminal</h3>
                                <p className="text-gray-500 font-medium max-w-sm">Select a call session from the feed to analyze transcripts and AI behavioral insights.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallHistory;
