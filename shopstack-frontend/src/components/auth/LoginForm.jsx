import { useState } from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    Link,
    TextField,
    Typography,
} from "@mui/material";

import {
    Link as RouterLink,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { loginUser } from "../../api/authService";
import { useAuth } from "../../context/AuthContext";


function LoginForm() {

    const navigate = useNavigate();
    const location = useLocation();

    const { login } = useAuth();


    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });


    const [loading, setLoading] = useState(false);


    // ==========================================
    // GET ORIGINAL PAGE
    // ==========================================

    const from =
    location.state?.from ||
    sessionStorage.getItem(
        "redirectAfterLogin"
    ) ||
    null;


    // ==========================================
    // HANDLE INPUT
    // ==========================================

    const handleChange = (event) => {

        const { name, value } =
            event.target;

        setLoginData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };


    // ==========================================
    // LOGIN
    // ==========================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        console.log(
            "LOGIN BUTTON CLICKED"
        );

        console.log(
            "Login data:",
            loginData
        );

        console.log(
            "Original requested page:",
            from
        );


        if (
            !loginData.email ||
            !loginData.password
        ) {

            alert(
                "Please enter email and password"
            );

            return;
        }


        try {

            setLoading(true);


            console.log(
                "Sending login request..."
            );


            const response =
                await loginUser(loginData);


            console.log(
                "Login API response:",
                response.data
            );


            if (!response.data.success) {

                alert(
                    response.data.message ||
                    "Login failed"
                );

                return;
            }


            const userData =
                response.data.data;


            console.log(
                "User data:",
                userData
            );


            // ==========================================
            // SAVE AUTHENTICATION
            // ==========================================

            login(userData);


            localStorage.setItem(
                "token",
                userData.token
            );

            localStorage.setItem(
                "role",
                userData.role
            );

            localStorage.setItem(
                "email",
                userData.email
            );


            console.log(
                "Token saved:",
                userData.token
            );

            console.log(
                "Role saved:",
                userData.role
            );

            console.log(
                "Email saved:",
                userData.email
            );


            alert(
                "Login Successful"
            );


            // ==========================================
            // REDIRECT
            // ==========================================

            /*
             * If the user originally tried to open
             * a protected page, return them there.
             *
             * Example:
             *
             * /admin/orders
             *      ↓
             * /login
             *      ↓
             * successful login
             *      ↓
             * /admin/orders
             */

            if (from) {

                sessionStorage.removeItem(
                "redirectAfterLogin"
                 );

                navigate(from, {
                     replace: true,
                    });

                    return;
            }


            // ==========================================
            // DEFAULT ROLE REDIRECT
            // ==========================================

            if (
                userData.role ===
                "ROLE_ADMIN"
            ) {

                navigate(
                    "/admin/dashboard",
                    {
                        replace: true,
                    }
                );

            } else if (
                userData.role ===
                "ROLE_VENDOR"
            ) {

                navigate(
                    "/vendor/dashboard",
                    {
                        replace: true,
                    }
                );

            } else {

                navigate(
                    "/products",
                    {
                        replace: true,
                    }
                );
            }


        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            if (error.response) {

                console.error(
                    "Status:",
                    error.response.status
                );

                console.error(
                    "Response:",
                    error.response.data
                );
            }


            alert(
                error.response?.data?.message ||
                "Login failed. Please check your email and password."
            );


        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // UI
    // ==========================================

    return (

        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f4f6f8",
            }}
        >

            <Card
                sx={{
                    width: 500,
                    maxWidth: "90%",
                    p: 4,
                    borderRadius: 3,
                    boxShadow: 6,
                }}
            >

                <CardContent>

                    <Typography
                        variant="h4"
                        align="center"
                        fontWeight="bold"
                        gutterBottom
                    >
                        ShopStack
                    </Typography>


                    <Typography
                        variant="body1"
                        align="center"
                        color="text.secondary"
                        mb={4}
                    >
                        Welcome Back
                    </Typography>


                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                    >

                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={
                                loginData.email
                            }
                            onChange={
                                handleChange
                            }
                            margin="normal"
                            required
                        />


                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={
                                loginData.password
                            }
                            onChange={
                                handleChange
                            }
                            margin="normal"
                            required
                        />


                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            sx={{
                                mt: 3,
                                height: 45,
                            }}
                        >
                            {loading
                                ? "Logging in..."
                                : "Login"}
                        </Button>

                    </Box>


                    <Typography
                        align="center"
                        mt={3}
                    >
                        Don't have an account?{" "}

                        <Link
                            component={RouterLink}
                            to="/register"
                        >
                            Register
                        </Link>

                    </Typography>

                </CardContent>

            </Card>

        </Box>
    );
}


export default LoginForm;