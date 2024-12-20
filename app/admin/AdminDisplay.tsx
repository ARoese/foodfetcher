"use client";
import { SafeUser, deleteUser, getAllAdmins, getUsersLikeName, setAdminStatus } from "@/lib/db/user";
import { useEffect, useMemo, useState } from "react";
// TODO: migrate to material-ui autocomplete select element, 
// since we just introduced MUI as a dep here for switches
import AsyncSelect from "react-select/async";
import { toast } from "react-toastify";
import wrappedAction from "@/lib/wrappedAction";
import { Button, FormControlLabel, FormGroup, Switch } from "@mui/material";
import { setTimeout } from "timers/promises";

const DELETE_CONFIRM_MESSAGE = 
`Are you really sure you want to delete this user? \
This will also delete all their recipes, meal plans, \
and other content!`;

const SELF_MODIFY_CONFIRM_MESSAGE = 
`You are about to modify your own account! Are you absolutely sure?`;

type UserOption = {
    value: SafeUser,
    label: string
};
function AdminDisplay({currentUser} : {currentUser : SafeUser}) {
    const [selectedUser, selectUser] = useState(null as UserOption);
    const [admins, setAdmins] = useState([] as SafeUser[]);
    const [usersCacheTicker, setUsersCacheTicker] = useState(1);
    const isSelfSelected = selectedUser?.value.id == currentUser.id;
    
    
    useEffect(() => {
        getAllAdmins().then(
            admins => setAdmins(admins),
            reason => toast.error(`Failed to get list of admins. Reason: ${reason}`)
        )
    }, [selectedUser?.value.admin]);

    function getFilteredUsers(name : string){
        const filtered = getUsersLikeName(name, 20); // just return a list of 10
        return filtered.then(
            (res) => res.map((user) => ({value: user, label: user.name} as UserOption)),
            (err) => {
                toast.error(`Failed to get user list. Reason: ${err.message}`); 
                return null;
            }
        );
    }

    function confirmSelfMutation() : boolean{
        if(isSelfSelected){
            if(!window.confirm(SELF_MODIFY_CONFIRM_MESSAGE)){
                return false;
            }
        }
        return true;
    }

    async function setAdminState(newState : boolean) : Promise<void> {
        if(!confirmSelfMutation())
            return;

        try{
            await wrappedAction(setAdminStatus(selectedUser.value.id, newState));
            selectUser({...selectedUser, value: {...selectedUser.value, admin: newState}});
        }catch(e){
            toast.error(e.message);
        }
    }

    async function doDeleteUser() : Promise<void> {
        if(!window.confirm(DELETE_CONFIRM_MESSAGE)){
            return;
        }

        if(!confirmSelfMutation())
            return;

        try{
            await wrappedAction(deleteUser(selectedUser.value.id));
            selectUser(null);
            setUsersCacheTicker(usersCacheTicker+1);
        }catch(e){
            toast.error(e.message);
        }
    }

    return ( 
        <>
        <h2>Current Admins:</h2>
        <UsersList users={admins}/>
        <h2>Select a user to modify</h2>
        <AsyncSelect
            loadOptions={getFilteredUsers}
            // the use of key here ensures that the AsyncSelect component can be
            // thrown out and re-generated whenever a user is deleted. Otherwise, that
            // component will continue serving now-invalidated users as options.
            key={usersCacheTicker}
            defaultOptions={true}
            value={selectedUser}
            onChange={(newValue : UserOption) => selectUser(newValue)}
            placeholder="Type a username..."
            />
        {
            selectedUser &&
            <>
            <h2>Selected User:</h2>
            <UserOptions 
                user={selectedUser.value}
                onAdminStatusChanged={(newState) => setAdminState(newState)}
                onDeletePressed={doDeleteUser}
                />
            </>
            
        }
        </>
     );
}

export default AdminDisplay;



function UsersList({users} : {users : SafeUser[]}){
    return (
        <ul>
            {
                users.map((user) =>
                    <li key={user.id}>{user.name}</li>
                )
            }
        </ul>
    )
}

type UserOptionsArgs = {
    user: SafeUser,
    onAdminStatusChanged : (bool) => void,
    onDeletePressed : () => void,
};
function UserOptions({user, onAdminStatusChanged, onDeletePressed} : UserOptionsArgs) {
    return ( 
        <div>
            <p>id: {user.id}</p>
            <p>name: {user.name}</p>
            <FormGroup>
                <FormControlLabel 
                    label="is admin"
                    control={
                        <Switch checked={user.admin} onChange={(e, newState) => onAdminStatusChanged(newState)}/>
                    } 
                    />
                <Button variant="outlined" color="error" onClick={onDeletePressed}>Delete User</Button>
            </FormGroup>
        </div>
    );
}