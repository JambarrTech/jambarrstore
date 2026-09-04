import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { StoreProvider } from '@jambarrtech/shared';
import { AdminLayout } from './components/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { AdminProducts } from './pages/AdminProducts';
import { AdminOrders } from './pages/AdminOrders';
import { AdminCustomers } from './pages/AdminCustomers';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="produits" element={<AdminProducts />} />
            <Route path="commandes" element={<AdminOrders />} />
            <Route path="clients" element={<AdminCustomers />} />
          </Route>
          <Route path="*" element={<div>Page non trouvée</div>} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  </React.StrictMode>
);
