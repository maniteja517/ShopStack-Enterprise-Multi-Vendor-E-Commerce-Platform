import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Home from "../pages/customer/Home";
import ProductList from "../pages/customer/ProductList";
import ProductDetails from "../pages/customer/ProductDetails";
import Cart from "../pages/customer/Cart";
import Checkout from "../pages/customer/Checkout";
import OrderSuccess from "../pages/customer/OrderSuccess";
import MyOrders from "../pages/customer/MyOrders";
import OrderDetails from "../pages/customer/OrderDetails";

import ProtectedRoute from "../components/auth/ProtectedRoute";

import AdminDashboard from "../pages/admin/AdminDashboard";

import VendorManagement from "../pages/admin/VendorManagement";

import MarketplaceAnalytics from "../pages/admin/MarketplaceAnalytics";

import OrderMonitoring from "../pages/admin/OrderMonitoring";

import CommissionManagement from "../pages/admin/CommissionManagement";

import SystemMonitoring from "../pages/admin/SystemMonitoring";

import BusinessReports from "../pages/admin/BusinessReports";

function AppRoutes() {

    return (
        <Routes>

            {/* =====================================
                PUBLIC ROUTES
            ===================================== */}

            <Route
                path="/"
                element={<Login />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />


            {/* =====================================
                CUSTOMER HOME
            ===================================== */}

            <Route
                path="/home"
                element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                }
            />


            {/* =====================================
                PRODUCTS
            ===================================== */}

            <Route
                path="/products"
                element={
                    <ProtectedRoute>
                        <ProductList />
                    </ProtectedRoute>
                }
            />


            {/* =====================================
                PRODUCT DETAILS
            ===================================== */}

            <Route
                path="/products/:id"
                element={
                    <ProtectedRoute>
                        <ProductDetails />
                    </ProtectedRoute>
                }
            />


            {/* =====================================
                CART
            ===================================== */}

            <Route
                path="/cart"
                element={
                    <ProtectedRoute>
                        <Cart />
                    </ProtectedRoute>
                }
            />


            {/* =====================================
                CHECKOUT
            ===================================== */}

            <Route
                path="/checkout"
                element={
                    <ProtectedRoute>
                        <Checkout />
                    </ProtectedRoute>
                }
            />


            {/* =====================================
                ORDER SUCCESS
            ===================================== */}

            <Route
                path="/order-success"
                element={
                    <ProtectedRoute>
                        <OrderSuccess />
                    </ProtectedRoute>
                }
            />


            {/* =====================================
                MY ORDERS
            ===================================== */}

            <Route
                path="/my-orders"
                element={<MyOrders />}
            />


            {/* =====================================
                ORDER DETAILS
            ===================================== */}

            <Route
                path="/orders/:id"
                element={
                    <ProtectedRoute>
                        <OrderDetails />
                    </ProtectedRoute>
                }
            />



{/* =====================================
    ADMIN DASHBOARD
===================================== */}

<Route
    path="/admin/dashboard"
    element={
        <ProtectedRoute>
            <AdminDashboard />
        </ProtectedRoute>
    }
/>




 {/* =====================================
    VENDOR MANAGEMENT
===================================== */}

<Route
    path="/admin/vendors"
    element={
        <ProtectedRoute>
            <VendorManagement />
        </ProtectedRoute>
    }
/>



{/* =====================================
    MARKETPLACE ANALYTICS
===================================== */}

<Route
    path="/admin/analytics"
    element={
        <ProtectedRoute>
            <MarketplaceAnalytics />
        </ProtectedRoute>
    }
/>




{/* =====================================
    ORDER MONITORING
===================================== */}

<Route
    path="/admin/orders"
    element={
        <ProtectedRoute>
            <OrderMonitoring />
        </ProtectedRoute>
    }
/>



{/* =====================================
    COMMISSION MANAGEMENT
===================================== */}

<Route
    path="/admin/commissions"
    element={
        <ProtectedRoute>
            <CommissionManagement />
        </ProtectedRoute>
    }
/>



{/* =====================================
    SYSTEM MONITORING
===================================== */}

<Route
    path="/admin/system"
    element={
        <ProtectedRoute>
            <SystemMonitoring />
        </ProtectedRoute>
    }
/>



{/* =====================================
    BUSINESS REPORTS
===================================== */}

<Route
    path="/admin/reports"
    element={
        <ProtectedRoute>
            <BusinessReports />
        </ProtectedRoute>
    }
/>



            {/* =====================================
                UNKNOWN URL
            ===================================== */}

            <Route
                path="*"
                element={<Login />}
            />

        </Routes>
    );
}


export default AppRoutes;