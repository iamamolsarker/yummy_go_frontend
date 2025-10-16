/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Bike,
  MapPin,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  Lock,
} from "lucide-react";

// Make sure to import hooks from your project's correct path
import useAuth from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";

// Define the type for all form data across all steps
type RiderFormData = {
  // Step 1
  vehicleType: "Bike" | "Car" | "Cycle" | "Drone";
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  city: string;
  // Step 2
  dateOfBirth: string;
  division: string;
  services: string[];
  nidPhoto: FileList;
  // Step 3 (Conditional)
  vehicleBrand?: string;
  vehicleModel?: string;
  registrationNumber?: string;
  taxTokenNumber?: string;
  fitnessNumber?: string;
};

// List of all districts in Bangladesh
const districtsOfBangladesh = [
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogra", "Brahmanbaria",
  "Chandpur", "Chapainawabganj", "Chattogram", "Chuadanga", "Comilla", "Cox's Bazar",
  "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj",
  "Habiganj", "Jamalpur", "Jashore", "Jhalokati", "Jhenaidah", "Joypurhat",
  "Khagrachari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur",
  "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar",
  "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi",
  "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh",
  "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur",
  "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet",
  "Tangail", "Thakurgaon"
];

const divisionsOfBangladesh = [
    "Barishal", "Chattogram", "Dhaka", "Khulna", "Mymensingh", "Rajshahi", "Rangpur", "Sylhet"
];

const FoodManForm: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const { createUser, updateUser, loading, setLoading } = useAuth();
  const axiosPublic = useAxios();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<RiderFormData>({
    defaultValues: {
      vehicleType: "Bike",
      services: [],
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const vehicleType = watch("vehicleType");

  const handleNextStep = async (fields: (keyof RiderFormData)[]) => {
    const isValid = await trigger(fields);
    if (isValid) {
      setStep((prev) => prev + 1);
    } else {
      toast.error("Please fill all required fields correctly.");
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit: SubmitHandler<RiderFormData> = async (data) => {
    setLoading(true);
    try {
      await createUser(data.email, data.password);
      const fullName = `${data.firstName} ${data.lastName}`;
      await updateUser({ displayName: fullName });
      const riderInfo = {
        name: fullName, email: data.email, phone: data.phone, role: 'rider', status: 'pending',
        details: {
          vehicleType: data.vehicleType, city: data.city, dateOfBirth: data.dateOfBirth, division: data.division, services: data.services,
          vehicleInfo: (vehicleType === 'Bike' || vehicleType === 'Car') ? {
            brand: data.vehicleBrand, model: data.vehicleModel, registration: data.registrationNumber,
            taxToken: data.taxTokenNumber, fitness: data.fitnessNumber,
          } : null,
        },
      };
      await axiosPublic.post("/api/users", riderInfo);
      toast.success(`Welcome, ${fullName}! Your rider application has been submitted.`);
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong during submission.");
    } finally {
      setLoading(false);
    }
  };

  const finalSubmitStep = (vehicleType === 'Cycle' || vehicleType === 'Drone') ? 2 : 3;

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8 border border-slate-200">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-1">
             <span className="text-sm font-semibold text-slate-700">Step {step} of {finalSubmitStep}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-[#EF451C] h-2 rounded-full transition-all duration-500" style={{ width: `${(step / finalSubmitStep) * 100}%` }}></div>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <div className="animate-fadeIn space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Basic Information & Credentials</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Vehicle Type</label>
                  <div className="relative"><Bike className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><select {...register("vehicleType", { required: true })} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#EF451C] appearance-none"><option>Bike</option><option>Car</option><option>Cycle</option><option>Drone</option></select></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">City</label>
                  <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><select {...register("city", { required: "City is required" })} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#EF451C] appearance-none"><option value="">Select City</option>{districtsOfBangladesh.map(district => <option key={district} value={district}>{district}</option>)}</select>{errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-600 mb-2">First Name</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" {...register("firstName", { required: "First name is required" })} placeholder="Your first name" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg"/></div>{errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}</div>
                <div><label className="block text-sm font-medium text-slate-600 mb-2">Last Name</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" {...register("lastName", { required: "Last name is required" })} placeholder="Your last name" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg"/></div>{errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}</div>
              </div>
              <div><label className="block text-sm font-medium text-slate-600 mb-2">Phone Number</label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="tel" {...register("phone", { required: "Phone number is required" })} placeholder="01XXXXXXXXX" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg"/></div>{errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-600 mb-2">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="email" {...register("email", { required: "Email is required", pattern: /^\S+@\S+$/i })} placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg"/></div>{errors.email && <p className="text-red-500 text-xs mt-1">Please enter a valid email.</p>}</div>
                <div><label className="block text-sm font-medium text-slate-600 mb-2">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type={showPassword ? "text" : "password"} {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })} placeholder="Create a password" className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg"/><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}</div>
              </div>
              <div className="pt-4 flex justify-end"><button type="button" onClick={() => handleNextStep(['vehicleType', 'city', 'firstName', 'lastName', 'phone', 'email', 'password'])} className="px-6 py-3 bg-[#EF451C] text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 flex items-center gap-2">Next Step <ChevronRight size={18} /></button></div>
            </div>
          )}
          {step === 2 && (
            <div className="animate-fadeIn space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Personal & Service Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-600 mb-2">Date of Birth</label><input type="date" {...register("dateOfBirth", { required: "Date of birth is required" })} className="w-full px-4 py-3 border border-slate-200 rounded-lg"/>{errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}</div>
                <div><label className="block text-sm font-medium text-slate-600 mb-2">Division</label><select {...register("division", { required: "Division is required" })} className="w-full px-4 py-3 border border-slate-200 rounded-lg appearance-none"><option value="">Select Division</option>{divisionsOfBangladesh.map(division => <option key={division} value={division}>{division}</option>)}</select>{errors.division && <p className="text-red-500 text-xs mt-1">{errors.division.message}</p>}</div>
              </div>
              <div><label className="block text-sm font-medium text-slate-600 mb-2">Services You'll Provide</label><div className="grid grid-cols-2 gap-4 p-4 border rounded-lg"><label className="flex items-center gap-2"><input type="checkbox" {...register("services")} value="Food Delivery" /> Food Delivery</label><label className="flex items-center gap-2"><input type="checkbox" {...register("services")} value="Parcel Delivery" /> Parcel Delivery</label><label className="flex items-center gap-2"><input type="checkbox" {...register("services")} value="Bike Ride" /> Bike Ride</label></div></div>
              <div><label className="block text-sm font-medium text-slate-600 mb-2">Upload NID/Passport (Image)</label><div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 text-center"><UploadCloud className="mx-auto text-slate-400" size={32} /><p className="mt-2 text-sm text-slate-500">Drag & drop or click to upload</p><input type="file" {...register("nidPhoto")} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"/></div></div>
              <div className="pt-4 flex justify-between">
                <button type="button" onClick={handlePrevStep} className="px-6 py-3 bg-slate-500 text-white font-semibold rounded-lg hover:bg-opacity-90 flex items-center gap-2"><ChevronLeft size={18} /> Back</button>
                {finalSubmitStep === 2 ? (<button type="submit" disabled={loading} className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 flex items-center gap-2 disabled:bg-slate-400">{loading ? 'Submitting...' : 'Submit Application'}</button>) : (<button type="button" onClick={() => handleNextStep(['dateOfBirth', 'division'])} className="px-6 py-3 bg-[#EF451C] text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 flex items-center gap-2">Next Step <ChevronRight size={18} /></button>)}
              </div>
            </div>
          )}
          {step === 3 && (vehicleType === 'Bike' || vehicleType === 'Car') && (
            <div className="animate-fadeIn space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Vehicle Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-600 mb-2">Vehicle Brand</label><input type="text" {...register("vehicleBrand", { required: "Brand is required" })} placeholder="e.g., Honda, Toyota" className="w-full px-4 py-3 border border-slate-200 rounded-lg"/>{errors.vehicleBrand && <p className="text-red-500 text-xs mt-1">{errors.vehicleBrand.message}</p>}</div>
                  <div><label className="block text-sm font-medium text-slate-600 mb-2">Vehicle Model</label><input type="text" {...register("vehicleModel", { required: "Model is required" })} placeholder="e.g., Livo, Corolla" className="w-full px-4 py-3 border border-slate-200 rounded-lg"/>{errors.vehicleModel && <p className="text-red-500 text-xs mt-1">{errors.vehicleModel.message}</p>}</div>
                </div>
                <div><label className="block text-sm font-medium text-slate-600 mb-2">Registration Number</label><input type="text" {...register("registrationNumber", { required: "Registration no. is required" })} placeholder="Dhaka Metro - GA 12-3456" className="w-full px-4 py-3 border border-slate-200 rounded-lg"/>{errors.registrationNumber && <p className="text-red-500 text-xs mt-1">{errors.registrationNumber.message}</p>}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-600 mb-2">Tax Token Number</label><input type="text" {...register("taxTokenNumber")} placeholder="Optional" className="w-full px-4 py-3 border border-slate-200 rounded-lg"/></div>
                  <div><label className="block text-sm font-medium text-slate-600 mb-2">Fitness Number</label><input type="text" {...register("fitnessNumber")} placeholder="Optional" className="w-full px-4 py-3 border border-slate-200 rounded-lg"/></div>
                </div>
                <div className="pt-4 flex justify-between">
                  <button type="button" onClick={handlePrevStep} className="px-6 py-3 bg-slate-500 text-white font-semibold rounded-lg hover:bg-opacity-90 flex items-center gap-2"><ChevronLeft size={18} /> Back</button>
                  <button type="submit" disabled={loading} className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 flex items-center gap-2 disabled:bg-slate-400">{loading ? 'Submitting...' : 'Submit Application'}</button>
                </div>
              </div>
            </div>
          )}
        </form>
        <p className="mt-8 text-center text-sm text-slate-500">Already a rider?{" "}<Link to="/auth/log-in" className="font-semibold text-[#EF451C] hover:underline">Login here</Link></p>
      </div>
    </div>
  );
};

export default FoodManForm;