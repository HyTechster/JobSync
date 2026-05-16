import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// In dev, purge all SW caches AND unregister every SW so stale production
// bundles can never be served in place of fresh Vite dev-server code.
// Clearing caches works even when an SW can't be immediately unregistered
// (it stays "active" while tabs are open but has nothing left to serve).
if (import.meta.env.DEV) {
  if ('caches' in window) {
    void caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
  }
  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker
      .getRegistrations()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
