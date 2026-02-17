import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import PlanDetailsCard from '../components/PlanDetailsCard';
import { ArrowLeft, CreditCard, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const BorrowerPlan = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loanDetails, setLoanDetails] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLoanDetails();
    }, []);

    useEffect(() => {
        if (loanDetails) {
            fetchRecommendation();
        }
    }, [loanDetails]);

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

    const fetchRecommendation = async () => {
        try {
            const response = await api.get(`/borrowers/${loanDetails._id}/latest-recommendation`);
            setRecommendation(response.data.data);
        } catch (error) {
            console.error('Failed to fetch recommendation');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!loanDetails) {
        return (
            <div className="max-w-6xl mx-auto py-8">
                <div className="glass rounded-[2.5rem] p-16 border border-white/5 text-center shadow-2xl">
                    <AlertCircle className="w-20 h-20 text-gray-700 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-white tracking-tight">No Active Loan Found</h2>
                    <button
                        onClick={() => navigate('/borrower-dashboard')}
                        className="mt-8 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in py-2 max-w-4xl mx-auto">
            <header className="flex items-center justify-between gap-6">
                <div>
                    <button
                        onClick={() => navigate('/borrower-dashboard')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
                    </button>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        My Recovery <span className="gradient-text">Plan</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-gray-400 font-medium">Loan Account: {loanDetails?.loanId || 'N/A'}</span>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-4 bg-dark-500/50 p-4 rounded-2xl border border-white/5 shadow-glow-sm">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Total Exposure</p>
                        <p className="text-xl font-black text-white">₹{loanDetails?.loanAmount.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                    </div>
                </div>
            </header>

            {recommendation ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-6">
                        <div className="glass p-8 rounded-[2.5rem] border border-white/5">
                            <h3 className="text-xl font-black text-white mb-4">Why this plan?</h3>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                Based on your recent activity and market conditions, our AI has structured a personalized recovery plan that optimizes for lower monthly pressure ({((1 - (recommendation.suggestedEMI / (loanDetails.loanAmount / 12))) * 100).toFixed(0)}% reduction) while maintaining a healthy credit score trajectory.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                                    Credit Score Friendly
                                </span>
                                <span className="px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold">
                                    No Hidden Fees
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="md:sticky md:top-8">
                        <PlanDetailsCard recommendation={recommendation} />
                    </div>
                </div>
            ) : (
                <div className="glass rounded-[2.5rem] p-12 border border-white/5 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <div className="spinner w-8 h-8"></div>
                    </div>
                    <p className="text-gray-400 font-medium">Analyzing financial data for best recommendations...</p>
                </div>
            )}
        </div>
    );
};

export default BorrowerPlan;
