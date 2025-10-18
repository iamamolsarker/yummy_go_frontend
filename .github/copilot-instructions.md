# YummyGo Frontend - AI Coding Assistant Guide

## Architecture Overview
This is a **React + TypeScript + Vite** food delivery platform frontend with **role-based access control** (4 roles: user, admin, rider, restaurant_owner). The app uses **Firebase Authentication** with **JWT tokens** for secure API communication.

### Core Tech Stack
- **React 19** with TypeScript, Vite dev server
- **TanStack Query** for server state management 
- **React Router v7** with nested layouts
- **Firebase Auth** (email/password + Google OAuth)
- **Tailwind CSS v4** with custom design system
- **Axios** with JWT interceptors for API calls

## Critical Patterns

### 1. **Dual Axios Pattern** (See `src/YummyGo_API_Routes_Guide.md`)
```tsx
// Public routes (no auth required)
const axiosPublic = useAxios(); // for /foods, /restaurants, /register

// Protected routes (requires Firebase JWT)
const axiosSecure = useAxiosSecure(); // for /orders, /users/:email, admin routes
```

### 2. **Role-Based Navigation & Access**
```tsx
// Dashboard layout dynamically generates nav based on role
const { isAdmin, isRider, isRestaurantOwner } = useUserRole();
// Navigation items change per role in DashboardLayout.tsx
```

### 3. **Authentication Flow**
- `AuthProvider` wraps app with Firebase auth state
- `PrivateRoute` guards dashboard access
- `AdminRoute`/`RiderRoute` for role-specific protection
- JWT tokens auto-attached via `axiosSecure` interceptors

### 4. **Layout Structure**
```
/                 → RootLayout (public pages)
/auth/*           → AuthLayout (login/register)  
/dashboard/*      → DashboardLayout (role-based sidebar)
```

## Development Workflows

### **Local Development**
```bash
npm run dev              # Start Vite dev server
npm run build            # TypeScript compile + build
npm run lint             # ESLint check
```

### **Environment Setup**
Requires `.env.local` with Firebase config:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

## Key Conventions

### **API Integration**
- Base URL: `https://yummy-go-server.vercel.app/api`
- Always use `useAxiosSecure()` for authenticated endpoints
- Role verification via `/users/:email/role` endpoint
- Error handling: 401→login redirect, 403→forbidden page

### **Component Organization**
```
src/
├── components/        # Reusable UI components
├── pages/            # Route components
├── Dashboard/        # Role-specific dashboard components
├── layouts/          # Layout wrappers (Root, Auth, Dashboard)
├── hooks/            # Custom hooks (useAuth, useUserRole, useAxios*)
├── routes/           # Route guards (PrivateRoute, AdminRoute)
└── contextsProvider/ # Context providers
```

### **Styling System**
- Custom Tailwind theme in `tailwind.config.js`
- Brand colors: `primary: #EF451C`, `dark-title: #363636`
- DaisyUI components for loading states: `loading loading-spinner`

### **State Management**
- **TanStack Query** for server state (5min stale time)
- **Firebase auth state** via context
- **Local component state** with useState/useReducer

## Critical Files
- `src/hooks/useUserRole.tsx` - Role detection logic
- `src/layouts/DashboardLayout.tsx` - Dynamic role-based sidebar
- `src/YummyGo_API_Routes_Guide.md` - API endpoint reference
- `src/router/router.tsx` - Route definitions with guards
- `src/hooks/useAxiosSecure.tsx` - JWT interceptor setup

## Common Gotchas
- Always check `roleLoading` before rendering role-dependent UI
- Use absolute imports for consistent file paths
- Dashboard routes need `PrivateRoute` wrapper + role checks
- Firebase auth state takes time to initialize - handle loading states
- API responses expect specific structure: `res.data.data.role`

## Testing Approach
- Role switching: Change user role via admin panel or database
- Auth flows: Test login/logout, token expiration, route guards
- Mobile responsiveness: Sidebar collapses, mobile nav overlay