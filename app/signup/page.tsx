"use client";

import { toast } from "react-toastify";
import SmallPageContainer from "../components/SmallPageContainer";
import { createUser } from "@/lib/db/user";
import { useRouter } from "next/navigation";
import wrappedAction from "@/lib/wrappedAction";
function Signup() {
    const router = useRouter();
    async function submitAction(data : FormData) {
        const [username, password, passwordConfirm] = 
            [data.get("username"), data.get("password"), data.get("passwordconfirm")].map((e) => e.toString());
        
        if(password.trim() == ""){
            toast.error("Password must not be empty");
            return;
        }

        // TODO: stricter password checks

        if(password != passwordConfirm){
            toast.error("Passwords must match");
            return;
        }

        const createUserPromise = wrappedAction(createUser(username, password));
        try{
            await toast.promise(createUserPromise, {
                pending: "Creating user",
                success: "User created",
                error: {
                    render({data} : {data: Error}){
                        console.log(data);
                        return data.message;
                    }
                },
            }).then(() => router.push("/api/auth/signin"));
        }catch{}
    }
    return ( 
        <SmallPageContainer>
            {/* @ts-ignore this type is correct */} 
            <form action={submitAction} className="flex flex-col">
                <label>
                    Username: 
                    <input name="username" type="text" required/>
                </label>
                <label>
                    Password: 
                    <input name="password" type="password" required/>
                </label>
                <label>
                    re-enter password: 
                    <input name="passwordconfirm" type="password" required/>
                </label>
                <button type="submit">Sign up</button>
            </form>
        </SmallPageContainer>
     );
}

export default Signup;