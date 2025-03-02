import { Toaster } from '@/components/ui/sonner'
import { Analytics } from '@vercel/analytics/react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.tsx'
import './index.css'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <App />
        <Toaster />
        <Analytics />
      </BrowserRouter>
    </ConvexProvider>
  </StrictMode>
)
