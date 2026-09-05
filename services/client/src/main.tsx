import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { StoreProvider, AuthProvider, useAuth, ToastProvider } from '@jambarrtech/shared';
import { MobileLayout } from './components/MobileLayout';
import { Home } from './pages/Home';
import { Categories } from './pages/Categories';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { Account } from './pages/Account';
import { Favorites } from './pages/Favorites';
import { SearchPage } from './pages/SearchPage';
import { SellerProfile } from './pages/SellerProfile';
import { Notifications } from './pages/Notifications';
import { Help } from './pages/Help';
import { Addresses } from './pages/Addresses';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Splash, Confirmation } from './pages/Splash';
import ToastDisplay from './components/ToastDisplay';
import './index.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/connexion" replace />;
  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <StoreProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Splash />} />
              <Route path="/connexion" element={<Login />} />
              <Route path="/inscription" element={<Register />} />
              <Route path="/confirmation" element={<Confirmation />} />
              <Route element={<ProtectedRoute><MobileLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Home />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/produit/:id" element={<ProductDetail />} />
                <Route path="/recherche" element={<SearchPage />} />
                <Route path="/vendeur/:id" element={<SellerProfile />} />
                <Route path="/aide" element={<Help />} />
                <Route path="/panier" element={<Cart />} />
                <Route path="/commandes" element={<Orders />} />
                <Route path="/commandes/:id" element={<OrderDetail />} />
                <Route path="/compte" element={<Account />} />
                <Route path="/favoris" element={<Favorites />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/adresses" element={<Addresses />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ToastDisplay />
          </BrowserRouter>
        </ToastProvider>
      </StoreProvider>
    </AuthProvider>
  </React.StrictMode>
);
