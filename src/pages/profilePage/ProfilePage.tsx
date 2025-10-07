/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Edit, Crown, Image as ImageIcon, User, Phone, Mail, Eye, EyeOff } from 'lucide-react';
import ProfileOpeningLoading from './loading/ProfileOpeningLoading';
import useAuth from '../../hooks/useAuth';
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

// --- Type Definitions ---
type Address = {
    addressLine1: string;
    city: string;
    postCode: string;
};

type CustomUser = {
    email?: string | null;
    photoURL?: string | null;
    displayName?: string | null;
    firstName?: string;
    lastName?: string;
    mobile?: string;
    address?: Address | null;
};

export default function ProfilePage() {
    // --- Hooks and State ---
    // FIX: Removed 'reFetch' as it is not provided by your useAuth hook.
    const { user, loading } = useAuth();
    
    const [userData, setUserData] = useState<CustomUser | null>(user as CustomUser | null);
    const [activeTab, setActiveTab] = useState('User Profile');
    const [successMessage, setSuccessMessage] = useState('');

    const [coverImage, setCoverImage] = useState('https://i.ibb.co/nN4RbRsK/yummy-go-car-bike.png');
    const [profileImage, setProfileImage] = useState('https://i.ibb.co/PZjxHVfY/yummy-go-logo.png');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingImageType, setEditingImageType] = useState<'cover' | 'profile' | null>(null);

    const [profileData, setProfileData] = useState({ firstName: '', lastName: '', mobile: '' });
    const [addressData, setAddressData] = useState({ addressLine1: '', city: '', postCode: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    const [passwordVisibility, setPasswordVisibility] = useState({ current: false, new: false, confirm: false });

    useEffect(() => {
        if (user) {
            const typedUser = user as CustomUser;
            setUserData(typedUser); 
            
            let firstName = typedUser.firstName || '';
            let lastName = typedUser.lastName || '';

            if (!firstName && typedUser.displayName) {
                const nameParts = typedUser.displayName.split(' ');
                firstName = nameParts[0] || '';
                lastName = nameParts.slice(1).join(' ') || '';
            }

            setProfileData({
                firstName: firstName,
                lastName: lastName,
                mobile: typedUser.mobile || '',
            });

            setAddressData({
                addressLine1: typedUser.address?.addressLine1 || '',
                city: typedUser.address?.city || '',
                postCode: typedUser.address?.postCode || '',
            });

            if (typedUser.photoURL) {
                setProfileImage(typedUser.photoURL);
            }
        }
    }, [user]);
    
    useEffect(() => {
        const savedProfile = localStorage.getItem('userProfileImage');
        const savedCover = localStorage.getItem('userCoverImage');
        if (savedProfile) {
            setProfileImage(savedProfile);
        }
        if (savedCover) {
            setCoverImage(savedCover);
        }
    }, []);

    if (loading) return <ProfileOpeningLoading />;
    if (!userData) return <div className="flex items-center justify-center min-h-screen">User not found.</div>;

    const displayName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.displayName || 'User';

    // --- Handlers ---
    const showSuccessMessage = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>, setState: React.Dispatch<React.SetStateAction<any>>) => {
        setState((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUploadSuccess = (newUrl: string) => {
        if (editingImageType === 'cover') {
            setCoverImage(newUrl);
            localStorage.setItem('userCoverImage', newUrl);
        } else if (editingImageType === 'profile') {
            setProfileImage(newUrl);
            localStorage.setItem('userProfileImage', newUrl);
        }
        closeModal();
    };
    
    // FIX: Removed 'async' and the 'reFetch' call from the save handlers.
    const handleProfileSave = () => {
        setUserData(prev => ({ ...prev, ...profileData })); 
        showSuccessMessage('Profile updated for this session!');
        setActiveTab('User Profile');
    };
    const handleAddressSave = () => {
        setUserData(prev => ({ ...prev, address: addressData })); 
        showSuccessMessage('Address updated for this session!');
        setActiveTab('User Profile');
    };
    const handlePasswordUpdate = () => {
        if (passwordData.newPassword !== passwordData.confirmNewPassword) return alert("New passwords do not match.");
        showSuccessMessage('Password change simulated!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        setActiveTab('User Profile');
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

    return (
        <div className="bg-gray-100 min-h-screen font-sans relative">
            {successMessage && (
                <div className="fixed top-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-pulse">
                    {successMessage}
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 bg-white rounded-lg shadow-lg overflow-hidden">
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
                                        {addressData.addressLine1 ? (
                                            <div>
                                                <p>{addressData.addressLine1}</p>
                                                <p>{addressData.city}, {addressData.postCode}</p>
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
                                        <button onClick={handleProfileSave} className="bg-orange-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-orange-600">Save Changes</button>
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'Update Address' && (
                                <div>
                                    <SectionHeader title="Update Your Address" />
                                    <div className="mt-6 space-y-4">
                                        <InputField id="addressLine1" name="addressLine1" label="Address Line 1" value={addressData.addressLine1} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange(e, setAddressData)} />
                                        <InputField id="city" name="city" label="City" value={addressData.city} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange(e, setAddressData)} />
                                        <InputField id="postCode" name="postCode" label="Post Code" value={addressData.postCode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormChange(e, setAddressData)} />
                                    </div>
                                    <div className="mt-8 text-right">
                                        <button onClick={handleAddressSave} className="bg-orange-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-orange-600">Save Address</button>
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
                                        <button onClick={handlePasswordUpdate} className="bg-orange-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-orange-600">Update Password</button>
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