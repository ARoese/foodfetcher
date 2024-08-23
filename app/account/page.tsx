import SmallPageContainer from "../components/SmallPageContainer";
import { signIn } from "next-auth/react";
import AccountView from "./AccountView";
import { getCurrentUser, getCurrentUserOrLogin } from "@/lib/db/user";

async function Account() {
    // get user who is logged in
    const currentUser = await getCurrentUserOrLogin();

    return ( 
        <SmallPageContainer>
            <AccountView account={currentUser}/>
        </SmallPageContainer>
     );
}

export default Account;