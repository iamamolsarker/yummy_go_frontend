/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  User,
  MapPin,
  Shield,
  Bell,
  CreditCard,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import ImageUploadModal from './imageUpload/ImageUploadModal'; 

// --- Reusable Components ---
const SettingsSidebarItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-semibold rounded-lg transition-colors ${active ? "bg-[#EF451C] text-white" : "text-slate-600 hover:bg-slate-100"}`}>
    {icon} <span>{label}</span>
  </button>
);

const SectionHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="pb-4 border-b border-slate-200">
    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
  </div>
);

// --- Main Component ---
const SettingsPage: React.FC = () => {
  const { user, loading: authLoading, updatePassword, updateUser } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Profile");
  
  const [profileData, setProfileData] = useState({ name: "", phone: "" });
  const [addressData, setAddressData] = useState({ addressLine1: "", city: "", postCode: "" });
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmNewPassword: "" });
  const [passwordVisibility, setPasswordVisibility] = useState({ new: false, confirm: false });
  const [notifications, setNotifications] = useState({ email: true, push: false });
  
  const [profileImage, setProfileImage] = useState(user?.photoURL || 'https://i.ibb.co.com/PZjxHVfY/yummy-go-logo.png');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (authLoading || !user) {
      setIsLoading(authLoading);
      return;
    }
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const { data } = await axiosSecure.get(`/users/${user.email}`);
        const userData = data.data || data;
        
        setProfileData({ name: userData.name || user.displayName || "", phone: userData.phone || "" });
        setAddressData({
          addressLine1: userData.address?.addressLine1 || "",
          city: userData.address?.city || "",
          postCode: userData.address?.postCode || "",
        });
        setProfileImage(userData.photoURL || user.photoURL || 'https://i.ibb.co/PZjxHVfY/yummy-go-logo.png');
        
      } catch (err) {
        setError("Failed to load your profile data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [user, authLoading, axiosSecure]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateUser({ displayName: profileData.name });
      await axiosSecure.patch(`/users/${user?.email}`, { name: profileData.name, phone: profileData.phone });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axiosSecure.patch(`/users/${user?.email}`, { address: addressData });
      toast.success("Address updated successfully!");
    } catch (err) {
      toast.error("Failed to update address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await updatePassword(passwordData.newPassword);
      toast.success("Password updated successfully!");
      setPasswordData({ newPassword: "", confirmNewPassword: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleImageUploadSuccess = async (newUrl: string) => {
    try {
        await updateUser({ photoURL: newUrl });
        await axiosSecure.patch(`/users/${user?.email}`, { photoURL: newUrl });
        setProfileImage(newUrl);
        toast.success("Profile picture updated!");
    } catch (error: any) {
        toast.error(error.message || "Failed to update profile picture.");
    }
    setIsModalOpen(false);
  };

  if (isLoading || authLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-[#EF451C]" size={48}/></div>;
  }
  if (error) {
    return <div className="flex justify-center items-center h-full text-red-500"><AlertCircle className="mr-2"/> {error}</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Settings</h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-1 space-y-8">
             <div className="bg-white p-6 rounded-xl shadow-sm text-center border">
                <div className="relative w-24 h-24 mx-auto mb-4 group">
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-full border-4 border-white shadow-md"/>
                    <button onClick={() => setIsModalOpen(true)} className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity">
                        <Edit size={24} className="text-white opacity-0 group-hover:opacity-100"/>
                    </button>
                </div>
                <h2 className="font-bold text-xl text-slate-800">{user?.displayName}</h2>
                <p className="text-sm text-slate-500 truncate">{user?.email}</p>
             </div>
             
             <div className="bg-white p-4 rounded-xl shadow-sm space-y-1 border">
                <SettingsSidebarItem icon={<User size={18}/>} label="Profile" active={activeTab === 'Profile'} onClick={() => setActiveTab('Profile')} />
                <SettingsSidebarItem icon={<MapPin size={18}/>} label="Address" active={activeTab === 'Address'} onClick={() => setActiveTab('Address')} />
                <SettingsSidebarItem icon={<Shield size={18}/>} label="Security" active={activeTab === 'Security'} onClick={() => setActiveTab('Security')} />
                <SettingsSidebarItem icon={<Bell size={18}/>} label="Notifications" active={activeTab === 'Notifications'} onClick={() => setActiveTab('Notifications')} />
                <SettingsSidebarItem icon={<CreditCard size={18}/>} label="Membership" active={activeTab === 'Membership'} onClick={() => setActiveTab('Membership')} />
             </div>
          </div>

          <div className="lg:col-span-3">
             <div className="bg-white p-8 rounded-xl shadow-sm border min-h-[500px]">
                {activeTab === 'Profile' && (
                    <form onSubmit={handleProfileSave}>
                        <SectionHeader title="Profile Information" subtitle="Update your personal details here."/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div><label className="block text-sm font-medium text-slate-600 mb-2">Full Name</label><input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full p-2 border rounded-md"/></div>
                            <div><label className="block text-sm font-medium text-slate-600 mb-2">Phone Number</label><input type="tel" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full p-2 border rounded-md"/></div>
                            <div><label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label><input type="email" value={user?.email || ''} className="w-full p-2 border rounded-md bg-slate-100 text-slate-500" disabled/></div>
                        </div>
                        <div className="mt-8 text-right"><button type="submit" disabled={isSubmitting} className="bg-[#EF451C] text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 disabled:bg-slate-400">{isSubmitting ? 'Saving...' : 'Save Changes'}</button></div>
                    </form>
                )}
                {activeTab === 'Address' && (
                     <form onSubmit={handleAddressSave}>
                        <SectionHeader title="Address Management" subtitle="Manage your delivery address."/>
                        <div className="space-y-4 mt-6">
                            <div><label className="block text-sm font-medium text-slate-600 mb-2">Address Line 1</label><input type="text" value={addressData.addressLine1} onChange={e => setAddressData({...addressData, addressLine1: e.target.value})} className="w-full p-2 border rounded-md"/></div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="block text-sm font-medium text-slate-600 mb-2">City</label><input type="text" value={addressData.city} onChange={e => setAddressData({...addressData, city: e.target.value})} className="w-full p-2 border rounded-md"/></div>
                                 <div><label className="block text-sm font-medium text-slate-600 mb-2">Post Code</label><input type="text" value={addressData.postCode} onChange={e => setAddressData({...addressData, postCode: e.target.value})} className="w-full p-2 border rounded-md"/></div>
                            </div>
                        </div>
                        <div className="mt-8 text-right"><button type="submit" disabled={isSubmitting} className="bg-[#EF451C] text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 disabled:bg-slate-400">{isSubmitting ? 'Saving...' : 'Save Address'}</button></div>
                    </form>
                )}
                {activeTab === 'Security' && (
                    <form onSubmit={handlePasswordUpdate}>
                        <SectionHeader title="Account Security" subtitle="Change your password and manage account security."/>
                         <div className="space-y-4 mt-6 max-w-md">
                             <div><label className="block text-sm font-medium text-slate-600 mb-2">New Password</label><div className="relative"><input type={passwordVisibility.new ? 'text' : 'password'} value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full p-2 pr-10 border rounded-md"/><button type="button" onClick={() => setPasswordVisibility(p => ({...p, new: !p.new}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{passwordVisibility.new ? <EyeOff/> : <Eye/>}</button></div></div>
                             <div><label className="block text-sm font-medium text-slate-600 mb-2">Confirm New Password</label><div className="relative"><input type={passwordVisibility.confirm ? 'text' : 'password'} value={passwordData.confirmNewPassword} onChange={e => setPasswordData({...passwordData, confirmNewPassword: e.target.value})} className="w-full p-2 pr-10 border rounded-md"/><button type="button" onClick={() => setPasswordVisibility(p => ({...p, confirm: !p.confirm}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{passwordVisibility.confirm ? <EyeOff/> : <Eye/>}</button></div></div>
                        </div>
                         <div className="mt-8 text-right"><button type="submit" disabled={isSubmitting} className="bg-[#EF451C] text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 disabled:bg-slate-400">{isSubmitting ? 'Updating...' : 'Update Password'}</button></div>
                         <div className="mt-12 pt-6 border-t border-red-200">
                             <h3 className="font-bold text-red-600">Deactivate Account</h3>
                             <p className="text-sm text-slate-500 mt-1">This action is permanent and cannot be undone.</p>
                             <button type="button" onClick={() => toast.info('This feature will be available soon.')} className="mt-4 bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 opacity-50 cursor-not-allowed">Deactivate Account</button>
                         </div>
                    </form>
                )}
                {activeTab === 'Notifications' && (
                    <div>
                         <SectionHeader title="Notification Settings" subtitle="Manage how you receive communications."/>
                         <div className="space-y-4 mt-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg"><p className="font-semibold text-slate-700">Email Notifications</p><label className="switch"><input type="checkbox" checked={notifications.email} onChange={() => setNotifications(p => ({...p, email: !p.email}))} /><span className="slider round"></span></label></div>
                             <div className="flex items-center justify-between p-4 border rounded-lg"><p className="font-semibold text-slate-700">Push Notifications</p><label className="switch"><input type="checkbox" checked={notifications.push} onChange={() => setNotifications(p => ({...p, push: !p.push}))} /><span className="slider round"></span></label></div>
                         </div>
                    </div>
                )}
                 {activeTab === 'Membership' && (
                    <div>
                        <SectionHeader title="Membership & Billing" subtitle="Manage your subscription plan."/>
                         <div className="mt-6 p-6 border rounded-lg bg-gradient-to-r from-orange-50 to-amber-50">
                             <p className="text-slate-500">Current Plan</p>
                             <p className="text-2xl font-bold text-slate-800">Free User</p>
                             <p className="text-sm text-slate-600 mt-4">Upgrade to a Premium plan to unlock exclusive features, faster delivery, and special discounts.</p>
                             <button className="mt-6 bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-900">Upgrade to Premium</button>
                         </div>
                    </div>
                 )}
             </div>
          </div>
        </div>
      </div>
       <ImageUploadModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onUploadSuccess={handleImageUploadSuccess} 
          title="Update Profile Picture" 
          imageTypeLabel="Select a new Profile Picture"
        />
       <style>{`.switch{position:relative;display:inline-block;width:50px;height:28px}.switch input{opacity:0;width:0;height:0}.slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;transition:.4s}.slider:before{position:absolute;content:"";height:20px;width:20px;left:4px;bottom:4px;background-color:#fff;transition:.4s}input:checked+.slider{background-color:#EF451C}input:focus+.slider{box-shadow:0 0 1px #EF451C}input:checked+.slider:before{transform:translateX(22px)}.slider.round{border-radius:34px}.slider.round:before{border-radius:50%}`}</style>
    </div>
  );
};

export default SettingsPage;