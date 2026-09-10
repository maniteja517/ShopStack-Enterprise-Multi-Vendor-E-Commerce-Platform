import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import axios from "axios";

import { products } from "../data/products";


const CartContext = createContext(null);


const API_URL = "http://localhost:8080/api/cart";


export const CartProvider = ({ children }) => {

    const [cartItems, setCartItems] = useState([]);

    const [cartLoading, setCartLoading] =
        useState(true);


    // ==========================================
    // AUTH CONFIG
    // ==========================================

    const getAuthConfig = () => {

        const token =
            localStorage.getItem("token");

        return {
            headers: {
                Authorization:
                    `Bearer ${token}`,
                "Content-Type":
                    "application/json",
            },
        };
    };


    // ==========================================
    // LOAD CART FROM BACKEND
    // ==========================================

    const loadCart = async () => {

        const token =
            localStorage.getItem("token");


        if (!token) {

            setCartItems([]);

            setCartLoading(false);

            return;
        }


        try {

            console.log(
                "===== LOADING CART FROM BACKEND ====="
            );


            const response =
                await axios.get(
                    API_URL,
                    getAuthConfig()
                );


            console.log(
                "CART API RESPONSE:",
                response.data
            );


            if (
                response.data &&
                response.data.success
            ) {

                const backendCart =
                    response.data.data;


                const backendItems =
                    backendCart?.items || [];


                /*
                 * Convert backend cart items
                 * into frontend cart items.
                 *
                 * Backend:
                 *
                 * productId
                 * productName
                 * unitPrice
                 * quantity
                 * subtotal
                 *
                 * Frontend additionally needs:
                 *
                 * id
                 * name
                 * price
                 * image
                 */

                const formattedItems =
                    backendItems.map(
                        (item) => {

                            /*
                             * Find the original product
                             * from frontend products list.
                             */

                            const product =
                                products.find(
                                    (product) =>
                                        product.id ===
                                        Number(
                                            item.productId
                                        )
                                );


                            return {

                                id:
                                    Number(
                                        item.productId
                                    ),

                                name:
                                    item.productName,

                                price:
                                    Number(
                                        item.unitPrice
                                    ),

                                quantity:
                                    Number(
                                        item.quantity
                                    ),

                                /*
                                 * Image comes from the
                                 * frontend product data.
                                 */

                                image:
                                    product?.image || "",

                                category:
                                    product?.category || "",

                                description:
                                    product?.description || "",

                            };

                        }
                    );


                console.log(
                    "FORMATTED CART ITEMS:",
                    formattedItems
                );


                setCartItems(
                    formattedItems
                );


                /*
                 * Save the correctly formatted
                 * cart locally.
                 */

                localStorage.setItem(
                    "cartItems",
                    JSON.stringify(
                        formattedItems
                    )
                );

            } else {

                setCartItems([]);

            }

        } catch (error) {

            console.error(
                "LOAD CART ERROR:",
                error
            );


            console.error(
                "Backend response:",
                error.response?.data
            );


            /*
             * Fallback to localStorage
             * if backend request fails.
             */

            const savedCart =
                localStorage.getItem(
                    "cartItems"
                );


            if (savedCart) {

                try {

                    setCartItems(
                        JSON.parse(
                            savedCart
                        )
                    );

                } catch (storageError) {

                    console.error(
                        "INVALID LOCAL CART:",
                        storageError
                    );

                    setCartItems([]);

                }

            } else {

                setCartItems([]);

            }

        } finally {

            setCartLoading(false);

        }
    };


    // ==========================================
    // LOAD CART WHEN APP STARTS
    // ==========================================

    useEffect(() => {

        loadCart();

    }, []);


    // ==========================================
    // SAVE CART TO LOCAL STORAGE
    // ==========================================

    useEffect(() => {

        if (cartItems.length > 0) {

            localStorage.setItem(
                "cartItems",
                JSON.stringify(
                    cartItems
                )
            );

        } else {

            localStorage.removeItem(
                "cartItems"
            );

        }

    }, [cartItems]);


    // ==========================================
    // ADD TO CART
    // ==========================================

    const addToCart = async (product) => {

        try {

            console.log(
                "===== ADDING PRODUCT TO CART ====="
            );

            console.log(
                "PRODUCT:",
                product
            );


            await axios.post(
                `${API_URL}/items`,
                null,
                {
                    ...getAuthConfig(),

                    params: {
                        productId:
                            product.id,

                        quantity: 1,
                    },
                }
            );


            setCartItems(
                (previousItems) => {

                    const existingItem =
                        previousItems.find(
                            (item) =>
                                item.id ===
                                product.id
                        );


                    if (existingItem) {

                        return previousItems.map(
                            (item) =>
                                item.id ===
                                product.id
                                    ? {
                                        ...item,

                                        quantity:
                                            item.quantity +
                                            1,
                                    }
                                    : item
                        );

                    }


                    return [
                        ...previousItems,

                        {
                            id:
                                product.id,

                            name:
                                product.name,

                            price:
                                Number(
                                    product.price
                                ),

                            quantity: 1,

                            image:
                                product.image,

                            category:
                                product.category,

                            description:
                                product.description,
                        },
                    ];

                }
            );


            console.log(
                "PRODUCT ADDED TO CART SUCCESSFULLY"
            );


            return true;

        } catch (error) {

            console.error(
                "ADD TO CART ERROR:",
                error
            );


            console.error(
                "BACKEND RESPONSE:",
                error.response?.data
            );


            alert(
                error.response?.data?.message ||
                "Failed to add product to cart"
            );


            return false;
        }
    };


    // ==========================================
    // INCREASE QUANTITY
    // ==========================================

    const increaseQuantity =
        async (productId) => {

            const item =
                cartItems.find(
                    (cartItem) =>
                        cartItem.id ===
                        productId
                );


            if (!item) {
                return;
            }


            const newQuantity =
                item.quantity + 1;


            try {

                await axios.put(
                    `${API_URL}/items/${productId}`,
                    null,
                    {
                        ...getAuthConfig(),

                        params: {
                            quantity:
                                newQuantity,
                        },
                    }
                );


                setCartItems(
                    (previousItems) =>
                        previousItems.map(
                            (cartItem) =>
                                cartItem.id ===
                                productId
                                    ? {
                                        ...cartItem,

                                        quantity:
                                            newQuantity,
                                    }
                                    : cartItem
                        )
                );

            } catch (error) {

                console.error(
                    "INCREASE QUANTITY ERROR:",
                    error
                );


                alert(
                    error.response?.data?.message ||
                    "Unable to increase quantity"
                );
            }
        };


    // ==========================================
    // DECREASE QUANTITY
    // ==========================================

    const decreaseQuantity =
        async (productId) => {

            const item =
                cartItems.find(
                    (cartItem) =>
                        cartItem.id ===
                        productId
                );


            if (!item) {
                return;
            }


            const newQuantity =
                item.quantity - 1;


            try {

                if (newQuantity <= 0) {

                    await axios.delete(
                        `${API_URL}/items/${productId}`,
                        getAuthConfig()
                    );


                    setCartItems(
                        (previousItems) =>
                            previousItems.filter(
                                (cartItem) =>
                                    cartItem.id !==
                                    productId
                            )
                    );


                    return;
                }


                await axios.put(
                    `${API_URL}/items/${productId}`,
                    null,
                    {
                        ...getAuthConfig(),

                        params: {
                            quantity:
                                newQuantity,
                        },
                    }
                );


                setCartItems(
                    (previousItems) =>
                        previousItems.map(
                            (cartItem) =>
                                cartItem.id ===
                                productId
                                    ? {
                                        ...cartItem,

                                        quantity:
                                            newQuantity,
                                    }
                                    : cartItem
                        )
                );

            } catch (error) {

                console.error(
                    "DECREASE QUANTITY ERROR:",
                    error
                );


                alert(
                    error.response?.data?.message ||
                    "Unable to decrease quantity"
                );
            }
        };


    // ==========================================
    // REMOVE FROM CART
    // ==========================================

    const removeFromCart =
        async (productId) => {

            try {

                await axios.delete(
                    `${API_URL}/items/${productId}`,
                    getAuthConfig()
                );


                setCartItems(
                    (previousItems) =>
                        previousItems.filter(
                            (item) =>
                                item.id !==
                                productId
                        )
                );

            } catch (error) {

                console.error(
                    "REMOVE FROM CART ERROR:",
                    error
                );


                alert(
                    error.response?.data?.message ||
                    "Unable to remove product"
                );
            }
        };


    // ==========================================
    // CLEAR CART
    // ==========================================

    const clearCart = async () => {

        try {

            await axios.delete(
                API_URL,
                getAuthConfig()
            );


            setCartItems([]);

            localStorage.removeItem(
                "cartItems"
            );


            console.log(
                "CART CLEARED SUCCESSFULLY"
            );

        } catch (error) {

            console.error(
                "CLEAR CART ERROR:",
                error
            );


            /*
             * Clear frontend even if the
             * backend cart is already empty.
             */

            setCartItems([]);

            localStorage.removeItem(
                "cartItems"
            );
        }
    };


    // ==========================================
    // TOTAL
    // ==========================================

    const total =
        cartItems.reduce(
            (sum, item) =>
                sum +
                Number(item.price) *
                Number(item.quantity),
            0
        );


    // ==========================================
    // PROVIDER
    // ==========================================

    return (
        <CartContext.Provider
            value={{
                cartItems,

                cartLoading,

                addToCart,

                increaseQuantity,

                decreaseQuantity,

                removeFromCart,

                clearCart,

                total,

                loadCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};


// ==========================================
// USE CART
// ==========================================

export const useCart = () => {

    const context =
        useContext(CartContext);


    if (!context) {

        throw new Error(
            "useCart must be used inside CartProvider"
        );

    }


    return context;
};