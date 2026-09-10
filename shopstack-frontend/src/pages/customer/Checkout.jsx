import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Divider,
    Grid,
    TextField,
    Typography,
} from "@mui/material";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { createOrder } from "../../api/orderService";


function Checkout() {

    const navigate = useNavigate();

    const {
        cartItems,
        clearCart,
    } = useCart();


    const [address, setAddress] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });


    const [loading, setLoading] = useState(false);


    // ==========================================
    // HANDLE INPUT CHANGE
    // ==========================================

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setAddress((previousAddress) => ({
            ...previousAddress,
            [name]: value,
        }));
    };


    // ==========================================
    // CALCULATE TOTAL
    // ==========================================

    const total = cartItems.reduce(
        (sum, item) =>
            sum +
            Number(item.price) *
            Number(item.quantity),
        0
    );


    // ==========================================
    // PLACE ORDER
    // ==========================================

    const handlePlaceOrder = async () => {

        console.log(
            "===== PLACING ORDER ====="
        );

        console.log(
            "Cart Items:",
            cartItems
        );

        console.log(
            "Address:",
            address
        );

        console.log(
            "Total:",
            total
        );


        // ==========================================
        // CHECK CART
        // ==========================================

        if (cartItems.length === 0) {

            alert(
                "Your cart is empty"
            );

            navigate("/cart");

            return;
        }


        // ==========================================
        // CHECK ADDRESS
        // ==========================================

        if (
            !address.name ||
            !address.phone ||
            !address.address ||
            !address.city ||
            !address.state ||
            !address.pincode
        ) {

            alert(
                "Please fill all delivery details"
            );

            return;
        }


        // ==========================================
        // ORDER REQUEST
        // ==========================================

        const orderData = {

            customerName:
                address.name,

            phone:
                address.phone,

            address:
                address.address,

            city:
                address.city,

            state:
                address.state,

            pincode:
                address.pincode,
        };


        console.log(
            "===== ORDER REQUEST ====="
        );

        console.log(
            orderData
        );


        try {

            setLoading(true);


            console.log(
                "===== CALLING POST /api/orders ====="
            );


            const response =
                await createOrder(
                    orderData
                );


            console.log(
                "===== ORDER API RESPONSE ====="
            );

            console.log(
                response.data
            );


            // ==========================================
            // SUCCESS
            // ==========================================

            if (
                response.data &&
                response.data.success
            ) {

                const order =
                    response.data.data;


                console.log(
                    "ORDER CREATED:",
                    order
                );


                // ==========================================
                // SAVE ORDER + CART ITEMS
                //
                // Backend order response does not contain
                // product image, so we preserve the
                // cartItems here. cartItems contain:
                //
                // id
                // name
                // price
                // quantity
                // image
                // category
                // description
                // ==========================================

                const completeOrder = {
                    ...order,
                    items: cartItems,
                };


                localStorage.setItem(
                    "latestOrder",
                    JSON.stringify(
                        completeOrder
                    )
                );


                console.log(
                    "LATEST ORDER WITH PRODUCT IMAGES SAVED:",
                    completeOrder
                );


                // ==========================================
                // CLEAR CART
                // ==========================================

                clearCart();


                console.log(
                    "CART CLEARED"
                );


                // ==========================================
                // GO TO ORDER SUCCESS
                // ==========================================

                navigate(
                    "/order-success"
                );


            } else {

                alert(
                    response.data?.message ||
                    "Order could not be placed"
                );
            }


        } catch (error) {

            console.error(
                "===== ORDER CREATION ERROR ====="
            );

            console.error(
                error
            );


            if (error.response) {

                console.error(
                    "Status:",
                    error.response.status
                );

                console.error(
                    "Backend Response:",
                    error.response.data
                );
            }


            alert(
                error.response?.data?.message ||
                "Failed to place order"
            );


        } finally {

            setLoading(false);
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

            {/* PAGE TITLE */}

            <Typography
                variant="h4"
                fontWeight="bold"
                mb={3}
            >
                Checkout
            </Typography>


            <Grid
                container
                spacing={3}
            >

                {/* ==========================================
                    DELIVERY ADDRESS
                ========================================== */}

                <Grid
                    size={{
                        xs: 12,
                        md: 7,
                    }}
                >

                    <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: 3,
                        }}
                    >

                        <CardContent
                            sx={{
                                p: 3,
                            }}
                        >

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                mb={3}
                            >
                                Delivery Address
                            </Typography>


                            <TextField
                                fullWidth
                                label="Full Name"
                                name="name"
                                value={
                                    address.name
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                                required
                            />


                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="phone"
                                value={
                                    address.phone
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                                required
                            />


                            <TextField
                                fullWidth
                                label="Address"
                                name="address"
                                value={
                                    address.address
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                                multiline
                                rows={3}
                                required
                            />


                            <TextField
                                fullWidth
                                label="City"
                                name="city"
                                value={
                                    address.city
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                                required
                            />


                            <TextField
                                fullWidth
                                label="State"
                                name="state"
                                value={
                                    address.state
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                                required
                            />


                            <TextField
                                fullWidth
                                label="Pincode"
                                name="pincode"
                                value={
                                    address.pincode
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                                required
                            />

                        </CardContent>

                    </Card>

                </Grid>


                {/* ==========================================
                    ORDER SUMMARY
                ========================================== */}

                <Grid
                    size={{
                        xs: 12,
                        md: 5,
                    }}
                >

                    <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: 3,
                        }}
                    >

                        <CardContent
                            sx={{
                                p: 3,
                            }}
                        >

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                mb={3}
                            >
                                Order Summary
                            </Typography>


                            {/* ==========================================
                                PRODUCTS
                            ========================================== */}

                            {cartItems.map(
                                (item) => (

                                    <Card
                                        key={item.id}
                                        sx={{
                                            mb: 2,
                                            borderRadius: 2,
                                            boxShadow: 1,
                                            overflow: "hidden",
                                        }}
                                    >

                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 2,
                                                p: 2,
                                            }}
                                        >

                                            {/* ==================================
                                                PRODUCT IMAGE
                                            ================================== */}

                                            <Box
                                                sx={{
                                                    width: 120,
                                                    height: 120,
                                                    flexShrink: 0,
                                                    backgroundColor:
                                                        "#ffffff",
                                                    borderRadius: 2,
                                                    border:
                                                        "1px solid #e0e0e0",
                                                    display: "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    overflow:
                                                        "hidden",
                                                }}
                                            >

                                                <CardMedia
                                                    component="img"
                                                    image={
                                                        item.image
                                                    }
                                                    alt={
                                                        item.name
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

                                            </Box>


                                            {/* ==================================
                                                PRODUCT DETAILS
                                            ================================== */}

                                            <Box
                                                sx={{
                                                    flexGrow: 1,
                                                    minWidth: 0,
                                                }}
                                            >

                                                <Typography
                                                    variant="h6"
                                                    fontWeight="bold"
                                                    sx={{
                                                        mb: 1,
                                                    }}
                                                >
                                                    {item.name}
                                                </Typography>


                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    ₹
                                                    {Number(
                                                        item.price
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}

                                                    {" × "}

                                                    {item.quantity}
                                                </Typography>


                                                <Typography
                                                    sx={{
                                                        mt: 1,
                                                    }}
                                                    fontWeight="bold"
                                                >
                                                    ₹
                                                    {(
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

                                    </Card>

                                )
                            )}


                            {/* ==========================================
                                DIVIDER
                            ========================================== */}

                            <Divider
                                sx={{
                                    my: 2,
                                }}
                            />


                            {/* ==========================================
                                TOTAL
                            ========================================== */}

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "center",
                                }}
                            >

                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                >
                                    Total
                                </Typography>


                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                >
                                    ₹
                                    {Number(
                                        total
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </Typography>

                            </Box>


                            {/* ==========================================
                                PLACE ORDER
                            ========================================== */}

                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                sx={{
                                    mt: 3,
                                    height: 50,
                                }}
                                onClick={
                                    handlePlaceOrder
                                }
                                disabled={loading}
                            >
                                {loading
                                    ? "Placing Order..."
                                    : "Place Order"}
                            </Button>


                            {/* ==========================================
                                BACK TO CART
                            ========================================== */}

                            <Button
                                variant="outlined"
                                fullWidth
                                sx={{
                                    mt: 2,
                                    height: 50,
                                }}
                                onClick={() =>
                                    navigate(
                                        "/cart"
                                    )
                                }
                                disabled={loading}
                            >
                                Back to Cart
                            </Button>

                        </CardContent>

                    </Card>

                </Grid>

            </Grid>

        </Box>
    );
}

export default Checkout;