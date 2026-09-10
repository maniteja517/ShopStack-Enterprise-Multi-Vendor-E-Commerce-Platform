import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    CircularProgress,
    Alert,
} from "@mui/material";

import { useEffect, useState } from "react";

import { getAdminDashboard } from "../../api/adminDashboardService";


function AdminDashboard() {

    const [dashboard, setDashboard] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const response =
                    await getAdminDashboard();

                console.log(
                    "ADMIN DASHBOARD RESPONSE:",
                    response.data
                );

                setDashboard(
                    response.data.data
                );

            } catch (error) {

                console.error(
                    "Dashboard error:",
                    error
                );

                setError(
                    "Failed to load admin dashboard."
                );

            } finally {

                setLoading(false);

            }
        };

        loadDashboard();

    }, []);


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }


    // =========================
    // ERROR
    // =========================

    if (error) {

        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">
                    {error}
                </Alert>
            </Box>
        );
    }


    // =========================
    // DASHBOARD
    // =========================

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#f4f6f8",
                p: {
                    xs: 2,
                    md: 4,
                },
            }}
        >

            <Typography
                variant="h4"
                fontWeight="bold"
                mb={1}
            >
                Admin Dashboard
            </Typography>

            <Typography
                color="text.secondary"
                mb={4}
            >
                ShopStack marketplace overview
            </Typography>


            {/* =========================
                SUMMARY CARDS
            ========================= */}

            <Grid
                container
                spacing={3}
            >

                <DashboardCard
                    title="Total Users"
                    value={dashboard.totalUsers}
                />

                <DashboardCard
                    title="Customers"
                    value={dashboard.totalCustomers}
                />

                <DashboardCard
                    title="Vendors"
                    value={dashboard.totalVendors}
                />

                <DashboardCard
                    title="Approved Vendors"
                    value={dashboard.approvedVendors}
                />

                <DashboardCard
                    title="Products"
                    value={dashboard.totalProducts}
                />

                <DashboardCard
                    title="Total Orders"
                    value={dashboard.totalOrders}
                />

                <DashboardCard
                    title="Total Sales"
                    value={`₹${Number(
                        dashboard.totalSales
                    ).toLocaleString("en-IN")}`}
                />

            </Grid>


            {/* =========================
                ORDER STATUS
            ========================= */}

            <Typography
                variant="h5"
                fontWeight="bold"
                mt={5}
                mb={3}
            >
                Order Status
            </Typography>


            <Grid
                container
                spacing={3}
            >

                <DashboardCard
                    title="Placed"
                    value={dashboard.placedOrders}
                />

                <DashboardCard
                    title="Confirmed"
                    value={dashboard.confirmedOrders}
                />

                <DashboardCard
                    title="Shipped"
                    value={dashboard.shippedOrders}
                />

                <DashboardCard
                    title="Delivered"
                    value={dashboard.deliveredOrders}
                />

                <DashboardCard
                    title="Cancelled"
                    value={dashboard.cancelledOrders}
                />

                <DashboardCard
                    title="Returned"
                    value={dashboard.returnedOrders}
                />

                <DashboardCard
                    title="Refunded"
                    value={dashboard.refundedOrders}
                />

            </Grid>

        </Box>
    );
}


// =========================
// DASHBOARD CARD
// =========================

function DashboardCard({
    title,
    value,
}) {

    return (
        <Grid
            size={{
                xs: 12,
                sm: 6,
                md: 3,
            }}
        >

            <Card
                sx={{
                    height: "100%",
                    borderRadius: 3,
                }}
            >

                <CardContent>

                    <Typography
                        color="text.secondary"
                        variant="body2"
                        mb={1}
                    >
                        {title}
                    </Typography>

                    <Typography
                        variant="h5"
                        fontWeight="bold"
                    >
                        {value}
                    </Typography>

                </CardContent>

            </Card>

        </Grid>
    );
}


export default AdminDashboard;