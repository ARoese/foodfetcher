import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import Collapsible from "react-collapsible";
import ReactTextareaAutosize from "react-textarea-autosize";
import { ingredientsToText, isParsedIngredientValid, parsedIngredientToIngredientEntry } from "../../../lib/ingredientTools";
import { IngredientEntry } from "@prisma/client";
import { parseIngredient } from "parse-ingredient";

type args = {
    display : boolean,
    ingredients : IngredientEntry[],
    setIngredients : (ingredients : IngredientEntry[]) => void // updator function
};

function BulkIngredientEditor({display, ingredients, setIngredients} : args) {
    const [expanded, setExpanded] = useState(false);
    // this needs to be state so that the user doesn't have to fight the repopulation logic while
    // editing/adding potentially very ugly intermediate states
    const [bulkEditText, setBulkEditText] = useState(ingredientsToText(ingredients));
    const [prevIngredient, setPrevIngredients] = useState(ingredients);
    // if ingredient prop changes, regenerate the ingredient text from it
    if(ingredients != prevIngredient){ 
        setPrevIngredients(ingredients);
        setBulkEditText(ingredientsToText(ingredients));
    }

    // if it isn't being displayed, then stop there
    if(!display){
        return (<></>);
    }

    function updateBulk(){
        if(!window.confirm("Warning: this will overwrite all current ingredients. Continue?")){
            return;
        }
        const parsed = parseIngredient(bulkEditText)
            .filter(isParsedIngredientValid)
            .map((i) => parsedIngredientToIngredientEntry(i))
            .map((ie, i) => ({...ie, sortIndex: i})); // set sort indexes
        
        setIngredients(parsed);
    }

    // something for the user to click to expand/contract this component
    const bulkEditDropdownTrigger = (
        <div className="w-full bg-teal-700 text-white flex flex-row">
            <p className="w-full bg-teal-700 text-white mr-auto my-auto text-center">Bulk Ingredient Editing</p>
            <FontAwesomeIcon icon={expanded ? faCaretUp : faCaretDown} className="mr-1 my-auto"/>
        </div>
    );

    return ( 
        <Collapsible 
            trigger={bulkEditDropdownTrigger} 
            className="w-full"
            onOpening={() => setExpanded(true)}
            onClose={() => setExpanded(false)}
        >
            {
                expanded
                ? (
                    <div className="p-1">
                        <label>
                            Bulk ingredient import:
                            <ReactTextareaAutosize
                                minRows={4}
                                style={{width: "100%"}}
                                wrap="soft"
                                value={bulkEditText}
                                placeholder="Type any number of ingredients to be parsed"
                                onChange={(e) => setBulkEditText(e.target.value)}
                            />
                        </label>
                        <button type="submit" onClick={updateBulk}>Parse!</button>
                    </div>
                )
                : ""
            }
        </Collapsible>
    );
}

export default BulkIngredientEditor;