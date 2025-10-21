
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Crown, Image as ImageIcon, User, Phone, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ProfileOpeningLoading from './loading/ProfileOpeningLoading';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import ImageUploadModal from './imageUpload/ImageUploadModal';

// --- Reusable Components ---
const InputField = ({ id, label, type = 'text', icon, endIcon, ...props }: any) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>}
            <input
                type={type}
                id={id}
                {...props}
                className={`w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 disabled:bg-gray-100 ${icon ? 'pl-10' : ''} ${endIcon ? 'pr-10' : ''}`}
            />
            {endIcon && <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{endIcon}</div>}
        </div>
    </div>
);

const SectionHeader = ({ title }: { title: string }) => (
    <div className="pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    </div>
);


export default function ProfilePage() {
    // --- Hooks and State ---
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();

    const [userData, setUserData] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState('User Profile');

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [coverImage, setCoverImage] = useState('https://i.ibb.co/nN4RbRsK/yummy-go-car-bike.png');
    const [profileImage, setProfileImage] = useState('https://i.ibb.co/PZjxHVfY/yummy-go-logo.png');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingImageType, setEditingImageType] = useState<'cover' | 'profile' | null>(null);

    const [profileData, setProfileData] = useState({ firstName: '', lastName: '', mobile: '' });
    // 100% FINAL FIX: State now matches the flat structure of the backend
    const [addressData, setAddressData] = useState({
        address: '', // This field is for the street
        city: '',
        area: '',
    });

    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    const [passwordVisibility, setPasswordVisibility] = useState({ current: false, new: false, confirm: false });

    const syncUIWithUserData = useCallback((dbUser: any) => {
        if (!dbUser) return;
        const name = dbUser.name || user?.displayName || '';
        const nameParts = name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setProfileData({
            firstName: firstName,
            lastName: lastName,
            mobile: dbUser.phone || '',
        });

        // 100% FINAL FIX: Map from backend's flat structure
        setAddressData({
            address: dbUser.address || '',
            city: dbUser.city || '',
            area: dbUser.area || '',
        });
        setUserData(dbUser);
    }, [user]);


    useEffect(() => {
        const savedProfile = localStorage.getItem('userProfileImage');
        const savedCover = localStorage.getItem('userCoverImage');
        if (savedProfile) setProfileImage(savedProfile);
        if (savedCover) setCoverImage(savedCover);

        if (authLoading) {
            setIsLoading(true);
            return;
        }
        if (!user) {
            setIsLoading(false);
            setUserData(null);
            return;
        }

        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                const { data } = await axiosSecure.get(`/users/${user.email}`);
                const dbUser = data.data || data;

                syncUIWithUserData(dbUser);
                setProfileImage(dbUser.profile_image || user.photoURL || 'https://i.ibb.co/PZjxHVfY/yummy-go-logo.png');

            } catch (err) {
                console.error("Failed to load user data:", err);
                toast.error("Failed to load your profile data.");
                setUserData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [user, authLoading, axiosSecure, syncUIWithUserData]);

    if (isLoading) return <ProfileOpeningLoading />;
    if (!userData) return (
        <div className="flex items-center justify-center min-h-[60vh] text-center text-xl text-red-500 font-semibold">
            Failed to load user data. <br />
            Please try logging out and logging back in.
        </div>
    );

    const displayName = `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || user?.displayName || 'User';

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>, setState: React.Dispatch<React.SetStateAction<any>>) => {
        setState((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddressData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUploadSuccess = async (newUrl: string) => {
        if (editingImageType === 'cover') {
            setCoverImage(newUrl);
            localStorage.setItem('userCoverImage', newUrl);
            toast.success("Cover image updated (local session)!");
        } else if (editingImageType === 'profile') {
            try {
                const res = await axiosSecure.patch(`/users/${user?.email}/profile`, { profile_image: newUrl });
                setProfileImage(newUrl);
                localStorage.setItem('userProfileImage', newUrl);
                syncUIWithUserData(res.data.profile);
                toast.success("Profile picture updated successfully!");
            } catch (err: any) {
                console.error("Profile image save error:", err);
                toast.error(err.response?.data?.message || "Failed to update profile picture.");
            }
        }
        closeModal();
    };

    const handleProfileSave = async () => {
        const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
        if (!fullName) {
            toast.error("Name cannot be empty.");
            return;
        }
        setIsSubmitting(true);
        try {
            const backendProfileData = {
                name: fullName,
                phone: profileData.mobile || "",
            };
            const res = await axiosSecure.patch(`/users/${user?.email}/profile`, backendProfileData);

            syncUIWithUserData(res.data.profile);

            toast.success('Profile updated successfully!');
            setActiveTab('User Profile');
        } catch (err: any) {
            console.error("Profile save error:", err);
            toast.error(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddressSave = async () => {
        if (!addressData.address) {
            toast.error("Address Line 1 (Street) cannot be empty.");
            return;
        }
        setIsSubmitting(true);
        try {
            // 100% FINAL FIX: Send a flat object with 'address', 'city', 'area' as expected by the backend.
            const backendAddressData = {
                address: addressData.address || "",
                city: addressData.city || "",
                area: addressData.area || "",
            };
            const res = await axiosSecure.patch(`/users/${user?.email}/profile`, backendAddressData);

            syncUIWithUserData(res.data.profile);

            toast.success('Address updated successfully!');
            setActiveTab('User Profile');
        } catch (err: any) {
            console.error("Address save error:", err);
            if (err.response) {
                console.error("Server Response:", err.response.data);
            }
            toast.error(err.response?.data?.message || "Failed to update address.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordUpdate = () => {
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success('Password change simulated!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
            setActiveTab('User Profile');
        }, 1000);
    };

    const openModal = (type: 'cover' | 'profile') => { setEditingImageType(type); setIsModalOpen(true); };
    const closeModal = () => setIsModalOpen(false);
    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setPasswordVisibility(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const passwordFields = [
        { name: 'currentPassword', label: 'Current Password', key: 'current' as const },
        { name: 'newPassword', label: 'New Password', key: 'new' as const },
        { name: 'confirmNewPassword', label: 'Confirm New Password', key: 'confirm' as const }
    ];

    const SubmitButton = ({ onClick, text }: { onClick: () => void, text: string }) => (
        <button
            onClick={onClick}
            disabled={isSubmitting}
            className="bg-orange-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 flex items-center justify-center min-w-[140px]"
        >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : text}
        </button>
    );

    return (
        <div className="bg-gray-100 min-h-screen font-sans relative">
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 bg-white rounded-lg shadow-lg overflow-hidden h-fit">
                        <div className="relative h-40 bg-cover bg-center" style={{ backgroundImage: `url('${coverImage}')` }}>
                            <button onClick={() => openModal('cover')} className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 flex items-center space-x-1">
                                <ImageIcon size={16} /> <span className="text-sm">Edit Cover</span>
                            </button>
                        </div>
                        <div className="relative -mt-20 flex justify-center">
                            <div className="w-32 h-32 bg-gray-200 rounded-full border-4 border-white shadow-md overflow-hidden">
                                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <button onClick={() => openModal('profile')} className="absolute bottom-0 right-[calc(50%-48px)] translate-x-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50">
                                <Edit size={16} />
                            </button>
                        </div>
                        <div className="text-center mt-4 pb-6 border-b mx-6">
                            <h3 className="text-2xl font-bold text-gray-800">{displayName}</h3>
                            <p className="text-gray-500 text-sm truncate">{userData.email}</p>
                            <p className="text-gray-600 text-sm mt-2">Level: <span className="font-semibold text-orange-500">Bronze</span></p>
                        </div>
                        <div className="flex flex-col items-center p-6">
                            <Crown size={48} className="text-orange-400 mb-4" />
                            <button className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg text-lg hover:bg-orange-600 transition-colors">
                                Become Member
                            </button>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex flex-wrap bg-white p-2 rounded-lg shadow-sm border">
                            {['User Profile', 'Update Profile', 'Update Address', 'Change Password'].map(tab => (
                                <button key={tab} className={`flex-grow md:flex-none md:w-auto px-4 py-2 text-sm font-semibold rounded-md ${activeTab === tab ? 'bg-orange-500 text-white shadow' : 'text-gray-700 hover:bg-gray-100'}`} onClick={() => setActiveTab(tab)}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            {activeTab === 'User Profile' && (
                                <div>
                                    <SectionHeader title="Your Profile Details" />
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField id="firstName" label="First Name:" value={profileData.firstName || ''} disabled icon={<User size={18} />} />
                                        <InputField id="lastName" label="Last Name:" value={profileData.lastName || ''} disabled icon={<User size={18} />} />
                                        <InputField id="mobile" label="Mobile:" value={profileData.mobile || 'Not Set'} disabled icon={<Phone size={18} />} />
                                        <InputField id="email" label="Email:" value={userData.email || ''} disabled icon={<Mail size={18} />} />
                                    </div>
                                    <h3 className="font-semibold text-lg mt-6 mb-3">Saved Address:</h3>
                                    <div className="bg-gray-50 p-4 min-h-[80px] border rounded-md text-gray-600">
                                        {addressData.address ? (
                                            <div>
                                                <p>{addressData.address}</p>
                                                <p>{addressData.city}, {addressData.area}</p>
                                            </div>
                                        ) : "Address not added yet!"}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Update Profile' && (
                                <div>
                                    <SectionHeader title="Update Your Profile" />
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField id="updateFirstName" name="firstName" label="First Name" value={profileData.firstName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange(e, setProfileData)} />
                                        <InputField id="updateLastName" name="lastName" label="Last Name" value={profileData.lastName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange(e, setProfileData)} />
                                    </div>
                                    <div className="mt-6">
                                        <InputField id="updateMobile" name="mobile" label="Mobile Number" value={profileData.mobile} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange(e, setProfileData)} />
                                    </div>
                                    <div className="mt-8 text-right">
                                        <SubmitButton onClick={handleProfileSave} text="Save Changes" />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Update Address' && (
                                <div>
                                    <SectionHeader title="Update Your Address" />
                                    <div className="mt-6 space-y-4">
                                        {/* 100% FINAL FIX: name="address" now matches the backend */}
                                        <InputField id="address" name="address" label="Address Line 1 (Street)" value={addressData.address} onChange={handleAddressFormChange} />
                                        <InputField id="city" name="city" label="City" value={addressData.city} onChange={handleAddressFormChange} />
                                        <InputField id="area" name="area" label="Area" value={addressData.area} onChange={handleAddressFormChange} />
                                    </div>
                                    <div className="mt-8 text-right">
                                        <SubmitButton onClick={handleAddressSave} text="Save Address" />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Change Password' && (
                                <div>
                                    <SectionHeader title="Change Your Password" />
                                    <div className="mt-6 space-y-6">
                                        {passwordFields.map((field) => (
                                            <InputField
                                                key={field.key}
                                                id={field.name}
                                                name={field.name}
                                                label={field.label}
                                                type={passwordVisibility[field.key] ? 'text' : 'password'}
                                                value={passwordData[field.name as keyof typeof passwordData]}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange(e, setPasswordData)}
                                                endIcon={<button type="button" onClick={() => togglePasswordVisibility(field.key)}>{passwordVisibility[field.key] ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
                                            />
                                        ))}
                                    </div>
                                    <div className="mt-8 text-right">
                                        <SubmitButton onClick={handlePasswordUpdate} text="Update Password" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ImageUploadModal isOpen={isModalOpen} onClose={closeModal} onUploadSuccess={handleUploadSuccess} title={editingImageType === 'cover' ? 'Update Cover Photo' : 'Update Profile Picture'} imageTypeLabel={editingImageType === 'cover' ? 'Cover Photo' : 'Profile Picture'} />
        </div>
    );
}

