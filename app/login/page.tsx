import {signIn, auth} from "@/auth";

export const metadata = {
    title: "Food Fetchers | Log In"
};

export default async function SignIn(){
    const emailPlaceholder = "example@email.com";
    const emailInitial = "";
    const passwordPlaceholder = "password123";
    const passwordInitial = "";

    async function doLogin(formData) {
        "use server";

        await signIn("credentials", formData);
    };

    //const session = await auth();


    return (
        <div id = "Content" style={{width: "320px"}}>
            <h1> Log In </h1>
			<form name = "login" action={doLogin}>
				<table style={{width: "100%"}}>
                    <tbody>
                        <tr>
                            <td style={{display: "flex"}}>
                                <label htmlFor="email" style={{flex: "0", whiteSpace: "pre", paddingTop: "4px"}}>E-Mail Address: </label>
                                <input type = "email" name = "email" id = "email" style={{flex: "1"}} required />
                            </td>
                        </tr>
                        <tr>
                            <td style={{display: "flex"}}>
                                <label htmlFor="password" style={{flex: "0", whiteSpace: "pre", paddingTop: "4px"}}>Password: </label>
                                <input type = "password" name = "password" id = "password" style={{flex: "1"}} required />
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <input type="submit" value = "Log In" />
                            </td>
                        </tr>
                    </tbody>
                </table>
			</form>
            {/*
            <?php
                if($outcome == 'success'){
                    echo '<p>Welcome back ' . $_SESSION["username"] . '!<br>Redirecting you to <a href="home.php">Home</a>.</p>';
				}
				else{
					if($db === false){
						echo "Error: Could not connect to user database.";
					}
					else{
						echo $outcome;
					}
				}
			?>
            */}
		</div>
    );
}