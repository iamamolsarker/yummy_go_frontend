<div align="center">
  <h1>🍔 YummyGo - Food Delivery Platform</h1>
  <p><strong>A modern, full-featured food delivery web application built with React & TypeScript</strong></p>
  
  ![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  
  [Live Demo](https://yummy-go.vercel.app) • [API Documentation](./src/YummyGo_API_Routes_Guide.md) • [Report Bug](https://github.com/iamamolsarker/yummy_go_frontend/issues)
</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Authentication](#-authentication)
- [Role-Based Access](#-role-based-access)
- [Payment Integration](#-payment-integration)
- [API Integration](#-api-integration)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**YummyGo** is a comprehensive food delivery platform that connects customers with restaurants, manages orders efficiently, and provides real-time delivery tracking. Built with modern web technologies, it offers a seamless experience across four distinct user roles: **Customer**, **Restaurant Owner**, **Rider**, and **Admin**.

### 🎯 Key Highlights

- 🚀 **Lightning Fast** - Built with Vite for optimal performance
- 🎨 **Modern UI/UX** - Responsive design with Tailwind CSS 4
- 🔐 **Secure Authentication** - Firebase Auth with Google OAuth
- 💳 **Payment Processing** - Integrated Stripe payment gateway
- 📱 **Mobile Responsive** - Optimized for all screen sizes
- 🗺️ **Real-time Tracking** - Leaflet maps for delivery tracking
- 📊 **Analytics Dashboard** - Comprehensive business insights
- 🌐 **Multi-role System** - Separate dashboards for different user types

---

## ✨ Features

### 👤 Customer Features
- Browse restaurants by cuisine type, rating, and distance
- Advanced food search and filtering
- Real-time cart management
- Multiple payment options (Card, Cash on Delivery, Mobile Banking)
- Order tracking with live map updates
- Order history and reviews
- Personalized recommendations

### 🏪 Restaurant Owner Features
- Menu management (Add, Edit, Delete items)
- Real-time order notifications
- Revenue analytics and reports
- Customer review management
- Performance metrics and insights
- Inventory tracking
- Special offers and promotions

### 🚴 Rider Features
- Active delivery orders dashboard
- Route optimization with maps
- Earnings tracker
- Delivery history
- Performance statistics
- Real-time navigation

### 👨‍💼 Admin Features
- User management (All roles)
- Restaurant approval and management
- Rider assignments
- System-wide analytics
- Revenue reports
- Order monitoring
- Platform settings

---

## 🛠️ Tech Stack

### Frontend Core
- **React 19.1** - UI library with latest features
- **TypeScript 5.8** - Type-safe development
- **Vite 7.1** - Next-generation build tool
- **React Router v7** - Client-side routing with nested layouts

### State Management & Data Fetching
- **TanStack Query v5** - Server state management
- **React Context API** - Global state (Auth, Cart)
- **React Hook Form** - Form management with validation
- **Zod** - Schema validation

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **Framer Motion** - Animation library
- **React Awesome Reveal** - Scroll animations

### Authentication & Security
- **Firebase Authentication** - Email/password & Google OAuth
- **JWT Tokens** - Secure API communication
- **Protected Routes** - Role-based access control

### Payment & Maps
- **Stripe** - Payment processing
- **React Leaflet** - Interactive maps
- **Leaflet Routing Machine** - Route optimization

### Additional Libraries
- **Axios** - HTTP client with interceptors
- **React Toastify** - Toast notifications
- **SweetAlert2** - Beautiful modals
- **Recharts** - Data visualization
- **date-fns** - Date utilities
- **jsPDF** - PDF generation
- **React CSV** - CSV export functionality

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- **Git**

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/iamamolsarker/yummy_go_frontend.git
cd yummy_go_frontend
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_API_BASE_URL=https://yummy-go-server.vercel.app/api

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# Image Upload
VITE_IMGBB_UPLOAD_API=your_imgbb_api_key
```

4. **Start development server**

```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**

Navigate to `http://localhost:5173`

### 🏗️ Build for Production

```bash
npm run build
# or
yarn build
```

### 👀 Preview Production Build

```bash
npm run preview
# or
yarn preview
```

---

## 📁 Project Structure

```
yummy_go_frontend/
├── public/                      # Static assets
├── src/
│   ├── assets/                  # Images, icons, media
│   │   ├── auth/               # Authentication related images
│   │   ├── error/              # Error page assets
│   │   └── home/               # Homepage images
│   │
│   ├── Authentication/          # Auth components
│   │   ├── Login.tsx
│   │   ├── UserReg.tsx
│   │   └── SocialLogin.tsx
│   │
│   ├── components/              # Reusable components
│   │   ├── home/               # Homepage components
│   │   ├── restaurants/        # Restaurant components
│   │   ├── Cart/               # Cart modal
│   │   ├── Gallery/            # Image gallery
│   │   ├── Newsletter/         # Newsletter subscription
│   │   └── shared/             # Shared components (Navbar, Footer)
│   │
│   ├── Dashboard/               # Role-specific dashboards
│   │   ├── Admin/              # Admin dashboard
│   │   │   ├── Analytics/
│   │   │   ├── Orders/
│   │   │   ├── Riders/
│   │   │   └── userManagement/
│   │   ├── Restaurant_Owner/   # Restaurant owner dashboard
│   │   │   ├── MenuManagement/
│   │   │   ├── OrdersManagements/
│   │   │   ├── Analytics/
│   │   │   └── Revenue/
│   │   └── Rider/              # Rider dashboard
│   │       ├── RiderOrders.tsx
│   │       ├── RiderEarnings.tsx
│   │       └── RiderPerformance.tsx
│   │
│   ├── pages/                   # Page components
│   │   ├── homePage/
│   │   ├── Restaurants/
│   │   ├── checkout/
│   │   ├── order-confirmation/
│   │   ├── profilePage/
│   │   └── error page/
│   │
│   ├── layouts/                 # Layout components
│   │   ├── RootLayout.tsx      # Public pages layout
│   │   ├── AuthLayout.tsx      # Auth pages layout
│   │   └── DashboardLayout.tsx # Dashboard layout (role-based)
│   │
│   ├── routes/                  # Route guards
│   │   ├── PrivateRoute.tsx
│   │   ├── AdminRoute.tsx
│   │   ├── RiderRoute.tsx
│   │   └── RestaurantOwnerRoute.tsx
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.tsx         # Authentication hook
│   │   ├── useAxios.tsx        # Public API hook
│   │   ├── useAxiosSecure.tsx  # Protected API hook
│   │   ├── useCart.ts          # Cart management
│   │   ├── useUserRole.tsx     # Role detection
│   │   └── useRestaurants.tsx  # Restaurant data
│   │
│   ├── contextsProvider/        # Context providers
│   │   ├── AuthProvider.tsx
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── restaurant.ts
│   │   └── router.ts
│   │
│   ├── firebase/                # Firebase configuration
│   │   └── firebase.config.js
│   │
│   ├── router/                  # Route configuration
│   │   └── router.tsx
│   │
│   ├── main.tsx                 # App entry point
│   ├── index.css                # Global styles
│   └── YummyGo_API_Routes_Guide.md  # API documentation
│
├── .env.local                   # Environment variables (create this)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── eslint.config.js
└── README.md
```

---

## 🔐 Authentication

YummyGo uses **Firebase Authentication** with JWT tokens for secure API communication.

### Authentication Flow

1. **User Registration/Login** → Firebase creates user
2. **Token Generation** → Firebase issues JWT token
3. **Token Storage** → Token stored in context
4. **API Requests** → Token attached via Axios interceptors
5. **Role Verification** → Backend validates role via `/users/:email/role`

### Supported Auth Methods

- ✅ Email & Password
- ✅ Google OAuth
- 🔜 Facebook OAuth (Coming soon)
- 🔜 Phone Number OTP (Coming soon)

### Code Example

```typescript
// Using authentication
import useAuth from './hooks/useAuth';

function MyComponent() {
  const { user, loading, signIn, signUp, logout } = useAuth();
  
  if (loading) return <Loading />;
  
  return user ? <Dashboard /> : <Login />;
}
```

---

## 👥 Role-Based Access

YummyGo implements a sophisticated role-based access control (RBAC) system with four distinct roles.

### User Roles

| Role | Access Level | Key Features |
|------|-------------|--------------|
| **Customer** | Basic | Browse, order, track deliveries |
| **Restaurant Owner** | Business | Manage menu, view analytics |
| **Rider** | Operational | Accept deliveries, navigate routes |
| **Admin** | Full | Manage all users, system settings |

### Role Detection

```typescript
// Using role detection
import { useUserRole } from './hooks/useUserRole';

function DashboardNav() {
  const { isAdmin, isRider, isRestaurantOwner, roleLoading } = useUserRole();
  
  if (roleLoading) return <Skeleton />;
  
  return (
    <>
      {isAdmin && <AdminLinks />}
      {isRider && <RiderLinks />}
      {isRestaurantOwner && <RestaurantLinks />}
    </>
  );
}
```

### Protected Routes

```typescript
// Route protection example
<Route element={<PrivateRoute />}>
  <Route element={<DashboardLayout />}>
    <Route element={<AdminRoute />}>
      <Route path="admin/*" element={<AdminDashboard />} />
    </Route>
  </Route>
</Route>
```

---

## 💳 Payment Integration

YummyGo supports multiple payment methods powered by **Stripe** and local payment gateways.

### Supported Payment Methods

- 💳 **Credit/Debit Cards** (Visa, Mastercard, Amex) - via Stripe
- 💵 **Cash on Delivery** - Pay when you receive
- 📱 **bKash** - Mobile banking (Bangladesh)
- 📱 **Nagad** - Mobile banking (Bangladesh)

### Payment Flow

1. Customer adds items to cart
2. Proceeds to checkout
3. Selects payment method
4. For card payments:
   - Stripe processes payment
   - Backend creates payment intent
   - Frontend confirms payment
   - Order is placed with payment ID
5. For cash/mobile:
   - Order placed with pending status
   - Payment collected on delivery/verification

### Testing Payment

Use these test cards in development:

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 9995` | Declined - Insufficient funds |
| `4000 0000 0000 0002` | Declined - Generic error |

**Other details:** Expiry: any future date, CVC: any 3 digits, ZIP: any 5 digits

📚 **Full Payment Setup Guide:** [STRIPE_PAYMENT_SETUP.md](./STRIPE_PAYMENT_SETUP.md)

---

## 🔌 API Integration

YummyGo uses a **dual Axios pattern** for public and protected routes.

### Public Routes (No Authentication)

```typescript
import useAxios from './hooks/useAxios';

const axiosPublic = useAxios();

// Fetch all restaurants
const restaurants = await axiosPublic.get('/restaurants');
```

### Protected Routes (Authentication Required)

```typescript
import useAxiosSecure from './hooks/useAxiosSecure';

const axiosSecure = useAxiosSecure();

// Place an order
const order = await axiosSecure.post('/orders', orderData);
```

### Key Endpoints

| Category | Endpoint | Method | Auth Required |
|----------|----------|--------|---------------|
| **Restaurants** | `/restaurants` | GET | ❌ |
| **Menu Items** | `/restaurants/:id/foods` | GET | ❌ |
| **Place Order** | `/orders` | POST | ✅ |
| **User Profile** | `/users/:email` | GET | ✅ |
| **User Role** | `/users/:email/role` | GET | ✅ |
| **Payment Intent** | `/create-payment-intent` | POST | ✅ |

📚 **Complete API Documentation:** [YummyGo_API_Routes_Guide.md](./src/YummyGo_API_Routes_Guide.md)

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**

```bash
npm install -g vercel
```

2. **Login to Vercel**

```bash
vercel login
```

3. **Deploy**

```bash
vercel --prod
```

4. **Set Environment Variables**

Go to Vercel Dashboard → Project Settings → Environment Variables and add all variables from `.env.local`

### Deploy to Netlify

1. **Install Netlify CLI**

```bash
npm install -g netlify-cli
```

2. **Build the project**

```bash
npm run build
```

3. **Deploy**

```bash
netlify deploy --prod
```

### Build Configuration

**Vercel:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Netlify:**
- Build Command: `npm run build`
- Publish Directory: `dist`
- Base Directory: (leave empty)

### Environment Variables Checklist

Ensure all these are set in your deployment platform:

- ✅ `VITE_FIREBASE_API_KEY`
- ✅ `VITE_FIREBASE_AUTH_DOMAIN`
- ✅ `VITE_FIREBASE_PROJECT_ID`
- ✅ `VITE_FIREBASE_STORAGE_BUCKET`
- ✅ `VITE_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `VITE_FIREBASE_APP_ID`
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY`
- ✅ `VITE_IMGBB_UPLOAD_API`
- ✅ `VITE_API_BASE_URL`

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/iamamolsarker/yummy_go_frontend/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser and OS information

### Suggesting Features

1. Open an issue with the `enhancement` label
2. Clearly describe the feature and its benefits
3. Provide examples or mockups if possible

### Pull Request Process

1. **Fork the repository**

```bash
git clone https://github.com/your-username/yummy_go_frontend.git
```

2. **Create a feature branch**

```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**

- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

4. **Test your changes**

```bash
npm run lint
npm run build
```

5. **Commit with meaningful messages**

```bash
git commit -m "feat: add amazing feature"
```

6. **Push and create Pull Request**

```bash
git push origin feature/amazing-feature
```

### Code Style Guidelines

- Use TypeScript for all new components
- Follow existing folder structure
- Use functional components with hooks
- Keep components small and focused
- Write self-documenting code with clear variable names
- Add JSDoc comments for complex functions

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [React](https://react.dev/) - The UI library
- [Vite](https://vite.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Firebase](https://firebase.google.com/) - Authentication
- [Stripe](https://stripe.com/) - Payment processing
- [Vercel](https://vercel.com/) - Hosting platform
- [Lucide](https://lucide.dev/) - Icon library

---

## 📞 Support & Contact

- **Developer:** Amol Sarker
- **GitHub:** [@iamamolsarker](https://github.com/iamamolsarker)
- **Email:** [support@yummygo.com](mailto:support@yummygo.com)
- **Issues:** [GitHub Issues](https://github.com/iamamolsarker/yummy_go_frontend/issues)

---

## 📊 Project Status

- ✅ Core Features - Complete
- ✅ Authentication System - Complete
- ✅ Payment Integration - Complete
- ✅ Role-Based Dashboards - Complete
- ✅ Responsive Design - Complete
- 🚧 Real-time Chat Support - In Progress
- 🚧 Push Notifications - In Progress
- 📋 Mobile App (React Native) - Planned

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/iamamolsarker">Amol Sarker</a></p>
  <p>⭐ Star this repo if you found it helpful!</p>
  
  [![GitHub Stars](https://img.shields.io/github/stars/iamamolsarker/yummy_go_frontend?style=social)](https://github.com/iamamolsarker/yummy_go_frontend/stargazers)
  [![GitHub Forks](https://img.shields.io/github/forks/iamamolsarker/yummy_go_frontend?style=social)](https://github.com/iamamolsarker/yummy_go_frontend/network/members)
</div>
