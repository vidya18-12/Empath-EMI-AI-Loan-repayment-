import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import {
    MapPin,
    Navigation,
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Users,
    Zap,
    TrendingUp,
    ChevronRight,
    Search,
    Filter,
    Camera,
    PhoneCall,
    ArrowRight,
    Play
} from 'lucide-react';

const FieldDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [borrowers, setBorrowers] = useState([]);

    const fetchAssignedBorrowers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/borrowers');
            setBorrowers(response.data.data);
        } catch (error) {
            toast.error('Failed to sync missions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignedBorrowers();
    }, []);

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/borrowers/${id}`, { callStatus: newStatus });
            toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
            fetchAssignedBorrowers();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const assignedMissions = borrowers.filter(b => b.callStatus === 'pending');
    const inProgressCalls = borrowers.filter(b => b.callStatus === 'in_progress');
    const completedMissions = borrowers.filter(b => b.callStatus === 'completed');

    return (
        <div className="space-y-8 animate-fade-in py-2">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Field <span className="gradient-text">Executive</span> HQ
                    </h1>
                    <p className="text-gray-400 font-medium mt-1">Real-time mission tracking & on-ground collection hub</p>
                </div>

                <div className="flex items-center gap-3 bg-dark-500/50 px-5 py-3 rounded-2xl border border-white/5 shadow-glow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow-sm animate-pulse"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Active On-Ground</span>
                </div>
            </div>

            {/* Workflow Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 1. Assigned Targets */}
                <div className="glass rounded-[2.5rem] p-8 border border-white/5 flex flex-col h-[700px]">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                            <Users className="w-6 h-6 text-cyan-400" />
                            Assigned Targets
                        </h2>
                        <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black rounded-lg border border-cyan-500/20 uppercase tracking-widest">
                            {assignedMissions.length} New
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {assignedMissions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30">
                                <AlertCircle className="w-12 h-12 mb-4" />
                                <p className="text-xs font-bold uppercase tracking-widest">No assigned targets</p>
                            </div>
                        ) : (
                            assignedMissions.map((b) => (
                                <div key={b._id} className="glass-light rounded-3xl p-6 border border-white/5 hover:border-cyan-500/30 transition-all group">
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors tracking-tight">{b.customerName}</h3>
                                            <div className="flex items-center gap-3 mt-1.5 min-h-[40px]">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                                    <MapPin className="w-4 h-4 text-cyan-500" />
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                                    {b.address || 'Address Not Provided'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                            <div className="text-left">
                                                <p className="text-sm font-black text-white uppercase">₹{b.outstandingBalance?.toLocaleString()}</p>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Risk Payload</p>
                                            </div>
                                            <button
                                                onClick={() => updateStatus(b._id, 'in_progress')}
                                                className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-glow-sm transition-all active:scale-95"
                                            >
                                                <Navigation className="w-3.5 h-3.5" />
                                                Field Dispatch
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 2. On-Ground Operations */}
                <div className="glass rounded-[2.5rem] p-8 border border-white/5 flex flex-col h-[700px] bg-gradient-to-b from-primary-900/10 to-transparent">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                            <Zap className="w-6 h-6 text-primary-400" />
                            On-Ground Ops
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Active Search</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {inProgressCalls.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30">
                                <MapPin className="w-12 h-12 mb-4" />
                                <p className="text-xs font-bold uppercase tracking-widest">No deployed units</p>
                            </div>
                        ) : (
                            inProgressCalls.map((b) => (
                                <div key={b._id} className="glass-light rounded-3xl p-6 border border-primary-500/30 bg-primary-500/5 shadow-glow-sm transition-all animate-pulse-subtle">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-black text-white tracking-tight">{b.customerName}</h3>
                                                <p className="text-[11px] font-bold text-primary-400 flex items-center gap-2 mt-1 uppercase tracking-widest">
                                                    <Clock className="w-3 h-3" />
                                                    Verifying Proximity...
                                                </p>
                                            </div>
                                            <div className={`w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 border border-primary-500/20`}>
                                                <Camera className="w-6 h-6" />
                                            </div>
                                        </div>

                                        <div className="p-5 bg-dark-500/50 rounded-2xl border border-white/5">
                                            <p className="text-[9px] font-black text-primary-500/50 uppercase tracking-[0.2em] mb-3">Verification Protocol</p>

                                            <div className="space-y-4">
                                                <div className="relative group/photo">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        id={`photo-${b._id}`}
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (!file) return;

                                                            const notes = document.getElementById(`notes-${b._id}`).value;

                                                            const loadingToast = toast.loading('Establishing GPS Lock...');

                                                            const submitWithGPS = (lat = null, lng = null) => {
                                                                const formData = new FormData();
                                                                if (lat) formData.append('latitude', lat);
                                                                if (lng) formData.append('longitude', lng);
                                                                formData.append('notes', notes);
                                                                formData.append('photo', file);

                                                                api.post(`/borrowers/${b._id}/visit`, formData)
                                                                    .then(() => {
                                                                        toast.success('Geo-located report verified!', { id: loadingToast });
                                                                        fetchAssignedBorrowers();
                                                                    })
                                                                    .catch((err) => {
                                                                        toast.error(err.response?.data?.error || 'GPS Data Conflict: Verification Failed', { id: loadingToast });
                                                                    });
                                                            };

                                                            if ("geolocation" in navigator) {
                                                                navigator.geolocation.getCurrentPosition(
                                                                    (position) => {
                                                                        submitWithGPS(position.coords.latitude, position.coords.longitude);
                                                                    },
                                                                    (error) => {
                                                                        console.warn("Geolocation failed, falling back to EXIF only:", error);
                                                                        submitWithGPS();
                                                                    },
                                                                    { enableHighAccuracy: true, timeout: 5000 }
                                                                );
                                                            } else {
                                                                submitWithGPS();
                                                            }
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor={`photo-${b._id}`}
                                                        className="w-full h-32 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-500/30 hover:bg-white/5 transition-all group"
                                                    >
                                                        <Camera className="w-6 h-6 text-gray-500 group-hover:text-primary-400" />
                                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white">Upload GPS Photo Only</span>
                                                    </label>
                                                </div>

                                                <textarea
                                                    id={`notes-${b._id}`}
                                                    placeholder="Enter borrower feedback/statement..."
                                                    className="w-full h-24 bg-white/5 border border-white/5 rounded-2xl p-4 text-xs font-medium text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-500/30 transition-all resize-none"
                                                />
                                            </div>
                                        </div>

                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.5em] text-center italic">Location Locks active for verification</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 3. Completed Missions */}
                <div className="glass rounded-[2.5rem] p-8 border border-white/5 flex flex-col h-[700px]">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-emerald-400" />
                            Completed Missions
                        </h2>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest">
                            {completedMissions.length} Sync'd
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {completedMissions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                                <CheckCircle2 className="w-12 h-12 mb-4" />
                                <p className="text-xs font-bold uppercase tracking-widest">History empty</p>
                            </div>
                        ) : (
                            completedMissions.map((b) => (
                                <div key={b._id} className="glass-light rounded-3xl p-6 border border-emerald-500/10 opacity-60 hover:opacity-100 transition-all grayscale hover:grayscale-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-md font-black text-white tracking-tight">{b.customerName}</h3>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Task Succeeded</p>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Synced</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FieldDashboard;
