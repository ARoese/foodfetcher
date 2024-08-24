"use client";

import { User } from "@prisma/client";
import { useState } from "react";
import { SafeUser, updateUser } from "../../lib/db/user";
import { toast } from "react-toastify";



function AccountView({account} : {account : SafeUser}) {
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [userName, setUserName] = useState(account.name);
    const [preferredSystem, setPreferredSystem] = useState(account.preferredMeasureSystem);
    console.log(preferredSystem);

    async function doSave(e){
        if(!confirm("Are you sure you want to update your profile?")){
            return;
        }

        //console.log(e);
        const formProps = Object.fromEntries(e);
        //console.log(formProps);
        const newUser = userName;
        const currentPass = formProps.currentPass;
        const newPass = formProps.newPass;

        if(!newUser.trim()){
            toast.error("new username cannot be empty");
            return;
        }

        const updatePromise = updateUser(account.id, newUser, preferredSystem, currentPass, newPass);
        try{
            await toast.promise(updatePromise, {
                pending: "Updating your account information...",
                error: {
                    render({data} : {data: Error}){
                        //console.log(data);
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
                <form action={doSave} className="flex flex-row w-1/3">
                    <div className="flex flex-col mx-auto w-1/2">
                        <label className="mb-4">
                            username:<br/>
                            <input name="newUser" value={userName} onChange={(e) => setUserName(e.target.value)}/>
                        </label><br/>
                        <label>
                            preferred measure system:<br/>
                            <select 
                                value={preferredSystem} 
                                onChange={(e) => setPreferredSystem(e.target.value)}
                            >
                                <option value="imperial">imperial</option>
                                <option value="metric">metric</option>
                            </select>
                        </label>
                        <label>
                            current password:<br/>
                            <input name="currentPass" required={true} type="password"/>
                        </label><br/>
                        {
                            changingPassword
                            ? (
                                <><label>
                                    new password:<br/>
                                    <input name="newPass" required={true} type="password"/>
                                </label><br/>
                                </>
                            ) : ""
                        }
                        <button type="submit">Save</button>
                    </div>
                    <div>
                        <label className="mb-4">
                            change password?<br/>
                            <input type="checkbox" defaultValue="false" onChange={() => setChangingPassword(!changingPassword)}/>
                        </label><br/>
                    </div>
                    
                </form>
            ) : (
                <>
                <p>username:</p><p>{userName}</p>
                <p>preferred measure system: {preferredSystem}</p>
                </>
            )
        }
        
        
        </>
        
     );
}

export default AccountView;