# 🍔 YummyGo API Routes Guide

## 🔓 Public Routes (`axiosPublic`)

👉 এখানে token লাগে না, মানে সবাই অ্যাক্সেস করতে পারে।  
তাই `useAxios()` ব্যবহার করবে।

| কাজ | Route | Method | ব্যাখ্যা |
|------|--------|---------|-----------|
| Register user | `/users` | `POST` | নতুন ইউজার অ্যাকাউন্ট তৈরি |
| Login user | `/auth/login` | `POST` | লগইন করতে token পাওয়া |
| Get all restaurants | `/restaurants` | `GET` | পাবলিক লিস্ট |
| Get restaurant menu | `/restaurants/:id/foods` | `GET` | নির্দিষ্ট রেস্টুরেন্টের খাবার দেখানো |
| Get single food | `/foods/:id` | `GET` | নির্দিষ্ট খাবারের ডিটেইল দেখা |
| Get all foods (public) | `/foods` | `GET` | সবার জন্য খাবার তালিকা |
| Search food | `/foods/search?name=burger` | `GET` | সার্চ রেজাল্ট |
| Homepage banner / offers | `/banners`, `/offers` | `GET` | পাবলিক ডিসপ্লে ডেটা |

**👉 ব্যবহারের হুক:**

```js
const axiosPublic = useAxios();
```

---

## 🔐 Protected Routes (`axiosSecure`)

👉 এগুলাতে ইউজার লগইন থাকতে হবে (JWT/Firebase token দরকার)।  
তাই `useAxiosSecure()` ব্যবহার করবে।

| কাজ | Route | Method | কার জন্য |
|------|--------|---------|-----------|
| Get user role | `/users/:email/role` | `GET` | সকল logged-in ইউজার |
| Get user profile | `/users/:email` | `GET` | নিজের প্রোফাইল |
| Update profile | `/users/:email` | `PATCH` | নিজের প্রোফাইল |
| Place an order | `/orders` | `POST` | User |
| Get my orders | `/orders/:email` | `GET` | User |
| Cancel order | `/orders/:id` | `DELETE` | User |
| Add food | `/foods` | `POST` | Restaurant owner |
| Update food | `/foods/:id` | `PATCH` | Restaurant owner |
| Delete food | `/foods/:id` | `DELETE` | Restaurant owner |
| Get my foods | `/foods/my-foods/:email` | `GET` | Restaurant owner |
| Get all users | `/users` | `GET` | Admin |
| Change user role | `/users/:id/role` | `PATCH` | Admin |
| Manage all orders | `/orders` | `GET` | Admin |
| Update order status | `/orders/:id/status` | `PATCH` | Rider / Admin |
| Rider delivery history | `/deliveries/:email` | `GET` | Rider |
| Add review | `/reviews` | `POST` | User |
| Get my reviews | `/reviews/:email` | `GET` | User |

**👉 ব্যবহারের হুক:**

```js
const axiosSecure = useAxiosSecure();
```

---

## ⚙️ সংক্ষেপে মনে রাখো

| ধরণ | উদাহরণ | হুক |
|------|---------|------|
| Everyone can access (login ছাড়া) | `/foods`, `/restaurants`, `/register` | `useAxios()` |
| Logged-in user-specific | `/orders`, `/users/:email`, `/foods/my-foods` | `useAxiosSecure()` |
| Admin / Rider / Owner কাজ | `/users`, `/orders/:id/status` | `useAxiosSecure()` |
