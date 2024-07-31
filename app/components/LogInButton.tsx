"use client";
import { signIn } from "next-auth/react";

export default function LogInButton(){

    async function doLogin(){
        await signIn();
    }

    return (
        <button onClick={doLogin}>Login</button>
    );
}