import { useMemo, useState } from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Grid,
    TextField,
    Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import { products } from "../../data/products";


function ProductList() {

    const navigate = useNavigate();

    const [searchText, setSearchText] =
        useState("");

    const [selectedCategory, setSelectedCategory] =
        useState("All");


    // ==========================================
    // GET UNIQUE CATEGORIES
    // ==========================================

    const categories = useMemo(() => {

        return [
            "All",
            ...new Set(
                products.map(
                    (product) =>
                        product.category
                )
            ),
        ];

    }, []);


    // ==========================================
    // FILTER PRODUCTS
    // ==========================================

    const filteredProducts = useMemo(() => {

        return products.filter((product) => {

            const search =
                searchText
                    .toLowerCase()
                    .trim();


            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(search) ||

                product.description
                    .toLowerCase()
                    .includes(search) ||

                product.category
                    .toLowerCase()
                    .includes(search);


            const matchesCategory =
                selectedCategory === "All" ||
                product.category ===
                    selectedCategory;


            return (
                matchesSearch &&
                matchesCategory
            );

        });

    }, [
        searchText,
        selectedCategory,
    ]);


    // ==========================================
    // GROUP PRODUCTS BY CATEGORY
    // ==========================================

    const groupedProducts = useMemo(() => {

        return filteredProducts.reduce(
            (groups, product) => {

                if (
                    !groups[
                        product.category
                    ]
                ) {

                    groups[
                        product.category
                    ] = [];

                }


                groups[
                    product.category
                ].push(product);


                return groups;

            },
            {}
        );

    }, [filteredProducts]);


    // ==========================================
    // CATEGORY IMAGE
    // ==========================================

    const getCategoryImage =
        (category) => {

            const product =
                products.find(
                    (item) =>
                        item.category ===
                        category
                );


            return product?.image || "";

        };


    // ==========================================
    // PRICE CALCULATION
    // ==========================================

    const getPricing = (product) => {

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
            product.finalPrice !==
                undefined &&
            product.finalPrice !== null
                ? Number(
                    product.finalPrice
                )
                : calculatedFinalPrice;


        return {
            originalPrice,
            discountPercentage,
            finalPrice,
        };

    };


    return (

        <Box
            sx={{
                minHeight: "100vh",

                backgroundColor:
                    "#f4f6f8",

                pb: 6,
            }}
        >

            {/* ==========================================
                HEADER
            ========================================== */}

            <Box
                sx={{
                    backgroundColor:
                        "#131921",

                    px: {
                        xs: 2,
                        md: 5,
                    },

                    py: 2,

                    position: "sticky",

                    top: 0,

                    zIndex: 1000,
                }}
            >

                <Grid
                    container
                    spacing={2}
                    alignItems="center"
                >

                    {/* SHOPSTACK LOGO */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 3,
                        }}
                    >

                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            sx={{
                                color: "white",
                                cursor: "pointer",
                            }}
                            onClick={() => {

                                setSelectedCategory(
                                    "All"
                                );

                                setSearchText("");

                            }}
                        >
                            ShopStack
                        </Typography>

                    </Grid>


                    {/* SEARCH BAR */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                        }}
                    >

                        <TextField
                            fullWidth
                            placeholder="Search ShopStack products..."
                            value={searchText}
                            onChange={(event) =>
                                setSearchText(
                                    event.target.value
                                )
                            }
                            sx={{
                                backgroundColor:
                                    "white",

                                borderRadius: 1,

                                "& .MuiOutlinedInput-root":
                                    {
                                        borderRadius: 1,
                                    },
                            }}
                        />

                    </Grid>


                    {/* ORDERS / CART */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 3,
                        }}
                    >

                        <Box
                            sx={{
                                display:
                                    "flex",

                                justifyContent: {
                                    xs: "flex-start",
                                    md: "flex-end",
                                },

                                gap: 1,
                            }}
                        >

                            {/* ORDERS */}

                            <Button
                                variant="outlined"
                                sx={{
                                    color: "white",
                                    borderColor:
                                        "rgba(255,255,255,0.6)",
                                }}
                                onClick={() =>
                                    navigate(
                                        "/my-orders"
                                    )
                                }
                            >
                                Orders
                            </Button>


                            {/* CART */}

                            <Button
                                variant="outlined"
                                sx={{
                                    color: "white",
                                    borderColor:
                                        "rgba(255,255,255,0.6)",
                                }}
                                onClick={() =>
                                    navigate(
                                        "/cart"
                                    )
                                }
                            >
                                Cart
                            </Button>

                        </Box>

                    </Grid>

                </Grid>

            </Box>


            {/* ==========================================
                MAIN CONTENT
            ========================================== */}

            <Box
                sx={{
                    px: {
                        xs: 2,
                        md: 5,
                    },

                    pt: 4,
                }}
            >

                {/* ==========================================
                    SHOP BY CATEGORY
                ========================================== */}

                <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                        mb: 2,
                    }}
                >
                    Shop by Category
                </Typography>


                <Grid
                    container
                    spacing={2}
                    sx={{
                        mb: 5,
                    }}
                >

                    {categories
                        .filter(
                            (category) =>
                                category !==
                                "All"
                        )
                        .map(
                            (category) => (

                                <Grid
                                    key={category}
                                    size={{
                                        xs: 6,
                                        sm: 4,
                                        md: 3,
                                        lg: 2,
                                    }}
                                >

                                    <Card
                                        onClick={() => {

                                            setSelectedCategory(
                                                category
                                            );

                                            setSearchText("");

                                        }}
                                        sx={{
                                            cursor:
                                                "pointer",

                                            height:
                                                "100%",

                                            borderRadius:
                                                2,

                                            border:
                                                selectedCategory ===
                                                category
                                                    ? "3px solid #1976d2"
                                                    : "1px solid #ddd",

                                            transition:
                                                "0.2s",

                                            "&:hover":
                                                {
                                                    transform:
                                                        "translateY(-4px)",

                                                    boxShadow:
                                                        5,
                                                },
                                        }}
                                    >

                                        <CardMedia
                                            component="img"

                                            height="120"

                                            image={
                                                getCategoryImage(
                                                    category
                                                )
                                            }

                                            alt={
                                                category
                                            }

                                            sx={{
                                                objectFit:
                                                    "cover",
                                            }}
                                        />


                                        <CardContent
                                            sx={{
                                                textAlign:
                                                    "center",

                                                py: 1.5,
                                            }}
                                        >

                                            <Typography
                                                fontWeight="bold"
                                            >
                                                {
                                                    category
                                                }
                                            </Typography>

                                        </CardContent>

                                    </Card>

                                </Grid>

                            )
                        )}

                </Grid>


                {/* ==========================================
                    CATEGORY FILTER BUTTONS
                ========================================== */}

                <Box
                    sx={{
                        display:
                            "flex",

                        gap: 1,

                        overflowX:
                            "auto",

                        pb: 2,

                        mb: 3,
                    }}
                >

                    {categories.map(
                        (category) => (

                            <Button
                                key={category}

                                variant={
                                    selectedCategory ===
                                    category
                                        ? "contained"
                                        : "outlined"
                                }

                                onClick={() => {

                                    setSelectedCategory(
                                        category
                                    );

                                    setSearchText("");

                                }}

                                sx={{
                                    minWidth:
                                        "fit-content",

                                    whiteSpace:
                                        "nowrap",
                                }}
                            >
                                {category}
                            </Button>

                        )
                    )}

                </Box>


                {/* ==========================================
                    SEARCH RESULT MESSAGE
                ========================================== */}

                {searchText && (

                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                            mb: 3,
                        }}
                    >
                        Search results for "
                        {searchText}"
                    </Typography>

                )}


                {/* ==========================================
                    NO PRODUCTS
                ========================================== */}

                {filteredProducts.length === 0 && (

                    <Card
                        sx={{
                            p: 5,
                            textAlign:
                                "center",
                        }}
                    >

                        <Typography
                            variant="h5"
                            fontWeight="bold"
                        >
                            No products found
                        </Typography>


                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 1,
                            }}
                        >
                            Try searching for another
                            product or category.
                        </Typography>


                        <Button
                            variant="contained"
                            sx={{
                                mt: 3,
                            }}
                            onClick={() => {

                                setSearchText("");

                                setSelectedCategory(
                                    "All"
                                );

                            }}
                        >
                            View All Products
                        </Button>

                    </Card>

                )}


                {/* ==========================================
                    PRODUCTS BY CATEGORY
                ========================================== */}

                {Object.entries(
                    groupedProducts
                ).map(
                    (
                        [
                            category,
                            categoryProducts,
                        ]
                    ) => (

                        <Box
                            key={category}
                            sx={{
                                mb: 6,
                            }}
                        >

                            {/* CATEGORY TITLE */}

                            <Box
                                sx={{
                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "space-between",

                                    mb: 2,
                                }}
                            >

                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                >
                                    {category}
                                </Typography>


                                <Button
                                    onClick={() => {

                                        setSelectedCategory(
                                            category
                                        );

                                        setSearchText("");

                                    }}
                                >
                                    See all
                                </Button>

                            </Box>


                            {/* PRODUCTS */}

                            <Grid
                                container
                                spacing={3}
                            >

                                {categoryProducts.map(
                                    (product) => {

                                        const {
                                            originalPrice,
                                            discountPercentage,
                                            finalPrice,
                                        } =
                                            getPricing(
                                                product
                                            );


                                        return (

                                            <Grid
                                                key={
                                                    product.id
                                                }
                                                size={{
                                                    xs: 12,
                                                    sm: 6,
                                                    md: 4,
                                                    lg: 3,
                                                }}
                                            >

                                                <Card
                                                    sx={{
                                                        height:
                                                            "100%",

                                                        display:
                                                            "flex",

                                                        flexDirection:
                                                            "column",

                                                        borderRadius:
                                                            3,

                                                        overflow:
                                                            "hidden",

                                                        boxShadow:
                                                            3,

                                                        transition:
                                                            "0.2s",

                                                        "&:hover":
                                                            {
                                                                transform:
                                                                    "translateY(-5px)",

                                                                boxShadow:
                                                                    6,
                                                            },
                                                    }}
                                                >

                                                    {/* PRODUCT IMAGE */}

                                                    <CardMedia
                                                        component="img"

                                                        height="220"

                                                        image={
                                                            product.image
                                                        }

                                                        alt={
                                                            product.name
                                                        }

                                                        sx={{
                                                            objectFit:
                                                                "cover",

                                                            display:
                                                                "block",
                                                        }}
                                                    />


                                                    {/* PRODUCT DETAILS */}

                                                    <CardContent
                                                        sx={{
                                                            display:
                                                                "flex",

                                                            flexDirection:
                                                                "column",

                                                            flexGrow:
                                                                1,
                                                        }}
                                                    >

                                                        <Typography
                                                            variant="caption"
                                                            color="primary"
                                                            fontWeight="bold"
                                                        >
                                                            {
                                                                product.category
                                                            }
                                                        </Typography>


                                                        <Typography
                                                            variant="h6"
                                                            fontWeight="bold"
                                                            sx={{
                                                                mt: 1,
                                                            }}
                                                        >
                                                            {
                                                                product.name
                                                            }
                                                        </Typography>


                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                mt: 1,

                                                                minHeight:
                                                                    60,
                                                            }}
                                                        >
                                                            {
                                                                product.description
                                                            }
                                                        </Typography>


                                                        {/* ==================================
                                                            PRICE
                                                        ================================== */}

                                                        <Box
                                                            sx={{
                                                                mt: 2,
                                                                mb: 2,
                                                            }}
                                                        >

                                                            {discountPercentage >
                                                            0 ? (

                                                                <>

                                                                    {/* ORIGINAL PRICE */}

                                                                    <Typography
                                                                        variant="body2"
                                                                        color="text.secondary"
                                                                        sx={{
                                                                            textDecoration:
                                                                                "line-through",
                                                                        }}
                                                                    >
                                                                        MRP: ₹
                                                                        {originalPrice.toLocaleString(
                                                                            "en-IN"
                                                                        )}
                                                                    </Typography>


                                                                    {/* FINAL PRICE + DISCOUNT */}

                                                                    <Box
                                                                        sx={{
                                                                            display:
                                                                                "flex",

                                                                            alignItems:
                                                                                "center",

                                                                            gap: 1,

                                                                            mt: 0.5,

                                                                            flexWrap:
                                                                                "wrap",
                                                                        }}
                                                                    >

                                                                        <Typography
                                                                            variant="h6"
                                                                            fontWeight="bold"
                                                                        >
                                                                            ₹
                                                                            {finalPrice.toLocaleString(
                                                                                "en-IN"
                                                                            )}
                                                                        </Typography>


                                                                        <Chip
                                                                            label={`${discountPercentage}% OFF`}
                                                                            color="success"
                                                                            size="small"
                                                                        />

                                                                    </Box>

                                                                </>

                                                            ) : (

                                                                <Typography
                                                                    variant="h6"
                                                                    fontWeight="bold"
                                                                >
                                                                    ₹
                                                                    {originalPrice.toLocaleString(
                                                                        "en-IN"
                                                                    )}
                                                                </Typography>

                                                            )}

                                                        </Box>


                                                        {/* VIEW PRODUCT */}

                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            sx={{
                                                                mt:
                                                                    "auto",
                                                            }}
                                                            onClick={() =>
                                                                navigate(
                                                                    `/products/${product.id}`
                                                                )
                                                            }
                                                        >
                                                            View Product
                                                        </Button>

                                                    </CardContent>

                                                </Card>

                                            </Grid>

                                        );

                                    }
                                )}

                            </Grid>

                        </Box>

                    )
                )}

            </Box>

        </Box>
    );
}


export default ProductList;