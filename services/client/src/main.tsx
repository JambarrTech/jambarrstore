import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { StoreProvider } from '@jambarrtech/shared';
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
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MobileLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/produit/:id" element={<ProductDetail />} />
            <Route path="/panier" element={<Cart />} />
            <Route path="/commandes" element={<Orders />} />
            <Route path="/commandes/:id" element={<OrderDetail />} />
            <Route path="/compte" element={<Account />} />
            <Route path="/favoris" element={<Favorites />} />
            <Route path="/recherche" element={<SearchPage />} />
            <Route path="/vendeur/:id" element={<SellerProfile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/aide" element={<Help />} />
            <Route path="/adresses" element={<Addresses />} />
          </Route>
          <Route path="*" element={<div className="flex min-h-screen items-center justify-center bg-sand"><p className="text-sm text-ink-muted">Page non trouvée</p></div>} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  </React.StrictMode>
);
