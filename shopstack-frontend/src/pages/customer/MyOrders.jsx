import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Divider,
    Typography,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyOrders } from "../../api/orderService";

import { products } from "../../data/products";


function MyOrders() {

    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);


    // ==========================================
    // FETCH MY ORDERS
    // ==========================================

    useEffect(() => {

        const fetchOrders = async () => {

            try {

                console.log(
                    "===== FETCHING MY ORDERS ====="
                );

                const response =
                    await getMyOrders();

                console.log(
                    "My Orders API Response:",
                    response.data
                );

                setOrders(
                    response.data.data || []
                );

            } catch (error) {

                console.error(
                    "MY ORDERS ERROR:",
                    error
                );

                console.error(
                    "Backend response:",
                    error.response?.data
                );

                alert(
                    error.response?.data?.message ||
                    "Failed to load orders"
                );

            } finally {

                setLoading(false);

            }
        };

        fetchOrders();

    }, []);


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <Box
                sx={{
                    minHeight: "70vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >

                <CircularProgress />

            </Box>
        );

    }


    // ==========================================
    // STATUS COLOR
    // ==========================================

    const getStatusColor = (status) => {

        switch (status) {

            case "PLACED":
                return "info";

            case "CONFIRMED":
                return "primary";

            case "SHIPPED":
                return "warning";

            case "DELIVERED":
                return "success";

            case "CANCELLED":
                return "error";

            case "RETURNED":
                return "warning";

            case "REFUNDED":
                return "success";

            default:
                return "default";
        }
    };


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

            {/* ==================================
                PAGE TITLE
            ================================== */}

            <Typography
                variant="h4"
                fontWeight="bold"
                mb={4}
            >
                My Orders
            </Typography>


            {/* ==================================
                NO ORDERS
            ================================== */}

            {orders.length === 0 ? (

                <Card>

                    <CardContent>

                        <Typography
                            variant="h6"
                            mb={2}
                        >
                            You have no orders yet.
                        </Typography>


                        <Button
                            variant="contained"
                            onClick={() =>
                                navigate("/products")
                            }
                        >
                            Start Shopping
                        </Button>

                    </CardContent>

                </Card>

            ) : (

                /* ==================================
                   ORDERS
                ================================== */

                orders.map((order) => (

                    <Card
                        key={order.id}
                        sx={{
                            mb: 3,
                            borderRadius: 3,
                            boxShadow: 2,
                        }}
                    >

                        <CardContent
                            sx={{
                                p: {
                                    xs: 2,
                                    md: 3,
                                },
                            }}
                        >

                            {/* ==================================
                                ORDER HEADER
                            ================================== */}

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "center",
                                    flexWrap:
                                        "wrap",
                                    gap: 2,
                                }}
                            >

                                <Box>

                                    <Typography
                                        variant="h5"
                                        fontWeight="bold"
                                    >
                                        Order #{order.id}
                                    </Typography>


                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            mt: 0.5,
                                        }}
                                    >
                                        Ordered on:{" "}
                                        {order.createdAt
                                            ? new Date(
                                                order.createdAt
                                            ).toLocaleString()
                                            : "N/A"}
                                    </Typography>

                                </Box>


                                {/* STATUS */}

                                <Chip
                                    label={
                                        order.status ||
                                        "PLACED"
                                    }
                                    color={getStatusColor(
                                        order.status
                                    )}
                                    sx={{
                                        fontWeight:
                                            "bold",
                                    }}
                                />

                            </Box>


                            <Divider
                                sx={{
                                    my: 2,
                                }}
                            />


                            {/* ==================================
                                ORDER ITEMS
                            ================================== */}

                            {order.items?.map(
                                (
                                    item,
                                    index
                                ) => {

                                    /*
                                     * Find the product from
                                     * local products data.
                                     *
                                     * Backend OrderItemResponse
                                     * contains productId.
                                     */

                                    const product =
                                        products.find(
                                            (product) =>
                                                product.id ===
                                                Number(
                                                    item.productId
                                                )
                                        );


                                    const productImage =
                                        product?.image ||
                                        item.image;


                                    const productName =
                                        product?.name ||
                                        item.productName;


                                    return (

                                        <Box
                                            key={
                                                item.productId ||
                                                index
                                            }
                                            sx={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                gap: 3,
                                                mb: 2,
                                                p: 2,
                                                border:
                                                    "1px solid #e0e0e0",
                                                borderRadius: 2,
                                                backgroundColor:
                                                    "#fff",
                                            }}
                                        >

                                            {/* ==================================
                                                PRODUCT IMAGE
                                            ================================== */}

                                            <Box
                                                sx={{
                                                    width: 110,
                                                    height: 110,
                                                    flexShrink: 0,
                                                    border:
                                                        "1px solid #ddd",
                                                    borderRadius: 2,
                                                    overflow:
                                                        "hidden",
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    backgroundColor:
                                                        "#fff",
                                                }}
                                            >

                                                {productImage ? (

                                                    <CardMedia
                                                        component="img"
                                                        image={
                                                            productImage
                                                        }
                                                        alt={
                                                            productName
                                                        }
                                                        sx={{
                                                            width:
                                                                "100%",
                                                            height:
                                                                "100%",
                                                            objectFit:
                                                                "contain",
                                                        }}
                                                    />

                                                ) : (

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        textAlign="center"
                                                    >
                                                        Image
                                                        unavailable
                                                    </Typography>

                                                )}

                                            </Box>


                                            {/* ==================================
                                                PRODUCT INFORMATION
                                            ================================== */}

                                            <Box
                                                sx={{
                                                    flexGrow: 1,
                                                }}
                                            >

                                                <Typography
                                                    variant="h6"
                                                    fontWeight="bold"
                                                >
                                                    {
                                                        productName
                                                    }
                                                </Typography>


                                                <Typography
                                                    color="text.secondary"
                                                    sx={{
                                                        mt: 0.5,
                                                    }}
                                                >
                                                    ₹
                                                    {Number(
                                                        item.price
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}{" "}
                                                    ×{" "}
                                                    {
                                                        item.quantity
                                                    }
                                                </Typography>


                                                <Typography
                                                    fontWeight="bold"
                                                    sx={{
                                                        mt: 1,
                                                    }}
                                                >
                                                    Subtotal: ₹
                                                    {Number(
                                                        item.subtotal ??
                                                        Number(
                                                            item.price
                                                        ) *
                                                        Number(
                                                            item.quantity
                                                        )
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </Typography>

                                            </Box>

                                        </Box>

                                    );

                                }
                            )}


                            <Divider
                                sx={{
                                    my: 2,
                                }}
                            />


                            {/* ==================================
                                ORDER FOOTER
                            ================================== */}

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "center",
                                    flexWrap:
                                        "wrap",
                                    gap: 2,
                                }}
                            >

                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                >
                                    Total: ₹
                                    {Number(
                                        order.totalAmount ??
                                        order.total ??
                                        0
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </Typography>


                                <Button
                                    variant="outlined"
                                    onClick={() =>
                                        navigate(
                                            `/orders/${order.id}`
                                        )
                                    }
                                >
                                    View Details
                                </Button>

                            </Box>

                        </CardContent>

                    </Card>

                ))

            )}

        </Box>
    );
}

export default MyOrders;