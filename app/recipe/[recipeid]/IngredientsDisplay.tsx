import { IngredientEntry } from "@prisma/client";
import IngredientItem from "./IngredientItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

type args = {
    ingredients : IngredientEntry[], // ingredients to display/edit
    setIngredients : (ingredients : IngredientEntry[]) => void, // updator function
    beingEdited : boolean // whether the user is editing things
}
function IngredientsDisplay({ingredients, setIngredients, beingEdited} : args) {
    function addNewIngredient(){
        setIngredients([
            ...ingredients,
            {
                id: null,
                ingredientName: "new ingredient",
                measureSymbol: null,
                amount: 0,
                amount2: null,
                sortIndex: ingredients.length,
            }
        ]);
    };
    return ( 
        <>
        {
            ingredients.map( // map all ingredient entries to item components
                (ingredient, i) => { // get ingredient and its index
                    return <IngredientItem 
                        key={ingredient.sortIndex} 
                        beingEdited={beingEdited}
                        ingredient={{...ingredient, sortIndex: i}}
                        // each ingredientItem gets an updator function that will
                        // correctly and safely update the recipe state up here.
                        // all they have to do is call it with the new ingredientEntry
                        setIngredient={ 
                            // a new closure using the index above to specify what ingredient
                            // to modify that the caller doesn't need to know about
                            (newIngredient : IngredientEntry|null) : void => {
                                //console.log(`updating ${i}`);
                                //console.log(newIngredient);
                                setIngredients(
                                    newIngredient === null
                                    ? [...ingredients].toSpliced(i, 1)
                                    : ingredients.with(i, newIngredient)
                                );
                            }
                        }
                    />
                }
            )
        }
        { // Button to add a new ingredient
            beingEdited
            ? (
                <li>
                    <button className="w-full" onClick={addNewIngredient}>
                        <FontAwesomeIcon icon={faPlus}/>
                    </button>
                </li>
            ) : ""
        }
        </>
     )
}

export default IngredientsDisplay;