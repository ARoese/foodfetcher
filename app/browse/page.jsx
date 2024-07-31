import SmallPageContainer from "../components/SmallPageContainer";
import RecipeSearchForm from "./RecipeSearchForm";

export const metadata = {
    title: "Food Fetchers | Browse"
};

export default function BrowsePage(){
    return (
        <SmallPageContainer>
            <RecipeSearchForm />
        </SmallPageContainer>
    );
}