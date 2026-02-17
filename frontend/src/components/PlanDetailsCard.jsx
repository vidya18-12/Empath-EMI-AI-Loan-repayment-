import React from 'react';
import { TrendingUp, Calendar, Shield, CheckCircle, Clock } from 'lucide-react';

const PlanDetailsCard = ({ recommendation }) => {
    if (!recommendation) return null;

    return (
        <div className="glass rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-[50px]"></div>

            <h3 className="text-lg font-black text-white flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-sm">
                    <TrendingUp className="w-5 h-5 text-white" />
                </div>
                About Plan
            </h3>

            <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Monthly Installment</p>
                    <p className="text-3xl font-black text-white tracking-tight">
                        ₹{recommendation.suggestedEMI.toLocaleString()}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-primary-400" />
                            <span className="text-[9px] text-gray-400 font-black uppercase">Tenure</span>
                        </div>
                        <p className="text-sm font-black text-white">+{recommendation.extendedTenure} Mo</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-cyan-400" />
                            <span className="text-[9px] text-gray-400 font-black uppercase">Grace</span>
                        </div>
                        <p className="text-sm font-black text-white">{recommendation.gracePeriod} Days</p>
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Plan Status</span>
                        {recommendation.status === 'Accepted' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <Clock className="w-4 h-4 text-emerald-400/50" />
                        )}
                    </div>
                    <p className="text-lg font-black text-white uppercase tracking-tight">{recommendation.status}</p>
                </div>
            </div>
        </div>
    );
};

export default PlanDetailsCard;
