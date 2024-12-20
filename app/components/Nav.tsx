import Link from "next/link";
import logoDark from "@/public/images/logo-dark.png"
import Image from "next/image";
import { auth } from "@/auth";
import NavLink from "./NavLink";


export default async function Nav(){
    const session = await auth();
    const isLoggedIn = Boolean(session);
    const log = isLoggedIn ? "Logout" : "Login";

    return (
        <>
            <nav 
                className="flex flex-row 
                        h-20 text-center overflow-x-scroll bg-white px-2">
                <Link href="/" className="mr-auto max-sm:hidden">
                    <Image priority={true} src={logoDark} className="h-20 w-auto" alt="Food Fetcher Logo" />
                </Link>
                <NavLink href="/">Home</NavLink>
                <NavLink href="/browse">Browse Recipes</NavLink>
                {
                    isLoggedIn ? (
                        <>
                        <NavLink href="/recipe/create">Create Recipe</NavLink>
                        <NavLink href="/plans">Meal Plans</NavLink>
                        <div className="flex flex-col">
                            <NavLink className="h-3/6 whitespace-nowrap" href="/account">Hello, {session.user.name}</NavLink>
                            <NavLink className="h-3/6" signOut={true} href="">Sign out</NavLink>
                        </div>
                        </>
                    ) : (
                        <>  
                        <NavLink login={true} href="">Login</NavLink>
                        <NavLink href="/signup">Sign Up</NavLink>
                        </>
                    )
                }
            </nav>
        </>
    );
}