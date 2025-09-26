import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { router } from './router/router.tsx'
import { RouterProvider } from 'react-router'
import AuthProvider from './contextsProvider/AuthProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <AuthProvider>
    <RouterProvider router={router} />
   </AuthProvider>
  </StrictMode>,
)
