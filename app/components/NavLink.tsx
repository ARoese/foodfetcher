"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import { signIn, signOut as signOutCall } from "next-auth/react";

type args = {
    children : React.ReactNode,
    href : string,
    className? : string,
    signOut? : boolean
    login? : boolean
}
export default function NavLink({children, href, className="", signOut=false, login=false} : args){
    const pathname = usePathname(); 
    const isActive = pathname === href;
    return (
        <Link 
            className={
                `no-underline content-center px-4 ${className} 
                transition-all duration-150
                ${isActive ? 'text-white bg-ffteal' : "text-black bg-white"} 
                hover:text-white hover:bg-ffteal hover:no-underline`}
            href={href}
            onClick={signOut ? () => signOutCall() : (login ? () => signIn() : null)}
        >
            {children}
        </Link>
    )
}