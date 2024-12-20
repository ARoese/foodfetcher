import SmallPageContainer from "../components/SmallPageContainer";
import { getAllAdmins, getCurrentUserOrLogin } from "@/lib/db/user";
import { redirect } from "next/navigation";
import AdminDisplay from "./AdminDisplay";

async function Account() {
    // get user who is logged in
    const currentUser = await getCurrentUserOrLogin();
    if(!currentUser.admin){
        redirect("/");
    }

    return ( 
        <SmallPageContainer>
            <AdminDisplay currentUser={currentUser}/>
        </SmallPageContainer>
     );
}

export default Account;