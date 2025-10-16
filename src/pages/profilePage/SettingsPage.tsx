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
  Loader2,
} from "lucide-react";

// Make sure to import hooks from your project's correct path
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";

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

const InfoField: React.FC<{ label: string; value: string | undefined | null }> = ({ label, value }) => (
    <div className="py-2">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-md text-slate-800">{value || "Not set"}</p>
    </div>
);


// --- Main Component ---
const SettingsPage: React.FC = () => {
  // ✅ FIX: Removed 'updatePassword' and 'updateUser' as they are not being used
  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Profile");
  
  const [userData, setUserData] = useState<any>(null);
  const [notifications, setNotifications] = useState({ email: true, push: false });

  useEffect(() => {
    if (authLoading || !user) {
      setIsLoading(authLoading);
      return;
    }
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const { data } = await axiosSecure.get(`/users/${user.email}`);
        setUserData(data.data || data);
      } catch (err) {
        // If data fails to load from DB, we can still show basic user info from auth
        console.error("Failed to load profile data from database.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [user, authLoading, axiosSecure]);

  if (isLoading || authLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-[#EF451C]" size={48}/></div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Settings</h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-1 space-y-8">
             <div className="bg-white p-6 rounded-xl shadow-sm text-center border">
                <img 
                    src={user?.photoURL || 'https://i.ibb.co/PZjxHVfY/yummy-go-logo.png'} 
                    alt="Profile" 
                    className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-md mx-auto mb-4"
                />
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
                    <div>
                        <SectionHeader title="Profile Information" subtitle="Your personal details."/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                            <InfoField label="Full Name" value={userData?.name || user?.displayName} />
                            <InfoField label="Phone Number" value={userData?.phone} />
                            <InfoField label="Email Address" value={userData?.email || user?.email} />
                        </div>
                    </div>
                )}
                {activeTab === 'Address' && (
                     <div>
                        <SectionHeader title="Address Management" subtitle="Your saved delivery address."/>
                        <div className="space-y-6 mt-6">
                           <InfoField label="Address Line 1" value={userData?.address?.addressLine1} />
                           <InfoField label="City" value={userData?.address?.city} />
                           <InfoField label="Post Code" value={userData?.address?.postCode} />
                        </div>
                    </div>
                )}
                {activeTab === 'Security' && (
                    <div>
                        <SectionHeader title="Account Security" subtitle="Manage account security settings."/>
                         <div className="mt-6">
                            <p className="text-sm text-slate-600">Password changes are handled by your authentication provider. You can reset your password from the login page if needed.</p>
                         </div>
                         <div className="mt-12 pt-6 border-t border-red-200">
                             <h3 className="font-bold text-red-600">Deactivate Account</h3>
                             <p className="text-sm text-slate-500 mt-1">This action is permanent and cannot be undone.</p>
                             <button type="button" onClick={() => toast.info('This feature will be available soon.')} className="mt-4 bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 opacity-50 cursor-not-allowed">Deactivate Account</button>
                         </div>
                    </div>
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
       <style>{`.switch{position:relative;display:inline-block;width:50px;height:28px}.switch input{opacity:0;width:0;height:0}.slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;transition:.4s}.slider:before{position:absolute;content:"";height:20px;width:20px;left:4px;bottom:4px;background-color:#fff;transition:.4s}input:checked+.slider{background-color:#EF451C}input:focus+.slider{box-shadow:0 0 1px #EF451C}input:checked+.slider:before{transform:translateX(22px)}.slider.round{border-radius:34px}.slider.round:before{border-radius:50%}`}</style>
    </div>
  );
};

export default SettingsPage;