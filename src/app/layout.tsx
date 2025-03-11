"use client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@styles/theme";
import { NotificationProvider } from "@context/NotificationContext";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <NotificationProvider>
            <CssBaseline />
            {children}
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
