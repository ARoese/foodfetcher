import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/app/components/Nav";
import ToastContainerWrapper from "./ToastWrapper";
import Image from "next/image";
import backgroundImage from "@/public/images/background3.jpg";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Food Fetcher",
  description: "A recipe organization and meal planning tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative`}>
        {/* background image */}
        <Image 
          src={backgroundImage}
          alt="background image"
          className="fixed aspect-auto h-screen object-cover"
        />
        <main className="relative">
          <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css"/>
          <Nav/>
          {children}
        </main>
        <ToastContainerWrapper/>
      </body>
    </html>
  );
}
