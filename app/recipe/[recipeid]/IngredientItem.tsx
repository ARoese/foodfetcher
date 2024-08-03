import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IngredientEntry } from "@prisma/client";
import { Ingredient as parsedIngredient, parseIngredient } from "parse-ingredient";
import { useState } from "react";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";

type args = {ingredient: IngredientEntry, beingEdited : boolean, setIngredient : (ing : IngredientEntry) => void};

function isValidParsedIngredients(parsedIngredients : parsedIngredient[]) : boolean{
    if(parsedIngredients.length != 1){
        return false;
    }

    const parsedIngredient = parsedIngredients[0];
    return ["", "."].indexOf(parsedIngredient.description) == -1 //non-empty description
        && Boolean(parsedIngredient.quantity) //non-null and non-zero
        && !parsedIngredient.isGroupHeader //isn't ghroup header
        //&& !ParsedIngredientObj.
}

function IngredientItem({ingredient, beingEdited, setIngredient} : args) {
    const roundedAmount = Math.round(ingredient.amount*100)/100;
    const symbol = ingredient.measureSymbol === null ? "" : ingredient.measureSymbol;
    const name = ingredient.ingredientName;
    const [dynIngredient, setIngredientText] = useState({
        valid: true,
        text: `${roundedAmount} ${symbol} ${name}`
    });
    const [hasFocus, setFocused] = useState(false);

    function onChange(e){
        const text = e.target.value;
        let parsedIngredients = parseIngredient(text);
        const valid = isValidParsedIngredients(parsedIngredients);

        setIngredientText({
            valid,
            text
        })

        if(valid){
            let parsedIngredient = parsedIngredients[0];
            console.log(parsedIngredient);
            setIngredient({
                ...ingredient,
                ingredientName: parsedIngredient.description,
                amount: parsedIngredient.quantity,
                measureSymbol: parsedIngredient.unitOfMeasure
            });
        }
    }
    return ( 
        <li className="flex flex-row box-border">
            {
                beingEdited
                ? (
                    <>
                    <input 
                        style={{width: "100%"}}
                        className={`m-1 ${dynIngredient.valid ? "" : "text-red-800"}`}
                        defaultValue={dynIngredient.text}
                        color={dynIngredient.valid ? "" : "red"}
                        onChange={onChange}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                    />
                    {
                        hasFocus
                        ? (
                            <>
                            <p className="text-blue-800 whitespace-nowrap mx-0.5 my-auto">{roundedAmount}</p>
                            <p className="text-amber-800 whitespace-nowrap mx-0.5 my-auto">{symbol}</p>
                            <p className="text-fuchsia-800 whitespace-nowrap mx-0.5 my-auto">{name}</p>
                            </>
                        )
                        : ""
                    }
                    
                    </>)
                : <p className={`mr-auto ${dynIngredient.valid ? "" : "text-red-800"}`}>{dynIngredient.text}</p>
            }
            {
                beingEdited
                ? (
                    <>
                    <button className="px-2 py-1" onClick={() => setIngredient(null)}>
                        <FontAwesomeIcon icon={faTrashCan}/>
                    </button>
                    </>
                ) : ""
            }
            
        </li>
     );
}

export default IngredientItem;