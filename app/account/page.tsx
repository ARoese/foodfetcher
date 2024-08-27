import wrappedAction from "@/lib/wrappedAction";
import SmallPageContainer from "../components/SmallPageContainer";
import AccountView from "./AccountView";
import { getCurrentUserOrLogin } from "@/lib/db/user";

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