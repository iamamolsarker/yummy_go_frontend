/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, type JSX } from "react";
import { Star } from "lucide-react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";

type ReviewType = {
  _id: string;
  customer_name: string;
  rating: number; // 1–5
  comment: string;
  created_at: string;
};

export default function ReviewsPage(): JSX.Element {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "positive" | "neutral" | "negative">("all");

  useEffect(() => {
    let mounted = true;

    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        if (!user) throw new Error("User not logged in");
        const email = user.email;

        // Fetch restaurant by email
        const resRestaurant = await axiosSecure.get(`/restaurants/email/${email}`);
        const restaurant = resRestaurant.data?.data || resRestaurant.data;
        if (!restaurant?._id) throw new Error("Restaurant not found");

        // Fetch reviews for restaurant
        const resReviews = await axiosSecure.get(`/reviews/restaurant/${restaurant._id}`);
        if (!mounted) return;
        const data = Array.isArray(resReviews.data) ? resReviews.data : resReviews.data?.data || [];
        setReviews(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load reviews.");
      } finally {
        setTimeout(() => setIsLoading(false), 400);
      }
    };

    fetchReviews();
    return () => {
      mounted = false;
    };
  }, [axiosSecure, user]);

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (filter === "positive") return r.rating > 3;
    if (filter === "neutral") return r.rating === 3;
    if (filter === "negative") return r.rating < 3;
    return true;
  });

  const totalReviews = reviews.length;
  const avgRating = totalReviews ? reviews.reduce((a, r) => a + r.rating, 0) / totalReviews : 0;
  const positiveReviews = reviews.filter((r) => r.rating > 3).length;
  const negativeReviews = reviews.filter((r) => r.rating < 3).length;

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Customer Reviews</h1>

        {/* Skeleton Loader */}
        {isLoading && (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white shadow rounded-lg p-4">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-3"></div>
                  <div className="h-6 w-16 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>

            <div className="bg-white shadow rounded-lg p-6 space-y-4 mt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-3 w-32 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-48 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12 text-red-500">{error}</div>
        )}

        {/* Main Content */}
        {!isLoading && !error && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Total Reviews</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-800">{totalReviews}</p>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-800 flex items-center gap-1">
                  {avgRating.toFixed(1)} <Star size={16} className="text-yellow-400" />
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Positive Reviews</h3>
                <p className="mt-1 text-2xl font-semibold text-green-600">{positiveReviews}</p>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Negative Reviews</h3>
                <p className="mt-1 text-2xl font-semibold text-red-600">{negativeReviews}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4">
              {["all", "positive", "neutral", "negative"].map((f) => (
                <button
                  key={f}
                  className={`px-4 py-2 rounded transition-all ${
                    filter === f
                      ? "bg-[#EF451C] text-white shadow"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setFilter(f as any)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Reviews Table */}
            {filteredReviews.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-12 text-center text-gray-500">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg font-medium">No reviews yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Once customers start reviewing your restaurant, you’ll see them here.
                </p>
              </div>
            ) : (
              <div className="shadow-lg rounded-lg border border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Comment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReviews.map((r, idx) => (
                      <tr
                        key={r._id}
                        className={`${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100 transition`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {r.customer_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < r.rating ? "text-yellow-400" : "text-gray-300"}
                            />
                          ))}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">{r.comment}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
