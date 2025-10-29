/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import {
    Search,
    Star,
    MapPin,
    Edit,
    Trash2,
    ServerCrash,
    UtensilsCrossed,
} from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

type RiderStatus = "available" | "busy" | "offline";

interface Rider {
    isDropdownOpen: any;
    _id: string;
    name: string;
    email: string;
    phone?: string;
    vehicle?: { type?: string; number?: string };
    location?: { lat?: number; lng?: number };
    status: RiderStatus;
    rating: number;
    total_deliveries: number;
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
}

const getStatusDisplay = (status?: RiderStatus) => {
    switch (status) {
        case "available":
            return { text: "Available", className: "bg-green-100 text-green-800" };
        case "busy":
            return { text: "Busy", className: "bg-yellow-100 text-yellow-800" };
        case "offline":
            return { text: "Offline", className: "bg-gray-200 text-gray-800" };
        default:
            return { text: "Unknown", className: "bg-gray-200 text-gray-800" };
    }
};

const getInitials = (name: string = "") => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length > 1) {
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

export default function RiderManagement() {
    const [riders, setRiders] = useState<Rider[]>([]);
    const [statusFilter, setStatusFilter] = useState<"All" | RiderStatus>("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modal, setModal] = useState<{ type: string; rider: Rider | null }>({
        type: "",
        rider: null,
    });
    const axiosSecure = useAxiosSecure();

    useEffect(() => {
        const fetchRiders = async () => {
            try {
                setIsLoading(true);
                const res = await axiosSecure.get("/riders");
                const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
                setRiders(data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load riders.");
            } finally {
                setTimeout(() => setIsLoading(false), 400);
            }
        };
        fetchRiders();
    }, [axiosSecure]);

    const filteredRiders = useMemo(() => {
        return riders
            .filter((r) => statusFilter === "All" || r.status === statusFilter)
            .filter(
                (r) =>
                    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [riders, statusFilter, searchTerm]);

    const updateRider = (id: string, updates: Partial<Rider>) => {
        setRiders((prev) => prev.map((r) => (r._id === id ? { ...r, ...updates } : r)));
    };

    const handleStatusChange = async (id: string, status: RiderStatus) => {
        try {
            await axiosSecure.patch(`/riders/${id}/status`, { status });
            updateRider(id, { status });
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update status.");
        }
    };

    const handleAction = (type: string, rider: Rider) => {
        setModal({ type, rider });
    };

    const closeModal = () => setModal({ type: "", rider: null });

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 text-gray-500">
                <UtensilsCrossed className="animate-spin text-[#EF451C]" size={48} />
                <p className="mt-4 text-lg font-semibold">Loading riders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen text-center bg-gray-50 p-4">
                <ServerCrash className="text-red-500 mb-4" size={48} />
                <h2 className="text-2xl font-bold mb-2">Error</h2>
                <p className="text-gray-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Rider Management</h1>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 ">
                        <div className="flex-grow flex space-x-1 border border-gray-200 p-1 rounded-lg">
                            {(["All", "available", "busy", "offline"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setStatusFilter(tab)}
                                    className={`w-full py-2 px-3 text-sm font-semibold rounded-md transition-all capitalize ${statusFilter === tab
                                            ? "bg-[#EF451C] text-white shadow"
                                            : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="relative min-w-[250px]">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                                size={20}
                            />
                            <input
                                type="text"
                                placeholder="Search riders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border  border-gray-200 rounded-lg focus:ring-2 focus:ring-[#EF451C]/50"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                    Rider
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredRiders.map((rider) => {
                                const displayStatus = getStatusDisplay(rider.status);
                                return (
                                    <tr key={rider._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-offset-2 ring-gray-100">
                                                    <span className="text-sm font-bold text-gray-600">
                                                        {getInitials(rider.name)}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-semibold">{rider.name}</div>
                                                    <div className="text-sm text-gray-500">{rider.email}</div>
                                                    
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${displayStatus.className}`}
                                            >
                                                {displayStatus.text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-medium relative">
                                            <div className="flex items-center justify-center gap-2 flex-wrap">
                                                {/* Dropdown for status */}
                                                <div className="relative">
                                                    <button
                                                        onClick={() =>
                                                            setRiders((prev) =>
                                                                prev.map((r) =>
                                                                    r._id === rider._id
                                                                        ? { ...r, isDropdownOpen: !r.isDropdownOpen }
                                                                        : { ...r, isDropdownOpen: false }
                                                                )
                                                            )
                                                        }
                                                        className="bg-gray-100 text-gray-800 hover:bg-gray-200 py-1 px-3 rounded-md text-xs inline-flex items-center"
                                                    >
                                                     Update Status
                                                    </button>

                                                    {rider.isDropdownOpen && (
                                                        <div className="absolute right-0 mt-1 flex flex-col bg-white border border-gray-200 rounded-md shadow-lg w-36 z-10 animate-fade-in">
                                                            {(["available", "busy", "offline"] as const).map((status) => (
                                                                <button
                                                                    key={status}
                                                                    onClick={() => {
                                                                        handleStatusChange(rider._id, status);
                                                                        setRiders((prev) =>
                                                                            prev.map((r) => ({ ...r, isDropdownOpen: false }))
                                                                        );
                                                                    }}
                                                                    className="px-3 py-2 text-sm text-left hover:bg-gray-100 capitalize transition"
                                                                >
                                                                    {status}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Other buttons */}
                                                <button
                                                    onClick={() => handleAction("rating", rider)}
                                                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 py-1 px-3 rounded-md text-xs inline-flex items-center"
                                                >
                                                    <Star size={14} className="mr-1" /> Rating
                                                </button>

                                                <button
                                                    onClick={() => handleAction("location", rider)}
                                                    className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 py-1 px-3 rounded-md text-xs inline-flex items-center"
                                                >
                                                    <MapPin size={14} className="mr-1" /> Location
                                                </button>

                                                <button
                                                    onClick={() => handleAction("edit", rider)}
                                                    className="bg-orange-100 text-orange-800 hover:bg-orange-200 py-1 px-3 rounded-md text-xs inline-flex items-center"
                                                >
                                                    <Edit size={14} className="mr-1" /> Edit
                                                </button>

                                                <button
                                                    onClick={() => handleAction("delete", rider)}
                                                    className="bg-red-100 text-red-800 hover:bg-red-200 py-1 px-3 rounded-md text-xs inline-flex items-center"
                                                >
                                                    <Trash2 size={14} className="mr-1" /> Delete
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredRiders.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p>No riders found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {modal.rider && (
                <ActionModal modal={modal} onClose={closeModal} updateRider={updateRider} />
            )}
        </div>
    );
}

/* ---------------- Modal Component ---------------- */
function ActionModal({
    modal,
    onClose,
    updateRider,
}: {
    modal: { type: string; rider: Rider | null };
    onClose: () => void;
    updateRider: (id: string, updates: Partial<Rider>) => void;
}) {
    const axiosSecure = useAxiosSecure();
    const rider = modal.rider;
    if (!rider) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const payload: any = Object.fromEntries(formData.entries());

        try {
            if (modal.type === "rating") {
                await axiosSecure.patch(`/riders/${rider._id}/rating`, { rating: parseFloat(payload.rating) });
                updateRider(rider._id, { rating: parseFloat(payload.rating) });
            } else if (modal.type === "location") {
                await axiosSecure.patch(`/riders/${rider._id}/location`, {
                    lat: parseFloat(payload.lat),
                    lng: parseFloat(payload.lng),
                });
                updateRider(rider._id, { location: { lat: parseFloat(payload.lat), lng: parseFloat(payload.lng) } });
            } else if (modal.type === "edit") {
                await axiosSecure.put(`/riders/${rider._id}`, payload);
                updateRider(rider._id, { name: payload.name, phone: payload.phone });
            } else if (modal.type === "delete") {
                await axiosSecure.delete(`/riders/${rider._id}`);
                updateRider(rider._id, { name: "[Deleted]" } as any);
            }
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
                <h2 className="text-lg font-bold mb-4 text-gray-800 capitalize">
                    {modal.type === "delete" ? "Confirm Delete" : `Update ${modal.type}`}
                </h2>

                {modal.type === "delete" ? (
                    <div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <strong>{rider.name}</strong>?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit as any}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {modal.type === "rating" && (
                            <input
                                name="rating"
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                defaultValue={rider.rating}
                                className="w-full border rounded-lg px-3 py-2"
                                placeholder="Rating (0–5)"
                                required
                            />
                        )}
                        {modal.type === "location" && (
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    name="lat"
                                    type="number"
                                    step="any"
                                    defaultValue={rider.location?.lat}
                                    placeholder="Latitude"
                                    className="border rounded-lg px-3 py-2"
                                    required
                                />
                                <input
                                    name="lng"
                                    type="number"
                                    step="any"
                                    defaultValue={rider.location?.lng}
                                    placeholder="Longitude"
                                    className="border rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                        )}
                        {modal.type === "edit" && (
                            <>
                                <input
                                    name="name"
                                    defaultValue={rider.name}
                                    className="w-full border rounded-lg px-3 py-2"
                                    placeholder="Name"
                                    required
                                />
                                <input
                                    name="phone"
                                    defaultValue={rider.phone}
                                    className="w-full border rounded-lg px-3 py-2"
                                    placeholder="Phone"
                                    required
                                />
                            </>
                        )}
                        <div className="flex justify-end space-x-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#EF451C] text-white rounded-lg hover:bg-[#d63b14]"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
