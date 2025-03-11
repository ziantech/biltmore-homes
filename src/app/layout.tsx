"use client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@styles/theme";
import { NotificationProvider } from "@context/NotificationContext";
import Head from "next/head";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        {/* ✅ General SEO Meta Tags */}
        <title>Biltmore Care Homes | Assisted Living & Quality Care</title>
        <meta name="description" content="Biltmore Care Homes offers premier assisted living facilities with personalized care, daily activities, and top-quality services for residents." />
        <meta name="keywords" content="assisted living, elderly care, senior living, home care, senior care, BiltmoreCareHome, retirement community" />
        <meta name="author" content="Biltmore Care Homes" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />

        {/* ✅ Open Graph (Facebook, Messenger, WhatsApp, iMessage) */}
        <meta property="og:title" content="Biltmore Care Homes - Assisted Living & Quality Care" />
        <meta property="og:description" content="Discover premium assisted living services and exceptional senior care at BiltmoreCareHome." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.biltmorecare.com/" />
        <meta property="og:image" content="https://www.biltmorecare.com/banner.png" />
        <meta property="og:image:alt" content="Biltmore Care Homes - Quality Senior Care" />
        <meta property="og:site_name" content="Biltmore Care Homes" />
        <meta property="og:locale" content="en_US" />

        {/* ✅ WhatsApp (uses Open Graph) */}

        {/* ✅ iMessage (Apple uses Open Graph too) */}

        {/* ✅ Favicon & Theme Color */}
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#B8860B" />

        {/* ✅ Structured Data for Google Search */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Biltmore Care Homes",
            "url": "https://www.biltmorecare.com/",
            "logo": "https://www.biltmorecare.com/banner.png",
            "description": "Biltmore Care Homes provides high-quality assisted living services, offering a warm and nurturing environment for seniors.",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "3532 E Camelback Rd",
              "addressLocality": "Phoenix",
              "addressRegion": "Arizona",
              "postalCode": "85018",
              "addressCountry": "US"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+1-480-249-6143",
              "contactType": "Customer Service"
            }
          })}
        </script>
      </Head>
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
