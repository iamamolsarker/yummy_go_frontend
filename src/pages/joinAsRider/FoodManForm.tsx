
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, type ReactNode } from "react";
import { useForm, type SubmitHandler } from "react-hook-form"; // Removed Controller for simplicity unless needed
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAxios from "../../hooks/useAxios";
import {
    Eye, EyeOff, User, Mail, Phone, Lock, MapPin, Calendar, CreditCard,
    Bike, Hash, Building, Tag, Loader2
} from "lucide-react";

type FoodManFormData = {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    city: string;
    password?: string;
    confirm_password?: string;
    dob: string;
    nid_number: string;
    vehicle_type: string;
    vehicle_brand: string;
    vehicle_model: string;
    registration_number: string;
    tax_token_number: string;
    fitness_number: string;
};

interface UserProfileData {
    phone?: string;
    city?: string;
    dob?: string;
    nid?: string;
}


const FoodManForm: React.FC = () => {
    // FIX: Destructure setLoading from useAuth correctly if it's provided, otherwise remove if managing locally
    // Assuming setLoading from useAuth is NOT for form submission state.
    const { user, loading: authLoading, createUser, updateUser } = useAuth();
    const axiosPublic = useAxios();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FoodManFormData>({
         defaultValues: {
            first_name: "", last_name: "", email: "", phone: "", city: "",
            dob: "", nid_number: "", vehicle_type: "Bike", vehicle_brand: "",
            vehicle_model: "", registration_number: "", tax_token_number: "",
            fitness_number: "", password: "", confirm_password: "",
         }
    });

    const [isDataLoaded, setIsDataLoaded] = useState(!user);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // FIX: Add local loading state for submission process
    const [isSubmitting, setIsSubmitting] = useState(false);


    // Load user data if logged in
    useEffect(() => {
        let isMounted = true;
        if (user?.email) {
            // Check if data needs loading only if it hasn't been loaded yet to avoid re-fetch loops
            if (!isDataLoaded) {
                 setIsDataLoaded(false); // Mark as loading

                const nameParts = user.displayName?.split(" ") || [];
                const firstName = nameParts[0] || "";
                const lastName = nameParts.slice(1).join(" ") || "";
                if (isMounted) {
                    setValue("first_name", firstName);
                    setValue("last_name", lastName);
                    setValue("email", user.email);
                    if (user.phoneNumber) {
                        setValue("phone", user.phoneNumber);
                    }
                }

                axiosSecure
                    .get<{ data?: UserProfileData } | UserProfileData>(`/users/${user.email}`)
                    .then((res) => {
                        if (!isMounted) return;
                        const userData = res.data && 'data' in res.data ? res.data.data : res.data;
                        console.log("Fetched User DB Data:", userData);
                        if (userData) {
                            setValue("phone", userData.phone || user.phoneNumber || "");
                            setValue("city", userData.city || "");
                            const dob = userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : "";
                            setValue("dob", dob);
                            setValue("nid_number", userData.nid || "");
                        } else {
                            console.warn("User data structure from API might be unexpected or empty.");
                        }
                    })
                    .catch((err) => {
                         if (err.response?.status !== 404) {
                           console.error("Failed to fetch user data from DB:", err);
                           toast.error("Could not load full profile details.");
                         } else {
                           console.warn("No additional user data found in DB (404). Ready for input.");
                         }
                    })
                    .finally(() => {
                        if (isMounted) {
                           setIsDataLoaded(true);
                        }
                    });
            } // End if !isDataLoaded check
            else {
                 // If user exists and data is already marked as loaded, do nothing further.
            }
        } else {
             // No user logged in, form is ready
             if (isMounted) setIsDataLoaded(true);
        }
        return () => { isMounted = false; };
    }, [user, axiosSecure, setValue, isDataLoaded]); // Keep isDataLoaded here to trigger effect completion


    // Submit handler
    const onSubmit: SubmitHandler<FoodManFormData> = async (data) => {
        // FIX: Use local isSubmitting state
        setIsSubmitting(true);
        const firstNameTrimmed = data.first_name.trim();
        const lastNameTrimmed = data.last_name.trim();
        const fullName = `${firstNameTrimmed} ${lastNameTrimmed}`.trim();

        const riderApplicationData = {
            name: fullName, email: data.email.trim(), phone: data.phone.trim(),
            vehicle: { type: data.vehicle_type.toLowerCase(), model: `${data.vehicle_brand.trim()} ${data.vehicle_model.trim()}`.trim(), license_plate: data.registration_number.trim(), },
            documents: { nid: data.nid_number.trim(), driving_license: data.registration_number.trim(), },
            location: { city: data.city }, dob: data.dob,
            ...(data.nid_number.trim() && { nid_number: data.nid_number.trim() }),
            ...(data.tax_token_number.trim() && { tax_token_number: data.tax_token_number.trim() }),
            ...(data.fitness_number.trim() && { fitness_number: data.fitness_number.trim() }),
            status: "pending", is_verified: false,
        };

        try {
            if (user) {
                 const userProfileUpdate: Partial<UserProfileData> = {
                     phone: data.phone.trim(), city: data.city, dob: data.dob, nid: data.nid_number.trim(),
                 };
                Object.keys(userProfileUpdate).forEach(key => (userProfileUpdate as any)[key] === '' && delete (userProfileUpdate as any)[key]);

                console.log("Existing user applying. Updating profile:", userProfileUpdate);
                console.log("Creating rider application:", riderApplicationData);

                await Promise.all([
                    axiosSecure.patch(`/users/${user.email}/profile`, userProfileUpdate),
                    axiosSecure.post("/riders", riderApplicationData),
                ]);
                console.log("Profile updated and rider application submitted.");
                toast.success("Your rider application is pending approval!");

            } else {
                if (data.password !== data.confirm_password) {
                    toast.error("Passwords do not match!"); setIsSubmitting(false); return; // FIX: Use setIsSubmitting
                }
                console.log("New user registering...");
                const userCredential = await createUser(data.email, data.password!);
                console.log("Firebase user created:", userCredential?.user?.uid);

                if (fullName) {
                    await updateUser({ displayName: fullName });
                    console.log("Firebase profile updated.");
                }

                const newUserData = {
                    name: fullName, email: data.email.trim(), phone: data.phone.trim(), city: data.city,
                    dob: data.dob, nid: data.nid_number.trim(), role: "user",
                };
                console.log("Creating user in DB:", newUserData);
                console.log("Creating rider application:", riderApplicationData);

                await Promise.all([
                    axiosPublic.post("/users", newUserData),
                    axiosPublic.post("/riders", riderApplicationData),
                ]);
                console.log("DB user created and rider application submitted.");
                toast.success("Registration successful! Your rider application is submitted.");
            }
            navigate("/"); // Redirect on success
        } catch (err: any) {
            console.error("Submission Error:", err);
            console.error("Error Response Data:", err.response?.data);
            if (err.code === "auth/email-already-in-use") {
                toast.error("This email is already registered. Please log in.");
            } else if (err.response) {
                const backendMessage = err.response.data?.message || `Request failed (${err.response.status})`;
                toast.error(backendMessage);
            } else {
                toast.error("Something went wrong. Check connection or contact support.");
            }
        } finally {
            // FIX: Use local isSubmitting state
            setIsSubmitting(false);
        }
    };

    // --- Loading State ---
    // Show loader if auth is loading OR initial data load isn't complete
    if (authLoading || !isDataLoaded) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 text-slate-500">
                <Loader2 className="animate-spin text-[#EF451C]" size={40} />
                <p className="mt-4 text-base font-semibold">Loading...</p>
            </div>
        );
    }

    // --- Common Input Styling ---
    const inputBaseClass = "w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#EF451C] focus:border-[#EF451C] text-sm";
    const disabledInputClass = "disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500";
    const selectBaseClass = `${inputBaseClass} appearance-none bg-white cursor-pointer`;
    const iconBaseClass = "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none";

    // --- JSX ---
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8">
            <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-6 md:p-8 border border-slate-200">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 sm:mb-8 text-center">
                    {user ? "Complete Your Rider Application" : "Register as a New Rider"}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* --- Personal Information --- */}
                    <h3 className="text-base sm:text-lg font-semibold text-slate-700 border-b pb-2 mb-4">Personal Information</h3>

                    {/* Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">First Name</label>
                            <div className="relative">
                                <User className={iconBaseClass} size={16} />
                                <input {...register("first_name", { required: "First name is required" })}
                                    placeholder="Enter first name" disabled={!!user}
                                    className={`${inputBaseClass} ${disabledInputClass}`} />
                            </div>
                            {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Last Name</label>
                            <div className="relative">
                                <User className={iconBaseClass} size={16} />
                                <input {...register("last_name", { required: "Last name is required" })}
                                    placeholder="Enter last name" disabled={!!user}
                                    className={`${inputBaseClass} ${disabledInputClass}`} />
                            </div>
                            {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className={iconBaseClass} size={16} />
                            <input {...register("email", { required: "Email is required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" }})}
                                placeholder="Enter email address" type="email" disabled={!!user}
                                className={`${inputBaseClass} ${disabledInputClass}`} />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    {/* Password Fields */}
                    {!user && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className={iconBaseClass} size={16} />
                                    <input type={showPassword ? "text" : "password"}
                                        {...register("password", { required: "Password is required", minLength: { value: 6, message: "6+ characters" } })}
                                        placeholder="Create a password"
                                        className={`${inputBaseClass} pr-10`} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={showPassword ? "Hide" : "Show"}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className={iconBaseClass} size={16} />
                                    <input type={showConfirmPassword ? "text" : "password"}
                                        {...register("confirm_password", {
                                             required: "Confirm password",
                                             validate: value => value === watch("password") || "Passwords don't match"
                                        })}
                                        placeholder="Confirm password"
                                        className={`${inputBaseClass} pr-10`} />
                                     <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={showConfirmPassword ? "Hide" : "Show"}>
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
                            </div>
                        </div>
                    )}

                    {/* Phone */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Mobile Number</label>
                        <div className="relative">
                            <Phone className={iconBaseClass} size={16} />
                            <input {...register("phone", { required: "Phone is required", pattern: { value: /^(01[3-9]\d{8})$/, message: "Invalid BD mobile" } })}
                                placeholder="01XXXXXXXXX" type="tel"
                                className={inputBaseClass} />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>

                    {/* City */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">City</label>
                        <div className="relative">
                            <MapPin className={iconBaseClass} size={16} />
                            <select {...register("city", { required: "City is required" })} className={selectBaseClass}>
                                <option value="">Select City</option>
                                <option value="Dhaka">Dhaka</option>
                                <option value="Chattogram">Chattogram</option>
                                <option value="Rajshahi">Rajshahi</option>
                                <option value="Khulna">Khulna</option>
                                <option value="Barishal">Barishal</option>
                                <option value="Sylhet">Sylhet</option>
                                <option value="Rangpur">Rangpur</option>
                                <option value="Mymensingh">Mymensingh</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Date of Birth</label>
                        <div className="relative">
                            <Calendar className={iconBaseClass} size={16} />
                            <input type="date" {...register("dob", { required: "Date of birth is required" })} className={inputBaseClass}/>
                        </div>
                        {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob.message}</p>}
                    </div>

                    {/* NID */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">NID Number</label>
                        <div className="relative">
                            <CreditCard className={iconBaseClass} size={16} />
                            <input {...register("nid_number", { required: "NID is required" })}
                                placeholder="Enter your NID number" type="text" className={inputBaseClass} />
                        </div>
                        {errors.nid_number && <p className="text-red-500 text-xs mt-1">{errors.nid_number.message}</p>}
                    </div>

                    {/* --- Vehicle Information --- */}
                    <h3 className="text-base sm:text-lg font-semibold text-slate-700 border-b pt-4 pb-2 mb-4">Vehicle Information</h3>

                    {/* Vehicle Type */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Vehicle Type</label>
                        <div className="relative">
                            <Bike className={iconBaseClass} size={16} />
                            <select {...register("vehicle_type", { required: "Select vehicle type" })} className={selectBaseClass}>
                                <option value="">Select Vehicle Type</option>
                                <option value="Bike">Bike</option>
                                <option value="Car">Car</option>
                                <option value="Cycle">Cycle</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                        {errors.vehicle_type && <p className="text-red-500 text-xs mt-1">{errors.vehicle_type.message}</p>}
                    </div>

                    {/* Brand & Model */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Vehicle Brand</label>
                            <div className="relative">
                                <Building className={iconBaseClass} size={16} />
                                <input {...register("vehicle_brand", { required: "Vehicle brand is required" })}
                                    placeholder="e.g., Honda, Toyota" className={inputBaseClass} />
                            </div>
                            {errors.vehicle_brand && <p className="text-red-500 text-xs mt-1">{errors.vehicle_brand.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Vehicle Model</label>
                            <div className="relative">
                                <Tag className={iconBaseClass} size={16} />
                                <input {...register("vehicle_model", { required: "Vehicle model is required" })}
                                    placeholder="e.g., Livo 110, Axio" className={inputBaseClass} />
                            </div>
                            {errors.vehicle_model && <p className="text-red-500 text-xs mt-1">{errors.vehicle_model.message}</p>}
                        </div>
                    </div>

                    {/* Registration Number */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Registration / License Plate</label>
                        <div className="relative">
                            <Hash className={iconBaseClass} size={16} />
                            <input {...register("registration_number", { required: "Registration is required" })}
                                placeholder="Enter registration number" className={inputBaseClass} />
                        </div>
                        {errors.registration_number && <p className="text-red-500 text-xs mt-1">{errors.registration_number.message}</p>}
                    </div>

                    {/* Tax Token */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Tax Token Number</label>
                        <div className="relative">
                            <Hash className={iconBaseClass} size={16} />
                            <input {...register("tax_token_number", { required: "Tax token is required" })}
                                placeholder="Enter tax token number" className={inputBaseClass} />
                        </div>
                        {errors.tax_token_number && <p className="text-red-500 text-xs mt-1">{errors.tax_token_number.message}</p>}
                    </div>

                    {/* Fitness Number */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Fitness Number</label>
                        <div className="relative">
                            <Hash className={iconBaseClass} size={16} />
                            <input {...register("fitness_number", { required: "Fitness number is required" })}
                                placeholder="Enter fitness number" className={inputBaseClass} />
                        </div>
                        {errors.fitness_number && <p className="text-red-500 text-xs mt-1">{errors.fitness_number.message}</p>}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button type="submit" disabled={isSubmitting || authLoading} // FIX: Use isSubmitting state
                            className="w-full py-3 bg-[#EF451C] text-white text-base sm:text-lg font-semibold rounded-lg shadow-md hover:bg-[#d93e18] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EF451C] disabled:bg-slate-400 disabled:cursor-not-allowed">
                            {(isSubmitting || authLoading) ? ( // FIX: Check both states
                                <div className="flex items-center justify-center">
                                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                    Submitting...
                                </div>
                            ) : ( "Submit Application" )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FoodManForm;