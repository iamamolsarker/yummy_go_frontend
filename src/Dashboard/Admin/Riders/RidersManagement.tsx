/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect, type ReactNode } from "react";
import {
    Search, Star, ServerCrash, UtensilsCrossed, Trash2,
    CheckCircle, XCircle, Clock, Loader2, UserCheck, UserX, AlertTriangle,
    ChevronDown
} from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// --- Type Definitions ---
type RiderStatus = "available" | "busy" | "offline" | "pending" | "rejected";

interface Rider {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    vehicle?: { type?: string; model?: string; license_plate?: string };
    location?: { city?: string; current_address?: string; coordinates?: { lat: number, lng: number } };
    documents?: { nid?: string; driving_license?: string; profile_image?: string };
    status: RiderStatus;
    rating?: number;
    total_deliveries?: number;
    is_verified: boolean;
    created_at: string;
    dob?: string;
    // UI state
    isStatusDropdownOpen?: boolean; // Keep if using local state toggle per row (though replaced by openDropdownId)
}

// --- Helper Functions ---
const getStatusDisplay = (status?: RiderStatus): { text: string; className: string; icon: ReactNode } => {
    switch (status) {
        case "available":
            return { text: "Available", className: "bg-green-100 text-green-800", icon: <CheckCircle size={14} /> };
        case "busy":
            return { text: "Busy", className: "bg-yellow-100 text-yellow-800", icon: <Clock size={14} /> };
        case "offline":
            return { text: "Offline", className: "bg-gray-200 text-gray-700", icon: <XCircle size={14} /> };
        case "pending":
            return { text: "Pending Approval", className: "bg-orange-100 text-orange-800", icon: <Clock size={14} /> };
        case "rejected":
            return { text: "Rejected", className: "bg-red-100 text-red-800", icon: <UserX size={14} /> };
        default:
            return { text: status ? String(status).replace(/_/g, ' ') : "Unknown", className: "bg-gray-100 text-gray-600", icon: <AlertTriangle size={14} /> };
    }
};

const getInitials = (name: string = ""): string => {
    if (!name) return "?";
    const words = name.trim().split(/\s+/);
    if (words.length === 0) return "?";
    if (words.length > 1 && words[0] && words[words.length - 1]) {
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

// const formatDate = (dateString?: string): string => {
//     if (!dateString) return "N/A";
//     try {
//         return new Date(dateString).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' });
//     } catch {
//         return "Invalid Date";
//     }
// };


// --- Main Component ---
export default function RiderManagement() {
    const [riders, setRiders] = useState<Rider[]>([]);
    const [statusFilter, setStatusFilter] = useState<"All" | RiderStatus>("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modal, setModal] = useState<{ type: string; rider: Rider | null }>({ type: "", rider: null });
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const axiosSecure = useAxiosSecure();

    // --- Fetch Riders ---
    useEffect(() => {
        let isMounted = true;
        const fetchRiders = async () => {
            try {
                setIsLoading(true);
                setError(null);
                console.log("Fetching riders from /api/riders");
                const res = await axiosSecure.get("/riders"); // Use correct API prefix
                const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                console.log(`Fetched ${data.length} riders.`);

                if (isMounted) {
                    const sortedData = data.sort((a: Rider, b: Rider) => {
                        if (a.status === 'pending' && b.status !== 'pending') return -1;
                        if (a.status !== 'pending' && b.status === 'pending') return 1;
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    });
                    setRiders(sortedData);
                }
            } catch (err: any) {
                console.error("Fetch Riders Error:", err);
                if (isMounted) {
                    setError(err.response?.data?.message || "Failed to load riders.");
                }
            } finally {
                if (isMounted) {
                    setTimeout(() => setIsLoading(false), 300);
                }
            }
        };
        fetchRiders();
        return () => { isMounted = false; };
    }, [axiosSecure]);

    // --- Filtering ---
    const filteredRiders = useMemo(() => {
        return riders
            .filter((r) => statusFilter === "All" || r.status === statusFilter)
            .filter((r) => {
                const query = searchTerm.trim().toLowerCase();
                if (!query) return true;
                return (
                    r.name?.toLowerCase().includes(query) ||
                    r.email?.toLowerCase().includes(query) ||
                    r.phone?.includes(query)
                );
            });
    }, [riders, statusFilter, searchTerm]);

    // --- Pagination Calculation ---
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10; // Riders per page
    const totalPages = Math.max(1, Math.ceil(filteredRiders.length / perPage));

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);

    const paginatedRiders = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredRiders.slice(start, start + perPage);
    }, [filteredRiders, currentPage, perPage]);


    // --- Update Local State ---
    const updateLocalRider = (id: string, updates: Partial<Rider>) => {
        setRiders((prev) => prev.map((r) => (r._id === id ? { ...r, ...updates } : r)));
    };
    const removeLocalRider = (id: string) => {
        setRiders((prev) => prev.filter((r) => r._id !== id));
    };

    // --- Action Handlers ---
    const handleStatusChange = async (id: string, status: RiderStatus) => {
        setOpenDropdownId(null);
        const originalRider = riders.find(r => r._id === id);
        if (!originalRider) return;
        updateLocalRider(id, { status });
        console.log(`Attempting update rider ${id} status to ${status}`);
        try {
            await axiosSecure.patch(`/riders/${id}/status`, { status }); // Use API prefix
            toast.success(`Rider status updated to ${status}.`);
        } catch (err: any) {
            console.error("Status Update Error:", err);
            toast.error(err.response?.data?.message || "Failed to update status.");
            updateLocalRider(id, { status: originalRider.status }); // Revert
        }
    };

    const handleApproveRider = async (riderId: string, userEmail: string) => {
        console.log(`Attempting approve rider ${riderId} (user: ${userEmail})`);
        updateLocalRider(riderId, { status: 'available', is_verified: true }); // Optimistic
        try {
            await Promise.all([
                axiosSecure.patch(`/riders/${riderId}/status`, { status: "available", is_verified: true }), // Use API prefix
                axiosSecure.patch(`/users/${userEmail}/role`, { role: "rider" }), // Use API prefix
                // Optional: Update user status if it was 'pending_rider'
                // axiosSecure.patch(`/api/users/${userEmail}/status`, { status: "active" }),
            ]);
            console.log(`Rider ${riderId} approved.`);
            toast.success(`Rider approved successfully!`);
        } catch (err: any) {
            console.error("Approve Rider Error:", err);
            toast.error(err.response?.data?.message || "Failed to approve rider.");
            const originalRider = riders.find(r => r._id === riderId);
            if (originalRider) updateLocalRider(riderId, { status: 'pending', is_verified: false }); // Revert
        }
    };

    const handleRejectRider = async (riderId: string) => {
        console.log(`Attempting reject/delete rider application ${riderId}`);
        const riderToRemove = riders.find(r => r._id === riderId);
        if (!riderToRemove) return;
        removeLocalRider(riderId); // Optimistic
        closeModal();
        try {
            await axiosSecure.delete(`/riders/${riderId}`); // Use API prefix
            console.log(`Rider application ${riderId} rejected/deleted.`);
            toast.success(`Rider application rejected.`);
            // Optionally update user status if needed
            // await axiosSecure.patch(`/api/users/${riderToRemove.email}/status`, { status: "rejected" });
        } catch (err: any) {
            console.error("Reject Rider Error:", err);
            toast.error(err.response?.data?.message || "Failed to reject application.");
            setRiders(prev => [...prev, riderToRemove]); // Revert
        }
    };

    const handleActionModal = (type: string, rider: Rider) => setModal({ type, rider });
    const closeModal = () => setModal({ type: "", rider: null });
    const toggleDropdown = (id: string) => setOpenDropdownId(prevId => (prevId === id ? null : id));

    // --- Loading & Error States ---
    if (isLoading) return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-150px)] bg-slate-50 text-slate-500">
            {/* FIX: Use className for responsive size */}
            <Loader2 className="animate-spin text-[#EF451C] h-10 w-10 sm:h-12 sm:w-12" /> {/* Example sizes */}
            <p className="mt-4 text-base sm:text-lg font-semibold">Loading Riders...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-150px)] text-center bg-slate-50 p-4">
            {/* FIX: Use className for responsive size */}
            <ServerCrash className="text-red-500 mb-4 h-10 w-10 sm:h-12 sm:w-12" /> {/* Example sizes */}
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-slate-800">Error Loading Riders</h2>
            <p className="text-slate-500 text-sm sm:text-base">{error}</p>
        </div>
    );

    // --- Main JSX ---
    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-slate-800">Rider Management</h1>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Filter Buttons */}
                        <div className="flex flex-wrap sm:flex-nowrap gap-1 border border-slate-200 p-1 rounded-lg w-full md:w-auto">
                            {(["All", "pending", "available", "busy", "offline"] as const).map((tab) => (
                                <button key={tab} onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}
                                    className={`flex-1 sm:flex-none py-1.5 px-2 sm:py-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-md transition-all capitalize whitespace-nowrap ${statusFilter === tab ? "bg-[#EF451C] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                                        }`}>
                                    {tab === 'pending' ? 'Pending Approval' : tab}
                                </button>
                            ))}
                        </div>
                        {/* Search Input */}
                        <div className="relative w-full md:flex-grow md:min-w-[200px] lg:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                            <input type="text" placeholder="Search Name, Email, Phone..." value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#EF451C] focus:border-[#EF451C]" />
                        </div>
                    </div>
                </div>

                {/* Rider Table Container */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 align-top">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rider</th>
                                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Verification</th>
                                <th scope="col" className="px-4 sm:px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {paginatedRiders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 sm:py-16 px-4 sm:px-6 text-slate-500">
                                        <UtensilsCrossed size={32} className="mx-auto mb-2 text-slate-400" />
                                        <p className="font-semibold text-sm sm:text-base">No riders found matching your criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedRiders.map((rider) => {
                                    const displayStatus = getStatusDisplay(rider.status);
                                    const isPending = rider.status === 'pending';

                                    return (
                                        <tr key={rider._id} className="hover:bg-slate-50 transition-colors duration-150 text-xs sm:text-sm">
                                            {/* Rider Info */}
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap align-top">
                                                <div className="flex items-center">
                                                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-slate-200 flex items-center justify-center ring-1 ring-slate-300 flex-shrink-0">
                                                        <span className="text-xs sm:text-sm font-bold text-slate-600">
                                                            {getInitials(rider.name)}
                                                        </span>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="font-semibold text-slate-800">{rider.name || 'N/A'}</div>
                                                        <div className="text-slate-500 text-[11px] sm:text-xs truncate max-w-[150px] sm:max-w-xs">{rider.email || 'N/A'}</div>
                                                        {typeof rider.rating === 'number' &&
                                                            <div className="text-xs text-yellow-500 flex items-center mt-0.5"><Star size={12} className="mr-0.5 fill-current" /> {rider.rating.toFixed(1)}</div>
                                                        }
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Contact */}
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-slate-600 hidden md:table-cell align-top">
                                                {rider.phone || 'N/A'}
                                            </td>
                                            {/* Status Badge */}
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap align-top">
                                                <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold capitalize ${displayStatus.className}`}>
                                                    {displayStatus.icon}
                                                    {displayStatus.text}
                                                </span>
                                            </td>
                                            {/* Verification Status */}
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell align-top">
                                                {rider.is_verified ? (
                                                    <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                                                        <UserCheck size={14} /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-orange-600 font-medium">
                                                        <UserX size={14} /> Not Verified
                                                    </span>
                                                )}
                                            </td>
                                            {/* Actions */}
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center align-top">
                                                {isPending ? (
                                                    // Actions for Pending Riders
                                                    <div className="flex items-center justify-center gap-2 flex-wrap">
                                                        <button
                                                            onClick={() => handleApproveRider(rider._id, rider.email)}
                                                            className="bg-green-100 text-green-800 hover:bg-green-200 py-1 px-3 rounded-md text-xs inline-flex items-center transition-colors"
                                                        >
                                                            <UserCheck size={14} className="mr-1" /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleActionModal("reject", rider)}
                                                            className="bg-red-100 text-red-800 hover:bg-red-200 py-1 px-3 rounded-md text-xs inline-flex items-center transition-colors"
                                                        >
                                                            <UserX size={14} className="mr-1" /> Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    // Actions for Approved/Other Riders
                                                    <div className="flex items-center justify-center gap-2 flex-wrap">
                                                        {/* Status Update Dropdown */}
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => toggleDropdown(rider._id)}
                                                                className="bg-slate-100 text-slate-700 hover:bg-slate-200 py-1 px-3 rounded-md text-xs inline-flex items-center transition-colors"
                                                            >
                                                                Status <ChevronDown size={14} className={`ml-1 transition-transform ${openDropdownId === rider._id ? 'rotate-180' : ''}`} />
                                                            </button>
                                                            {openDropdownId === rider._id && (
                                                                <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                                    <div className="py-1" role="none">
                                                                        {(["available", "busy", "offline"] as const).map((status) => (
                                                                            <button key={status} onClick={() => handleStatusChange(rider._id, status)}
                                                                                disabled={rider.status === status}
                                                                                className={`w-full text-left block px-3 py-1.5 text-xs sm:text-sm capitalize ${rider.status === status ? 'bg-slate-100 text-slate-500 cursor-default' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                                                                    }`} role="menuitem">
                                                                                {status}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Delete Button */}
                                                        <button onClick={() => handleActionModal("delete", rider)}
                                                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors" aria-label="Delete Rider">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6">
                        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
                        <div className='text-xs sm:text-sm text-slate-700 font-medium'>Page {currentPage} of {totalPages}</div>
                        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
                    </div>
                )}

            </div>

            {/* Confirmation Modals */}
            {modal.rider && (modal.type === "delete" || modal.type === "reject") && (
                <ConfirmationModal
                    isOpen={!!modal.rider}
                    onClose={closeModal}
                    // Handle confirm based on modal type
                    onConfirm={modal.type === 'reject' ? () => handleRejectRider(modal.rider!._id) : () => { } /* Add actual delete logic if needed */}
                    title={modal.type === 'reject' ? "Reject Rider Application?" : "Delete Rider?"}
                    message={modal.type === 'reject' ?
                        `Reject application for ${modal.rider.name}? This removes their rider request.` :
                        `Delete ${modal.rider.name}? This might be irreversible.`
                    }
                    confirmText={modal.type === 'reject' ? "Yes, Reject" : "Yes, Delete"}
                    confirmColor="bg-red-600 hover:bg-red-700"
                />
            )}
            {/* Add separate Edit/Rating/Location Modals here if needed */}

        </div>
    );
}


// --- Simple Confirmation Modal Component ---
interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmColor = "bg-red-600 hover:bg-red-700",
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-white rounded-lg w-full max-w-sm p-5 sm:p-6 shadow-xl transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-pop-in" // Added animation
                onClick={(e) => e.stopPropagation()}
                role="alertdialog"
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <div className="sm:flex sm:items-start mb-4">
                    <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:mr-4">
                        <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                        <h3 className="text-base sm:text-lg font-semibold leading-6 text-slate-900" id="modal-title">
                            {title}
                        </h3>
                        <div className="mt-1 sm:mt-2">
                            <p className="text-xs sm:text-sm text-slate-500" id="modal-description">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button
                        type="button"
                        className={`w-full inline-flex justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-150 sm:w-auto ${confirmColor} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600`}
                        onClick={() => {
                            onConfirm();
                            // Keep onClose separate if confirm action is async
                            // onClose();
                        }}
                    >
                        {confirmText}
                    </button>
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors duration-150 sm:mt-0 sm:w-auto"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
            {/* Simple CSS for fade-in animation */}
            <style>{`
                @keyframes modal-pop-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-modal-pop-in { animation: modal-pop-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};