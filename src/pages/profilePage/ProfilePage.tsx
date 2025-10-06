import React, { useState, useRef, useEffect } from 'react';
import { User, Key, Edit, Crown, Phone, Mail, Image as ImageIcon, Upload, X, Plus } from 'lucide-react';

// --- Helper Components (No changes here) ---
type SectionHeaderProps = { title: string; info?: boolean; };
const SectionHeader: React.FC<SectionHeaderProps> = ({ title, info = false }) => ( /* ... code omitted for brevity ... */
    <div className="pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            {info && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )}
        </div>
    </div>
);

type InputFieldProps = { id: string; label: string; icon?: React.ReactNode; } & React.InputHTMLAttributes<HTMLInputElement>;
const InputField: React.FC<InputFieldProps> = ({ id, label, type = 'text', icon, ...props }) => ( /* ... code omitted for brevity ... */
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <div className="relative">
            {icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {icon}
                </div>
            )}
            <input
                type={type}
                id={id}
                {...props}
                className={`w-full p-2.5 border border-gray-300 rounded-md shadow-sm transition duration-150 ease-in-out
                            focus:ring-2 focus:ring-blue-200 focus:border-blue-500
                            disabled:bg-gray-100 disabled:cursor-not-allowed
                            ${icon ? 'pl-10' : ''}`}
            />
        </div>
    </div>
);

// --- NEW: Reusable Image Upload Modal Component (Redesigned & Adjusted for Transparency) ---
type ImageUploadModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: (url: string) => void;
    title: string;
    imageTypeLabel: string;
};

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, onUploadSuccess, title, imageTypeLabel }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_UPLOAD_API;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setUploadError(null);
        }
    };

    const handleClose = () => {
        if (isUploading) return;
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadError(null);
        onClose();
    };
    
    const handleUpdate = async () => {
        if (!selectedFile) return;
        if (!IMGBB_API_KEY) {
            setUploadError("Image upload service not configured.");
            return;
        }

        const formData = new FormData();
        formData.append("image", selectedFile);
        setIsUploading(true);
        setUploadError(null);

        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed. Please try again.");

            const data = await response.json();
            if (data.success && data.data?.url) {
                onUploadSuccess(data.data.url);
                handleClose();
            } else {
                throw new Error("Could not get image URL after upload.");
            }
        } catch (error: any) {
            setUploadError(error.message);
        } finally {
            setIsUploading(false);
        }
    };
    
    return (
        // Modal Overlay - Changed for better transparency control
        <div
            className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-opacity duration-300
                        ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        >
            {/* Background overlay */}
            <div 
                className={`absolute inset-0 bg-black transition-opacity duration-300
                            ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0'}`}
                onClick={handleClose} // Allow clicking outside to close
            ></div>

            {/* Modal Content */}
            <div
                className={`relative bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-out
                            ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                {/* Modal Body */}
                <div className="p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {imageTypeLabel}
                    </label>
                    
                    {previewUrl ? (
                        <div className="w-full min-h-[150px] border border-gray-200 rounded-md p-2 flex flex-col items-center">
                            <img src={previewUrl} alt="Preview" className="max-h-48 w-auto object-contain rounded-md" />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-3 text-sm font-semibold text-orange-600 hover:text-orange-800">
                                Change file
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <Plus size={16} />
                            <span>Choose file</span>
                        </button>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
                </div>
                {/* Modal Footer */}
                <div className="flex justify-end items-center px-6 py-4 bg-gray-50 border-t rounded-b-lg">
                    <button
                        onClick={handleUpdate}
                        disabled={!selectedFile || isUploading}
                        className="px-8 py-2.5 bg-orange-500 text-white rounded-md font-semibold hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                    >
                        {isUploading ? (
                           <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                        ) : 'Update'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Default image URLs
const DEFAULT_COVER_IMAGE = 'https://i.ibb.co/nN4RbRsK/yummy-go-car-bike.png';
const DEFAULT_PROFILE_IMAGE = 'https://i.ibb.co/DfRJn88z/Sizzling-Steak.jpg';

// The main Profile Page component
export default function ProfilePage(): JSX.Element {
    const [activeTab, setActiveTab] = useState('User Profile');
    const [coverImage, setCoverImage] = useState<string>(DEFAULT_COVER_IMAGE);
    const [profileImage, setProfileImage] = useState<string>(DEFAULT_PROFILE_IMAGE);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingImageType, setEditingImageType] = useState<'cover' | 'profile' | null>(null);

    useEffect(() => {
        const savedCover = localStorage.getItem('userCoverImage');
        const savedProfile = localStorage.getItem('userProfileImage');
        if (savedCover) setCoverImage(savedCover);
        if (savedProfile) setProfileImage(savedProfile);
    }, []);

    const openModal = (type: 'cover' | 'profile') => {
        setEditingImageType(type);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleUploadSuccess = (newUrl: string) => {
        if (editingImageType === 'cover') {
            setCoverImage(newUrl);
            localStorage.setItem('userCoverImage', newUrl);
        } else if (editingImageType === 'profile') {
            setProfileImage(newUrl);
            localStorage.setItem('userProfileImage', newUrl);
        }
    };
    
    const renderTabContent = () => { /* ... code omitted for brevity ... */
        switch (activeTab) {
            case 'User Profile':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField id="firstName" label="First Name:" defaultValue="Smart" icon={<User size={18} className="text-gray-400"/>} />
                            <InputField id="mobile" label="Mobile: N/A" defaultValue="N/A" disabled icon={<Phone size={18} className="text-gray-400"/>} />
                            <InputField id="lastName" label="Last Name:" defaultValue="Proxy" icon={<User size={18} className="text-gray-400"/>} />
                            <InputField id="email" label="Email:" defaultValue="proxysmart5@gmail.com" disabled icon={<Mail size={18} className="text-gray-400"/>} />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-800 mt-6 mb-3">Saved Address:</h3>
                        <div className="bg-gray-50 p-4 min-h-[100px] border border-gray-200 rounded-md text-gray-600">
                            Address not added yet!
                        </div>
                    </div>
                );
            case 'Update Profile':
                 return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <SectionHeader title="Update Profile" />
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField id="updateFirstName" label="First name" defaultValue="Smart" />
                            <InputField id="updateLastName" label="Last name" defaultValue="Proxy" />
                        </div>
                        <div className="mt-6">
                            <InputField id="updateMobile" label="Mobile number" placeholder="Enter your mobile number" />
                        </div>
                        <div className="mt-8 text-right">
                            <button className="bg-orange-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-orange-600 transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </div>
                );
            case 'Update Address':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <SectionHeader title="Update Address" />
                        <div className="mt-6 space-y-4">
                            <InputField id="addressLine1" label="Address Line 1" placeholder="e.g. House No, Street Name" />
                            <InputField id="city" label="City" placeholder="e.g. Dhaka" />
                            <InputField id="postCode" label="Post Code" placeholder="e.g. 1207" />
                        </div>
                        <div className="mt-8 text-right">
                            <button className="bg-orange-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-orange-600 transition-colors">
                                Save Address
                            </button>
                        </div>
                    </div>
                );
            case 'Change Password':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <SectionHeader title="Change Password" />
                        <div className="mt-6 space-y-6">
                            <InputField id="currentPassword" label="Current password" type="password" placeholder="••••••••" />
                            <InputField id="newPassword" label="New password" type="password" placeholder="••••••••" />
                            <InputField id="confirmNewPassword" label="Confirm new password" type="password" placeholder="••••••••" />
                        </div>
                        <div className="mt-8 text-right">
                            <button className="bg-orange-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-orange-600 transition-colors">
                                Update Password
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar - User Summary */}
                    <div className="lg:col-span-1 bg-white rounded-lg shadow-lg overflow-hidden">
                        {/* Banner Image - Removed black overlay */}
                        <div 
                            className="relative h-40 bg-cover bg-center transition-all duration-300" 
                            style={{ backgroundImage: `url('${coverImage}')` }}
                        >
                            {/* REMOVED: <div className="absolute inset-0 bg-black bg-opacity-30"></div> */}
                            {/* Cover image edit button */}
                            <button
                                className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors flex items-center space-x-1"
                                onClick={() => openModal('cover')}
                            >
                                <ImageIcon size={16} className="text-gray-600" />
                                <span className="text-sm text-gray-700">Edit Cover</span>
                            </button>
                        </div>
                        {/* Profile Picture */}
                        <div className="relative -mt-20 flex justify-center">
                            <div className="w-32 h-32 bg-gray-200 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            {/* Profile image edit button */}
                            <button
                                className="absolute bottom-0 right-[calc(50%-48px)] translate-x-1/2 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
                                onClick={() => openModal('profile')}
                            >
                                <Edit size={16} className="text-gray-600" />
                            </button>
                        </div>
                        
                        {/* Other sections of the sidebar... */}
                         <div className="text-center mt-4 pb-6 border-b border-gray-200 mx-6">
                            <h3 className="text-2xl font-bold text-gray-800">Smart Proxy</h3>
                            <p className="text-gray-600 text-sm">Level: <span className="font-semibold text-orange-500">Bronze</span> | Point: <span className="font-semibold">0</span></p>
                        </div>
                         <div className="grid grid-cols-4 gap-4 text-center py-6 border-b border-gray-200 mx-6">
                            <div>
                                <p className="text-lg font-bold text-gray-800">0</p>
                                <p className="text-sm text-gray-500">Total</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-800">0</p>
                                <p className="text-sm text-gray-500">Delivery</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-800">0</p>
                                <p className="text-sm text-gray-500">Pick-up</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-800">0</p>
                                <p className="text-sm text-gray-500">Flowers</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center p-6">
                            <Crown size={48} className="text-orange-400 mb-4" />
                            <button className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg text-lg hover:bg-orange-600 transition-colors">
                                Become Member
                            </button>
                        </div>
                    </div>

                    {/* Right Content - Tabbed Sections */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs Navigation */}
                        <div className="flex flex-wrap bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                           {['User Profile', 'Update Profile', 'Update Address', 'Change Password'].map(tab => (
                                <button
                                    key={tab}
                                    className={`flex-grow md:flex-none md:w-auto px-4 py-2 text-sm md:text-base font-semibold rounded-md transition-colors duration-200
                                                ${activeTab === tab ? 'bg-orange-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        {renderTabContent()}
                    </div>
                </div>
            </div>

            {/* The Modal for uploading images */}
            <ImageUploadModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onUploadSuccess={handleUploadSuccess}
                title={editingImageType === 'cover' ? 'Update Cover Photo' : 'Update Profile Picture'}
                imageTypeLabel={editingImageType === 'cover' ? 'Cover Photo' : 'Profile Picture'}
            />
        </div>
    );
}