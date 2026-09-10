import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Typography,
} from "@mui/material";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import { useCart } from "../../context/CartContext";

import { products } from "../../data/products";


function ProductDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const {
        addToCart,
    } = useCart();


    const product =
        products.find(
            (item) =>
                item.id === Number(id)
        );


    // ==========================================
    // PRODUCT NOT FOUND
    // ==========================================

    if (!product) {

        return (
            <Box sx={{ p: 4 }}>

                <Typography
                    variant="h5"
                    gutterBottom
                >
                    Product not found
                </Typography>


                <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() =>
                        navigate("/products")
                    }
                >
                    Back to Products
                </Button>

            </Box>
        );
    }


    // ==========================================
    // PRICING
    // ==========================================

    const originalPrice =
        Number(product.price) || 0;

    const discountPercentage =
        Number(
            product.discountPercentage ?? 0
        );

    const calculatedFinalPrice =
        originalPrice -
        (
            originalPrice *
            discountPercentage
        ) / 100;

    const finalPrice =
        product.finalPrice !== undefined &&
        product.finalPrice !== null
            ? Number(product.finalPrice)
            : calculatedFinalPrice;


    // ==========================================
    // ADD TO CART
    // ==========================================

    const handleAddToCart =
        async () => {

            console.log(
                "===== ADD TO CART CLICKED ====="
            );

            console.log(
                "Product:",
                product
            );


            /*
             * Make sure the cart receives
             * the discounted final price.
             */

            const productForCart = {
                ...product,
                price: finalPrice,
                originalPrice: originalPrice,
                discountPercentage:
                    discountPercentage,
                finalPrice: finalPrice,
            };


            const success =
                await addToCart(
                    productForCart
                );


            if (success) {

                alert(
                    "Product added to cart!"
                );

            }

        };


    return (
        <Box
            sx={{
                minHeight: "100vh",

                backgroundColor:
                    "#f4f6f8",

                p: {
                    xs: 2,
                    md: 4,
                },
            }}
        >

            {/* ==========================================
                BACK BUTTON
            ========================================== */}

            <Button
                variant="outlined"
                sx={{
                    mb: 3,
                }}
                onClick={() =>
                    navigate("/products")
                }
            >
                ← Back to Products
            </Button>


            {/* ==========================================
                PRODUCT CARD
            ========================================== */}

            <Card
                sx={{
                    maxWidth: 1000,
                    mx: "auto",

                    borderRadius: 3,

                    overflow: "hidden",
                }}
            >

                <Box
                    sx={{
                        display: "flex",

                        flexDirection: {
                            xs: "column",
                            md: "row",
                        },
                    }}
                >

                    {/* ==========================================
                        PRODUCT IMAGE
                    ========================================== */}

                    <Box
                        sx={{
                            width: {
                                xs: "100%",
                                md: "50%",
                            },

                            minHeight: 450,

                            display: "flex",

                            alignItems:
                                "center",

                            justifyContent:
                                "center",

                            backgroundColor:
                                "#fff",

                            p: 3,
                        }}
                    >

                        <CardMedia
                            component="img"

                            image={
                                product.image
                            }

                            alt={
                                product.name
                            }

                            sx={{
                                width:
                                    "100%",

                                height:
                                    450,

                                objectFit:
                                    "contain",
                            }}
                        />

                    </Box>


                    {/* ==========================================
                        PRODUCT DETAILS
                    ========================================== */}

                    <CardContent
                        sx={{
                            width: {
                                xs: "100%",
                                md: "50%",
                            },

                            p: {
                                xs: 3,
                                md: 5,
                            },
                        }}
                    >

                        {/* CATEGORY */}

                        <Typography
                            variant="body2"
                            color="primary"
                            fontWeight="bold"
                            mb={1}
                        >
                            {product.category}
                        </Typography>


                        {/* PRODUCT NAME */}

                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            gutterBottom
                        >
                            {product.name}
                        </Typography>


                        {/* DESCRIPTION */}

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            mb={3}
                        >
                            {
                                product.description
                            }
                        </Typography>


                        {/* ==================================
                            PRICE
                        ================================== */}

                        <Box sx={{ mb: 3 }}>

                            {discountPercentage >
                                0 ? (

                                <Box>

                                    {/* ORIGINAL PRICE */}

                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                        sx={{
                                            textDecoration:
                                                "line-through",
                                            mb: 0.5,
                                        }}
                                    >
                                        MRP: ₹
                                        {originalPrice.toLocaleString(
                                            "en-IN"
                                        )}
                                    </Typography>


                                    {/* FINAL PRICE */}

                                    <Box
                                        sx={{
                                            display:
                                                "flex",

                                            alignItems:
                                                "center",

                                            gap: 2,

                                            flexWrap:
                                                "wrap",
                                        }}
                                    >

                                        <Typography
                                            variant="h4"
                                            fontWeight="bold"
                                        >
                                            ₹
                                            {finalPrice.toLocaleString(
                                                "en-IN"
                                            )}
                                        </Typography>


                                        {/* DISCOUNT */}

                                        <Chip
                                            label={`${discountPercentage}% OFF`}
                                            color="success"
                                            size="small"
                                        />

                                    </Box>


                                    {/* SAVINGS */}

                                    <Typography
                                        variant="body2"
                                        color="success.main"
                                        fontWeight="bold"
                                        sx={{
                                            mt: 1,
                                        }}
                                    >
                                        You save ₹
                                        {(
                                            originalPrice -
                                            finalPrice
                                        ).toLocaleString(
                                            "en-IN",
                                            {
                                                maximumFractionDigits:
                                                    2,
                                            }
                                        )}
                                    </Typography>

                                </Box>

                            ) : (

                                <Typography
                                    variant="h4"
                                    fontWeight="bold"
                                >
                                    ₹
                                    {originalPrice.toLocaleString(
                                        "en-IN"
                                    )}
                                </Typography>

                            )}

                        </Box>


                        {/* PRODUCT ID */}

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={3}
                        >
                            Product ID:{" "}
                            {product.id}
                        </Typography>


                        {/* ==================================
                            BUTTONS
                        ================================== */}

                        <Box
                            sx={{
                                display:
                                    "flex",

                                gap: 2,

                                flexWrap:
                                    "wrap",
                            }}
                        >

                            <Button
                                variant="contained"
                                size="large"
                                onClick={
                                    handleAddToCart
                                }
                            >
                                Add to Cart
                            </Button>


                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() =>
                                    navigate(
                                        "/cart"
                                    )
                                }
                            >
                                View Cart
                            </Button>

                        </Box>

                    </CardContent>

                </Box>

            </Card>

        </Box>
    );
}


export default ProductDetails;