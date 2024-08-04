"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IngredientEntry } from "@prisma/client";
import { Ingredient as parsedIngredient, parseIngredient } from "parse-ingredient";
import { useEffect, useState } from "react";
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

    const ingredTextState = {
        valid: true,
        text: `${roundedAmount} ${symbol} ${name}`
    };
    
    const [dynIngredient, setDynIngredient] = useState(ingredTextState);
    const [prevIngredient, setPrevIngredient] = useState(ingredient);
    // if ingredient prop changes, force the ingredient text
    // to match it
    if(ingredient != prevIngredient){ 
        setPrevIngredient(ingredient);
        setDynIngredient(ingredTextState);
    }
    

    // This useEffect is needed to force the ingredientText
    // to update whenever a new ingredientProp is passed in.
    // Reach will persist the state even if the ingredient prop changes.
    useEffect(() => setDynIngredient({
        valid: true,
        text: `${roundedAmount} ${symbol} ${name}`
    }), [roundedAmount, symbol, name]);

    const [hasFocus, setFocused] = useState(false);

    function onChange(e){
        const text = e.target.value;
        let parsedIngredients = parseIngredient(text);
        const valid = isValidParsedIngredients(parsedIngredients);

        if(valid){
            let parsedIngredient = parsedIngredients[0];
            console.log(parsedIngredient);
            setIngredient({
                ...ingredient,
                ingredientName: parsedIngredient.description,
                amount: parsedIngredient.quantity,
                measureSymbol: parsedIngredient.unitOfMeasure
            });
        }else{
            setDynIngredient({
                valid,
                text
            });
        }
    }

    return ( 
        <li className="flex flex-row box-border">
            {
                beingEdited
                ? (
                    <>
                    {/* if we use a managed value when focused, then the
                    // user has to fight the reformated update after each input
                    // only difference between these is defaultValue vs value
                    // A focused element only uses defaultValue and will not
                    // update the user's input.)*/}
                    <input 
                        style={{width: "100%"}}
                        className={`m-1 ${dynIngredient.valid ? "" : "text-red-800"}`}
                        defaultValue={hasFocus ? dynIngredient.text : null}
                        value={!hasFocus ? dynIngredient.text : null}
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

                    <button className="px-2 py-1" onClick={() => setIngredient(null)}>
                        <FontAwesomeIcon icon={faTrashCan}/>
                    </button>
                    
                    </>
                ) : <p className={`mr-auto ${dynIngredient.valid ? "" : "text-red-800"}`}>{dynIngredient.text}</p>
            }
        </li>
     );
}

export default IngredientItem;