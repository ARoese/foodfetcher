"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IngredientEntry } from "@prisma/client";
import { useState } from "react";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { parsedIngredientToIngredientEntry, toIngredientTextGroups, tryParseIngredient } from "../../../lib/ingredientTools";
import { toBestUnit } from "@/lib/ingredientAggregations";


type args = {
    ingredient: IngredientEntry, 
    beingEdited : boolean, 
    preferredSystem : "imperial" | "metric", 
    setIngredient : (ing : IngredientEntry) => void
};

/**
    Draws a textbox that will be continuously coerced into a proper ingredientEntry
    so long as it can be. Whenever the textbox is updated, the component attempts to
    parse the text into an ingredient.
    
    If the ingredient isn't valid, it will be drawn in red and will not be updated until
    it becomes valid 
    
    If it can, then the parent will receive the new ingredient using the
    setIngredient function passed as a prop.

    @param ingredient The ingredient being displayed/edited
    @param beingEdited Whether this entry should allow edits or merely display
    @param setIngredient Function that should be called to change the ingredient
*/
function IngredientItem({ingredient, beingEdited, preferredSystem, setIngredient} : args) {
    // make it into text groups. Symbol may be empty
    const {amount, symbol, name, full: ingredientText} = toIngredientTextGroups(ingredient);
    // convert it to preferred units for non-editing display text
    const {full: bestIngredientText} = toIngredientTextGroups(toBestUnit(ingredient, preferredSystem));

    // default text state to go to when state is invalid (not initialized or prop change)
    const defaultDynIngredientState = {
        valid: tryParseIngredient(ingredientText).valid,
        text: ingredientText
    };
    
    // contains the current text and whether or not that text is valid
    const [dynIngredient, setDynIngredient] = useState(defaultDynIngredientState);
    // whether the user has focus on the textbox
    const [hasFocus, setFocused] = useState(false);
    // previous ingredient passed in as a prop, for detecting prop changes
    const [prevIngredient, setPrevIngredient] = useState(ingredient);
    // if ingredient prop changes, regenerate the ingredient text from it
    if(ingredient != prevIngredient){ 
        setPrevIngredient(ingredient);
        setDynIngredient(defaultDynIngredientState);
    }

    
    /**
     * whenever the user changes the contents of the ingredient text
     * re-parse the text, and try to coerce it into a proper ingredient
     * if it can be coerced, then update the parent with that coerced
     * ingredientEntry using the set function
     * */
    function onChange(e){
        const text = e.target.value;
        let {valid, parsed} = tryParseIngredient(text);

        if(valid){

            setIngredient(parsedIngredientToIngredientEntry(parsed, ingredient));
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
                    {/* 
                        if we use a managed value when focused, then the
                        user has to fight the reformated update after each input
                        only difference between these is defaultValue vs value
                        A focused element only uses defaultValue and will not
                        update the user's input.)
                    */}
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
                        // When focused, display how the ingredient is being interpreted.
                        hasFocus
                        ? (
                            <>
                            <p className="text-blue-800 max-lg:hidden whitespace-nowrap mx-0.5 my-auto">{amount}</p>
                            <p className="text-amber-800 max-lg:hidden whitespace-nowrap mx-0.5 my-auto">{symbol}</p>
                            <p className="text-fuchsia-800 max-lg:hidden whitespace-nowrap mx-0.5 my-auto">{name}</p>
                            </>
                        )
                        : ""
                    }

                    <button className="px-2 py-1" onClick={() => setIngredient(null)}>
                        <FontAwesomeIcon icon={faTrashCan}/>
                    </button>
                    
                    </>
                ) : <p className={`mr-auto ${dynIngredient.valid ? "" : "text-red-800"}`}>{bestIngredientText}</p>
            }
        </li>
     );
}

export default IngredientItem;