import Link from "next/link";
import logoDark from "@/public/images/logo-dark.png"
import Image from "next/image";
import LogOutButton from "./LogOutButton";
import { auth } from "@/auth";
import LogInButton from "./LogInButton";
import NavLink from "./NavLink";

export default async function Nav(){
    const session = await auth();
    const isLoggedIn = Boolean(session);
    const log = isLoggedIn ? "Logout" : "Login";
    //console.log(session);
    return (
        <>
            <nav className="flex flex-row h-full text-center overflow-x-scroll bg-white px-2">
                <Link href="/" className="mr-auto">
                    <Image priority={true} src={logoDark} className="h-20 w-auto" alt="Food Fetcher Logo" />
                </Link>
                <NavLink href="/">Home</NavLink>
                <NavLink href="/browse">Browse Recipes</NavLink>
                {
                    isLoggedIn &&
                    <>
                    <NavLink href="/recipe/create">Create Recipe</NavLink>
                    <NavLink href="/plans">Meal Plans</NavLink>
                    </>
                }
                {
                    isLoggedIn ? (
                    <>
                        <div id='logout'>
                            Hello, <Link href="/account">{session.user.name}</Link><br/>
                            <LogOutButton/><br/>
                        </div>
                    </>
                    ) : (
                    <>  
                        <NavLink href="api/auth/signin">Login</NavLink>
                        <NavLink href="signup">Sign Up</NavLink>
                    </>
                    )
                }
            </nav>
        </>
    );
}