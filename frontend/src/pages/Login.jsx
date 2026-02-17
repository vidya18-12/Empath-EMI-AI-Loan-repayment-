import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    LogIn,
    Shield,
    User,
    Briefcase,
    Lock,
    Mail,
    Eye,
    EyeOff,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    Zap
} from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('borrower'); // 'borrower', 'manager', 'admin'
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const targetRole = activeTab === 'borrower' ? 'user' : activeTab;

        try {
            const user = await login(email, password, targetRole);
            toast.success('Login successful!');
            if (user.role === 'user') {
                navigate('/borrower-dashboard');
            } else if (user.role === 'field_executive') {
                navigate('/field-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'borrower', label: 'Borrower', icon: User },
        { id: 'field_executive', label: 'Field Executive', icon: Zap },
        { id: 'manager', label: 'Recovery Manager', icon: Briefcase },
        { id: 'admin', label: 'Admin', icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-gradient-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Animations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="w-full max-w-md z-10 animate-fade-in">
                {/* Logo/Header Area */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow-md mb-6 animate-float">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                        <span className="gradient-text">Empath Recovery</span> AI
                    </h1>
                    <p className="text-gray-400 font-medium">
                        Advanced AI-Powered Debt Recovery Portal
                    </p>
                </div>

                {/* Main Card */}
                <div className="glass rounded-[2rem] p-1 border border-primary-500/20 shadow-2xl">
                    <div className="bg-dark-500/50 rounded-[1.8rem] p-8 backdrop-blur-sm">

                        {/* Tab Navigation */}
                        <div className="flex p-1 bg-dark-400/50 rounded-[1.2rem] mb-8 border border-white/5">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-1 rounded-2xl text-xs font-bold transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/20 scale-100'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                            <p className="text-gray-400 text-xs font-medium">
                                {activeTab === 'borrower' ? 'Login to manage your repayment journey.' :
                                    activeTab === 'field_executive' ? 'On-ground mission tracking & check-ins.' :
                                        activeTab === 'manager' ? 'Manage your recovery cases and chat.' :
                                            'Administrative control and monitoring.'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Field */}
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-cyan-400 mb-2 tracking-widest ml-1">
                                    Account Identifier
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 text-gray-400 group-focus-within:text-cyan-400">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-dark-400/50 border border-white/10 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 text-white font-medium placeholder:text-gray-500 outline-none"
                                        placeholder="email@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-cyan-400 mb-2 tracking-widest ml-1">
                                    Security Key
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 text-gray-400 group-focus-within:text-cyan-400">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3.5 bg-dark-400/50 border border-white/10 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 text-white font-medium placeholder:text-gray-500 outline-none"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-primary hover:bg-gradient-to-r hover:from-primary-500 hover:to-cyan-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-glow-sm hover:shadow-glow-md group active:scale-[0.98] disabled:opacity-50 mt-2"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="group-hover:translate-x-1 transition-transform">Access Dashboard</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center border-t border-white/5 pt-6">
                            <p className="text-sm font-medium text-gray-400">
                                Don't have an account yet?{' '}
                                <Link to="/register" className="text-cyan-400 hover:text-cyan-300 hover:underline underline-offset-4 ml-1 transition-colors">
                                    Create One
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default Login;
