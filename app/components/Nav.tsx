import Link from "next/link";
import logoDark from "@/public/images/logo-dark.png"
import Image from "next/image";
import LogOutButton from "./LogOutButton";
import { auth } from "@/auth";
import LogInButton from "./LogInButton";

export default async function Nav(){
    const session = await auth();
    const isLoggedIn = Boolean(session);
    const log = isLoggedIn ? "Logout" : "Login";
    //console.log(session);
    return (
        <>
            <nav id="navbar">
                <div id = "header">
                    <Link href="/">
                        <div id = "logo">
                            <Image src={logoDark} width="0" height="0" alt="Food Fetcher Logo" />
                        </div>
                    </Link>
                    <div id = "nav">
                        <Link href="/">Home</Link>
                        <Link href="/browse">Browse Recipes</Link>
                        <Link href="/recipe/create">Create Recipe</Link>
                        <Link href="/plans">Meal Plans</Link>
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
                                <LogInButton/>
                                <Link id='/signup' href="signup">Sign Up</Link>
                            </>
                            )
                        }
                        
                    </div>
                </div>
            </nav>
        </>
    );
}