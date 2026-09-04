import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { StoreProvider, AuthProvider, useAuth } from '@jambarrtech/shared';
import { AdminLayout } from './components/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { AdminProducts } from './pages/AdminProducts';
import { AdminOrders } from './pages/AdminOrders';
import { AdminCustomers } from './pages/AdminCustomers';
import { AdminLogin } from './pages/AdminLogin';
import './index.css';

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AdminLogin />} />
            <Route element={<ProtectedAdmin><AdminLayout /></ProtectedAdmin>}>
              <Route index element={<Dashboard />} />
              <Route path="produits" element={<AdminProducts />} />
              <Route path="commandes" element={<AdminOrders />} />
              <Route path="clients" element={<AdminCustomers />} />
            </Route>
            <Route path="*" element={<div>Page non trouvée</div>} />
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
  </React.StrictMode>
);
