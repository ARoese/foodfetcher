"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation'

export default function NavLink({children, href} : {children : React.ReactNode, href : string}){
    const pathname = usePathname(); 
    const isActive = pathname === href;
    return (
        <Link 
            className={
                `no-underline content-center px-4
                transition-all duration-150
                ${isActive ? 'text-white bg-ffteal' : "text-black bg-white"} 
                hover:text-white hover:bg-ffteal hover:no-underline`}
            href={href}
        >
            {children}
        </Link>
    )
}