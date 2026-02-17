import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Phone,
    Brain,
    LogOut,
    Menu,
    X,
    Building2,
    CreditCard,
    MessageCircle,
    Sparkles,
    Calendar
} from 'lucide-react';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager'] },
        { name: 'Mission Control', path: '/field-dashboard', icon: Sparkles, roles: ['field_executive'] },
        { name: 'Visit History', path: '/visits', icon: Calendar, roles: ['field_executive'] },
        { name: 'Borrower Dashboard', path: '/borrower-dashboard', icon: CreditCard, roles: ['user'] },
        { name: 'Borrower Directory', path: '/borrowers', icon: Users, roles: ['admin', 'manager'] },
        { name: 'Behavior Analysis', path: '/analysis', icon: Brain, roles: ['admin', 'manager'] },
        { name: 'AI Chatbot', path: '/ai-chatbot', icon: MessageCircle, roles: ['manager'] },
    ].filter(item => !item.roles || item.roles.includes(user?.role));

    return (
        <div className="min-h-screen bg-gradient-dark">
            {/* Sidebar - Desktop */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 glass border-r border-primary-500/20 transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                {/* Logo Area with Gradient */}
                <div className="relative h-16 px-6 border-b border-primary-500/20 flex items-center gap-3 bg-gradient-to-r from-primary-600/20 to-cyan-600/20">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary shadow-glow-sm">
                        <Building2 className="w-6 h-6 text-white" />
                        <div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-50 blur-md"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold gradient-text">Loan Recovery</span>
                        <span className="text-[10px] text-cyan-400 font-semibold tracking-wider">AI POWERED</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                    ? 'bg-gradient-primary text-white shadow-glow-md'
                                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'
                                    }`} />
                                <span className="font-semibold">{item.name}</span>
                                {isActive && (
                                    <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-500/20 glass-light">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="relative w-11 h-11 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow-sm">
                            <span className="text-white font-bold text-lg">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                            <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-30 blur-md"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-cyan-400 uppercase tracking-wider font-bold truncate">
                                {user?.role}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all duration-300 border border-rose-500/20 hover:border-rose-500/40"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
                {/* Header */}
                <header className="sticky top-0 z-40 h-16 glass-light border-b border-primary-500/20 flex items-center justify-between px-6 backdrop-blur-xl">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all lg:block"
                    >
                        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    <div className="flex-1"></div>

                    {/* Welcome Message */}
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                        <span className="text-sm text-gray-300">
                            Welcome, <strong className="gradient-text-neon">{user?.name}</strong>
                        </span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6 min-h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Layout;
