"use client"

import { useNotification } from "@context/NotificationContext";
import { Box, Button, CircularProgress, Container, Paper, TextField, Typography } from "@mui/material";
import { isAuthenticated } from "@utils/auth-helper-methods";
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const { showNotification } = useNotification()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (isAuthenticated()) {
            router.push("/dashboard")
        }
    }, [router])

    const handleLogin = async () => {
        setLoading(true);


        if (email === "" || password === "") {
            showNotification("All fields are required", "error");
            setLoading(false)
            return;
        }

        const res = await fetch("/api/auth/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            showNotification("Login successfull", "success");
            setTimeout(() => router.push("/dashboard"), 1500);
        } else {
            showNotification("Invalid Credentials", "error");
            setLoading(false);
            setEmail("");
            setPassword("");
        }
    }

    return (
        <Container
            maxWidth="xs"
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}
        >
            <Paper elevation={3} sx={{ padding: 4, borderRadius: 3, width: "100%" }}>
                <Typography variant="h5" textAlign="center" fontWeight="bold" mb={2}>
                    Biltmore Care Homes
                </Typography>
                <Typography variant="h6" textAlign="center">
                    Admin Dashboard
                </Typography>

                <Box component="form" noValidate autoComplete="off">
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                            <CircularProgress size={28} />
                        </Box>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mt: 1, py: 1, fontSize: "1rem" }}
                            onClick={handleLogin}
                        >
                            Login
                        </Button>
                    )}
                </Box>
            </Paper>
        </Container>
    )
}