import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import {
    Calendar,
    MapPin,
    Clock,
    User,
    FileText,
    Camera,
    ExternalLink,
    Search,
    Filter
} from 'lucide-react';
import { format } from 'date-fns';

const VisitHistory = () => {
    const [loading, setLoading] = useState(false);
    const [visits, setVisits] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchVisits = async () => {
        try {
            setLoading(true);
            // Fetch all assigned borrowers. The backend filters this for the logged-in field executive.
            const response = await api.get('/borrowers');
            const borrowers = response.data.data;

            // Flatten visits from all borrowers
            const extractedVisits = borrowers.flatMap(borrower => {
                if (!borrower.fieldVisits || borrower.fieldVisits.length === 0) return [];

                return borrower.fieldVisits.map(visit => ({
                    ...visit,
                    borrowerName: borrower.customerName,
                    borrowerId: borrower._id,
                    address: borrower.address,
                    loanId: borrower.loanId
                }));
            });

            // Sort by most recent
            extractedVisits.sort((a, b) => new Date(b.visitedAt) - new Date(a.visitedAt));

            setVisits(extractedVisits);
        } catch (error) {
            console.error('Error fetching visits:', error);
            toast.error('Failed to load visit history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVisits();
    }, []);

    const filteredVisits = visits.filter(visit =>
        visit.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (visit.notes && visit.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const openMap = (lat, lng) => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    };

    const [selectedImage, setSelectedImage] = useState(null);


    const [stats, setStats] = useState({
        totalVisits: 0,
        thisMonth: 0,
        uniqueLocations: 0
    });

    useEffect(() => {
        if (visits.length > 0) {
            const now = new Date();
            const thisMonthVisits = visits.filter(v => {
                const d = new Date(v.visitedAt);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            });

            // Count unique locations based on lat/lng approx
            const uniqueLocs = new Set(visits.map(v => `${v.latitude?.toFixed(4)},${v.longitude?.toFixed(4)}`));

            setStats({
                totalVisits: visits.length,
                thisMonth: thisMonthVisits.length,
                uniqueLocations: uniqueLocs.size
            });
        }
    }, [visits]);

    const downloadCSV = async () => {
        if (visits.length === 0) return;

        const headers = ['Borrower Name', 'Loan ID', 'Date', 'Time', 'Latitude', 'Longitude', 'Notes'];
        const csvRows = [headers.join(',')];

        filteredVisits.forEach(v => {
            const row = [
                `"${v.borrowerName}"`,
                v.loanId,
                format(new Date(v.visitedAt), 'yyyy-MM-dd'),
                format(new Date(v.visitedAt), 'HH:mm:ss'),
                v.latitude,
                v.longitude,
                `"${v.notes ? v.notes.replace(/"/g, '""') : ''}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });

        // Trigger Download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = `visit-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);

        // Upload to Admin Dashboard
        const formData = new FormData();
        formData.append('file', blob, fileName);

        try {
            await api.post('/borrowers/upload-report', formData);
            toast.success('Report downloaded and sent to Admin Dashboard!', {
                icon: '🚀',
                duration: 5000
            });
        } catch (error) {
            console.error('Failed to send report to admin:', error);
            toast.error('Report downloaded, but failed to notify Admin.');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in py-2">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Visit <span className="gradient-text">History</span>
                    </h1>
                    <p className="text-gray-400 font-medium mt-1">Audit log of all on-ground verifications</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={downloadCSV}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={visits.length === 0}
                    >
                        <FileText className="w-5 h-5" />
                        Export Report
                    </button>

                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 bg-dark-500/50 border border-white/10 rounded-xl px-10 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 group-focus-within:text-cyan-400 transition-colors" />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="w-24 h-24 text-cyan-500 transform rotate-12" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Visits</p>
                        <h3 className="text-4xl font-black text-white mt-2">{stats.totalVisits}</h3>
                        <p className="text-xs font-semibold text-cyan-400 mt-2">All time records</p>
                    </div>
                </div>

                <div className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-24 h-24 text-emerald-500 transform rotate-12" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">This Month</p>
                        <h3 className="text-4xl font-black text-white mt-2">{stats.thisMonth}</h3>
                        <p className="text-xs font-semibold text-emerald-400 mt-2">Active Verify</p>
                    </div>
                </div>

                <div className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <MapPin className="w-24 h-24 text-purple-500 transform rotate-12" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Unique Locations</p>
                        <h3 className="text-4xl font-black text-white mt-2">{stats.uniqueLocations}</h3>
                        <p className="text-xs font-semibold text-purple-400 mt-2">Geospatial Points</p>
                    </div>
                </div>
            </div>

            {/* Visits List */}
            <div className="glass rounded-[2.5rem] p-8 border border-white/5 min-h-[600px]">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                    </div>
                ) : filteredVisits.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30 mt-20">
                        <Calendar className="w-16 h-16 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No visits recorded</h3>
                        <p className="text-gray-400">Complete field missions to populate this timeline</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredVisits.map((visit, index) => (
                            <div key={index} className="glass-light rounded-3xl p-6 border border-white/5 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <MapPin className="w-24 h-24 text-cyan-500 transform rotate-12" />
                                </div>

                                <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                                    {/* Photo Section */}
                                    <div className="shrink-0">
                                        {visit.photoUrl ? (
                                            <div
                                                className="w-full lg:w-48 h-48 rounded-2xl overflow-hidden border border-white/10 relative group/photo cursor-pointer"
                                                onClick={() => setSelectedImage(visit.photoUrl.startsWith('http') ? visit.photoUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${visit.photoUrl}`)}
                                            >
                                                <img
                                                    src={visit.photoUrl.startsWith('http') ? visit.photoUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${visit.photoUrl}`}
                                                    alt="Visit Verification"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                    <Camera className="w-8 h-8 text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full lg:w-48 h-48 rounded-2xl bg-white/5 flex flex-col items-center justify-center border border-white/10 text-gray-500">
                                                <Camera className="w-8 h-8 mb-2 opacity-50" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">No Photo</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details Section */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-2xl font-black text-white tracking-tight">{visit.borrowerName}</h3>
                                                    <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black rounded-lg border border-cyan-500/20 uppercase tracking-widest">
                                                        Verified
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                                    <User className="w-4 h-4 text-cyan-500" />
                                                    Loan ID: {visit.loanId}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-2xl font-black text-white/90">
                                                    {format(new Date(visit.visitedAt), 'HH:mm')}
                                                </p>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                    {format(new Date(visit.visitedAt), 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="p-4 bg-dark-500/30 rounded-2xl border border-white/5">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <FileText className="w-3 h-3 text-cyan-500" />
                                                    Agent Notes
                                                </p>
                                                <p className="text-sm text-gray-300 italic">"{visit.notes || 'No notes provided'}"</p>
                                            </div>

                                            <button
                                                onClick={() => openMap(visit.latitude, visit.longitude)}
                                                className="p-4 bg-dark-500/30 rounded-2xl border border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-left group/map"
                                            >
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center justify-between group-hover/map:text-cyan-400 transition-colors">
                                                    <span className="flex items-center gap-2">
                                                        <MapPin className="w-3 h-3 text-cyan-500" />
                                                        Location Data
                                                    </span>
                                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover/map:opacity-100 transition-opacity" />
                                                </p>
                                                <p className="text-sm text-gray-300 font-mono space-y-1">
                                                    <span className="block">Lat: {visit.latitude?.toFixed(6)}</span>
                                                    <span className="block">Lng: {visit.longitude?.toFixed(6)}</span>
                                                </p>
                                            </button>
                                        </div>

                                        <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                                            <p className="text-xs font-medium text-emerald-400/80">
                                                Sync successful • Data logged in audit trail
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
                        <img
                            src={selectedImage}
                            alt="Verification Full View"
                            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                        />
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisitHistory;
