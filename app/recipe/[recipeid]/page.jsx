import SmallPageContainer from "@/app/components/SmallPageContainer";

function RecipeDisplayPage({params}) {
    const id = params.recipeid;
    return ( 
        <SmallPageContainer>
            <h2>
                Display page for recipe #{id}
            </h2>
        </SmallPageContainer>
     );
}

export default RecipeDisplayPage;