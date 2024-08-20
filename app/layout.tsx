import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/app/components/Nav";
import ToastContainerWrapper from "./ToastWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Food Fetcher",
  description: "A recipe organization and meal planning tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      
      <body className={inter.className}>
        <main className="min-h-screen flex flex-col">
          <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css"/>
          <Nav />
          {children}
          
        </main>
        <ToastContainerWrapper/>
      </body>
    </html>
  );
}
