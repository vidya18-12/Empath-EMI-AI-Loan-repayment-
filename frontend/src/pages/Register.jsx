import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    UserPlus,
    Shield,
    User,
    Briefcase,
    Lock,
    Mail,
    Phone,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    MapPin
} from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'user',
    });
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [registeredUser, setRegisteredUser] = useState(null);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const user = await register(formData.name, formData.email, formData.password, formData.role, formData.phone);
            setRegisteredUser(user);
            setShowSuccessModal(true);
            toast.success('Registration successful!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleProceedToDashboard = () => {
        if (!registeredUser) return;

        if (registeredUser.role === 'user') {
            navigate('/borrower-dashboard');
        } else if (registeredUser.role === 'field_executive') {
            navigate('/field-dashboard');
        } else {
            navigate('/dashboard');
        }
    };

    const roles = [
        { id: 'user', label: 'Borrower', icon: User },
        { id: 'field_executive', label: 'Field Executive', icon: MapPin },
        { id: 'manager', label: 'Recovery Manager', icon: Briefcase },
        { id: 'admin', label: 'Admin', icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-gradient-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Animations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[10%] right-[10%] w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[10%] left-[10%] w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="w-full max-w-md z-10 animate-fade-in py-8">
                {/* Logo area */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-primary shadow-glow-sm mb-4 animate-float">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                        Create <span className="gradient-text">Account</span>
                    </h1>
                </div>

                {/* Main Card */}
                <div className="glass rounded-[2.5rem] p-1 border border-primary-500/20 shadow-2xl">
                    <div className="bg-dark-500/50 rounded-[2.3rem] p-8 backdrop-blur-sm">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white mb-1">Get Started</h2>
                            <p className="text-gray-400 text-sm font-medium">Join our advanced recovery network.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Role Selector */}
                            <div className="grid grid-cols-4 gap-2 p-1 bg-dark-400/50 rounded-2xl mb-6 border border-white/5">
                                {roles.map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: r.id })}
                                        className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-all duration-300 ${formData.role === r.id
                                            ? 'bg-gradient-primary text-white shadow-glow-sm scale-100'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <r.icon className={`w-4 h-4 ${formData.role === r.id ? 'text-white' : 'text-gray-400'}`} />
                                        <span className="text-[9px] font-bold uppercase tracking-wider">{r.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Full Name */}
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 text-gray-400 group-focus-within:text-cyan-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-dark-400/50 border border-white/10 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 text-white text-sm font-medium placeholder:text-gray-500 outline-none"
                                    placeholder="Full Name"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 text-gray-400 group-focus-within:text-cyan-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-dark-400/50 border border-white/10 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 text-white text-sm font-medium placeholder:text-gray-500 outline-none"
                                    placeholder="Email Address"
                                    required
                                />
                            </div>

                            {/* Phone (Conditional) */}
                            {formData.role === 'user' && (
                                <div className="relative group animate-fade-in">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 text-gray-400 group-focus-within:text-cyan-400">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 bg-dark-400/50 border border-white/10 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 text-white text-sm font-medium placeholder:text-gray-500 outline-none"
                                        placeholder="Phone (e.g. 9876543210)"
                                        required={formData.role === 'user'}
                                    />
                                </div>
                            )}

                            {/* Password */}
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 text-gray-400 group-focus-within:text-cyan-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-dark-400/50 border border-white/10 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 text-white text-sm font-medium placeholder:text-gray-500 outline-none"
                                    placeholder="Security Key"
                                    required
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 text-gray-400 group-focus-within:text-cyan-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-dark-400/50 border border-white/10 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300 text-white text-sm font-medium placeholder:text-gray-500 outline-none"
                                    placeholder="Confirm Key"
                                    required
                                />
                            </div>

                            {/* Register Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-primary hover:bg-gradient-to-r hover:from-primary-500 hover:to-cyan-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-glow-sm hover:shadow-glow-md group active:scale-[0.98] disabled:opacity-50 mt-4"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
                                        <span>Create Account</span>
                                        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center border-t border-white/5 pt-6">
                            <p className="text-sm font-medium text-gray-400">
                                Already have an account?{' '}
                                <Link to="/login" className="text-cyan-400 hover:text-cyan-300 hover:underline underline-offset-4 ml-1 transition-colors">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Note */}
                <div className="mt-6 flex items-center gap-3 px-6">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Secure & Encrypted Onboarding
                    </p>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-md animate-fade-in"></div>
                    <div className="relative w-full max-w-sm glass rounded-[2.5rem] p-1 border border-cyan-500/30 shadow-3xl animate-scale-in">
                        <div className="bg-dark-500/90 rounded-[2.3rem] p-8 text-center overflow-hidden relative">
                            {/* Decorative background circle */}
                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>

                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 shadow-glow-sm">
                                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2">Protocol Initialized</h3>
                            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                Your secure recovery account has been successfully provisioned. Welcome to the network.
                            </p>

                            <button
                                onClick={handleProceedToDashboard}
                                className="w-full bg-gradient-primary hover:bg-gradient-to-r hover:from-primary-500 hover:to-cyan-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-glow-sm hover:shadow-glow-md group"
                            >
                                <span>Proceed to Dashboard</span>
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-2">
                                <Sparkles className="w-3 h-3 text-cyan-400 opacity-50" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    System Verification Complete
                                </span>
                                <Sparkles className="w-3 h-3 text-cyan-400 opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
