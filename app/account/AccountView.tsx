"use client";

import { User } from "@prisma/client";
import { useState } from "react";
import { SafeUser, updateUser } from "../../lib/db/user";
import { toast } from "react-toastify";
import wrappedAction from "@/lib/wrappedAction";



function AccountView({account} : {account : SafeUser}) {
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [userName, setUserName] = useState(account.name);
    const [preferredSystem, setPreferredSystem] = useState(account.preferredMeasureSystem);


    async function doSave(e){
        if(!confirm("Are you sure you want to update your profile?")){
            return;
        }


        const formProps = Object.fromEntries(e);

        const newUser = userName;
        const currentPass = formProps.currentPass;
        const newPass = formProps.newPass;

        if(!newUser.trim()){
            toast.error("new username cannot be empty");
            return;
        }

        const updatePromise = wrappedAction(updateUser(account.id, newUser, preferredSystem, currentPass, newPass));
        try{
            await toast.promise(updatePromise, {
                pending: "Updating your account information...",
                error: {
                    render({data} : {data: Error}){

                        return data.message;
                    }
                },
                success: "Successfully updated profile"
            }).then(() => {
                toast.info(
                    "If you updated your username, then the change will only take effect on the nav bar when you next log in.",
                    {
                        autoClose: 10000
                    }
                );
                setEditing(false);
            });
        }catch{}
    }

    
    return ( 
        <>
        {
            !editing
            ?   <button onClick={() => setEditing(true)}>{editing ? "Save" : "Edit"}</button>
            : ""
        }
        <h1>Account</h1>
        {
            editing
            ? (
                <form action={doSave} className="flex flex-col w-3/5">
                    
                        <label>
                            username:
                            <input className="ml-2" name="newUser" value={userName} onChange={(e) => setUserName(e.target.value)}/>
                        </label>
                        <label>
                            preferred measure system:
                            <select 
                                className="ml-2"
                                value={preferredSystem} 
                                onChange={(e) => setPreferredSystem(e.target.value)}
                            >
                                <option value="imperial">imperial</option>
                                <option value="metric">metric</option>
                            </select>
                        </label>
                        <label>
                            current password:
                            <input className="ml-2" name="currentPass" required={true} type="password"/>
                        </label>
                        <label>
                            change password?
                            <input className="ml-2" type="checkbox" defaultValue="false" onChange={() => setChangingPassword(!changingPassword)}/>
                        </label>
                        {
                            changingPassword
                            ? (
                                <>
                                <label>
                                    new password:
                                    <input className="ml-2" name="newPass" required={true} type="password"/>
                                </label>
                                </>
                            ) : ""
                        }
                        <button type="submit" className="mt-4">Save</button>
                    
                    
                </form>
            ) : (
                <>
                <p>username: {userName}</p>
                <p>preferred measure system: {preferredSystem}</p>
                </>
            )
        }
        
        
        </>
        
     );
}

export default AccountView;