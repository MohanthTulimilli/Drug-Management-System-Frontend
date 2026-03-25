import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import MedicinesPage from './pages/MedicinesPage';
import InventoryPage from './pages/InventoryPage';
import RetailersPage from './pages/RetailersPage';
import OrdersPage from './pages/OrdersPage';
import DeliveriesPage from './pages/DeliveriesPage';
import ReportsPage from './pages/ReportsPage';
import BulkUploadPage from './pages/BulkUploadPage';
import CatalogPage from './pages/CatalogPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import MyOrdersPage from './pages/MyOrdersPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import MyDeliveriesPage from './pages/MyDeliveriesPage';
import DeliveryHistoryPage from './pages/DeliveryHistoryPage';
import CreateRetailerPage from './pages/CreateRetailerPage';
import CreateDeliveryPage from './pages/CreateDeliveryPage';
import ManageRetailersPage from './pages/ManageRetailersPage';
import ManageDeliveryPage from './pages/ManageDeliveryPage';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'RETAILER' | 'DELIVERY';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: Role[] }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role as Role)) {
    return <Navigate to="/unauthorized" />;
  }
  return <>{children}</>;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white text-lg font-medium">Unauthorized</div>} />
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              {/* Super Admin */}
              <Route path="/super-admin/dashboard" element={
                <ProtectedRoute roles={['SUPER_ADMIN']}>
                  <Dashboard />
                </ProtectedRoute>
              } />

              {/* Admin */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
                  <UsersPage />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              } />
              <Route path="/audit-logs" element={
                <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
                  <AuditLogsPage />
                </ProtectedRoute>
              } />
              <Route path="/medicines" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <MedicinesPage />
                </ProtectedRoute>
              } />
              <Route path="/inventory" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <InventoryPage />
                </ProtectedRoute>
              } />
              <Route path="/bulk-upload" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <BulkUploadPage />
                </ProtectedRoute>
              } />
              <Route path="/create-retailer" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <CreateRetailerPage />
                </ProtectedRoute>
              } />
              <Route path="/create-delivery" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <CreateDeliveryPage />
                </ProtectedRoute>
              } />
              <Route path="/manage-retailers" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <ManageRetailersPage />
                </ProtectedRoute>
              } />
              <Route path="/manage-delivery" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <ManageDeliveryPage />
                </ProtectedRoute>
              } />
              <Route path="/retailers" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <RetailersPage />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <OrdersPage />
                </ProtectedRoute>
              } />
              <Route path="/deliveries" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <DeliveriesPage />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <ReportsPage />
                </ProtectedRoute>
              } />

              {/* Retailer */}
              <Route path="/retailer/dashboard" element={
                <ProtectedRoute roles={['RETAILER']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/catalog" element={
                <ProtectedRoute roles={['RETAILER']}>
                  <CatalogPage />
                </ProtectedRoute>
              } />
              <Route path="/cart" element={
                <ProtectedRoute roles={['RETAILER']}>
                  <CartPage />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute roles={['RETAILER']}>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              <Route path="/my-orders" element={
                <ProtectedRoute roles={['RETAILER']}>
                  <MyOrdersPage />
                </ProtectedRoute>
              } />
              <Route path="/payment-history" element={
                <ProtectedRoute roles={['RETAILER']}>
                  <PaymentHistoryPage />
                </ProtectedRoute>
              } />

              {/* Delivery */}
              <Route path="/delivery/dashboard" element={
                <ProtectedRoute roles={['DELIVERY']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/my-deliveries" element={
                <ProtectedRoute roles={['DELIVERY']}>
                  <MyDeliveriesPage />
                </ProtectedRoute>
              } />
              <Route path="/delivery-history" element={
                <ProtectedRoute roles={['DELIVERY']}>
                  <DeliveryHistoryPage />
                </ProtectedRoute>
              } />

              {/* Default redirect based on role */}
              <Route
                path="/dashboard"
                element={
                  user?.role === 'SUPER_ADMIN'
                    ? <Navigate to="/super-admin/dashboard" />
                    : user?.role === 'ADMIN'
                      ? <Navigate to="/admin/dashboard" />
                      : user?.role === 'RETAILER'
                        ? <Navigate to="/retailer/dashboard" />
                        : user?.role === 'DELIVERY'
                          ? <Navigate to="/delivery/dashboard" />
                          : <Navigate to="/login" />
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}
