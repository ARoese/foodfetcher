import { Ingredient, IngredientEntry } from "@prisma/client";
import { Ingredient as ParsedIngredient, parseIngredient, UnitOfMeasureDefinitions } from "parse-ingredient";

/** words that should never be interpreted to be units of measure */ 
const falseUOMs = [
    "tiny", "small", "medium", 
    "normal", "average", "large", 
    "big", "huge", "ginormous", 
    "humongous"
]

/** additional units of measure that should reasonably be included */
const additionalUOMs : UnitOfMeasureDefinitions = {
    "liter" : {
        alternates: ["l", "L", "Liter", "liter", "ltr", "Ltr"],
        plural: "liters",
        short: "l"
    }
}

export function tryParseIngredient(ingredientText : string) : {valid: boolean, parsed: ParsedIngredient}
{
    const parsed = parseIngredient(ingredientText, {
        ignoreUOMs: falseUOMs,
        additionalUOMs: additionalUOMs
    });
    return {
         valid: parsed.length == 1 && isParsedIngredientValid(parsed[0]),
         parsed: parsed[0]
    };
}

export function isParsedIngredientValid(ingredient : ParsedIngredient){
    return ["", "."].indexOf(ingredient.description.trim()) == -1 //non-empty description
        && ingredient.quantity !== null // must specify quantity
        && ingredient.quantity != 0.0 // quantity must be non-zero
        && !ingredient.isGroupHeader // isn't group header
        //&& !ParsedIngredientObj.
}

export function parsedIngredientToIngredientEntry(ingredient : ParsedIngredient, dbSource : IngredientEntry = null) : IngredientEntry {
    const generic = {
        amount: ingredient.quantity,
        amount2: ingredient.quantity2,
        ingredientName: ingredient.description,
        measureSymbol: ingredient.unitOfMeasure,
    };
    return (
        dbSource != null
        ? {...generic, id: dbSource.id, sortIndex: dbSource.sortIndex }
        : {...generic, id: null, sortIndex: null}
    );
}

export function toIngredientTextGroups(ingredient : IngredientEntry) : {amount : string, symbol : string, name : string, full : string} {
    const roundedAmount = Math.round(ingredient.amount*100)/100;
    const roundedAmount2 = ingredient.amount2 !== null ? Math.round(ingredient.amount2*100)/100 : null;
    const amountString = roundedAmount2 !== null ? `${roundedAmount}-${roundedAmount2}` : `${roundedAmount}`;
    const symbol = ingredient.measureSymbol === null ? "" : `${ingredient.measureSymbol}`;
    const name = ingredient.ingredientName;
    const full = symbol != "" ? `${amountString} ${symbol} ${name}` : `${amountString} ${name}`;
    return {amount: amountString, symbol, name, full};
}

export function ingredientsToText(ingredients : IngredientEntry[]){
    return ingredients.map((i) => toIngredientTextGroups(i).full).join("\n");
}