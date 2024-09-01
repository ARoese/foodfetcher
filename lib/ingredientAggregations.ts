import { FullPlan } from "@/lib/db/plans";
import configureMeasurements from "convert-units"
import allMeasures from "convert-units/definitions/all"
const convert = configureMeasurements(allMeasures);
import type { IngredientEntry } from "@prisma/client";
type FullDay = FullPlan["days"][number];
type FullQuantRecipe = FullDay["quantRecipes"][number];

// https://stackoverflow.com/a/42299191
const partition = <T,>(
    array: T[],
    callback: (element: T, index: number, array: T[]) => boolean
  ) : [T[], T[]] => {
    return array.reduce(function(result, element, i) {
      callback(element, i, array)
        ? result[0].push(element) 
        : result[1].push(element);
  
      return result;
    }, [[],[]]);
  };

// some units in convert-units are picky and need to be converted.
function fixUnit(unit : string|null) : string|null {
    if(unit == null){
        return null;
    }

    unit = unit.toLowerCase();

    if(unit == "tbs" || unit == "tbsp" || unit == "tbsps")
        return "Tbs";
    else if(unit == "floz")
        return "fl-oz";
    return unit;
}

function isconvertible(measure : string) : boolean{
    try{
        // very naughty; plurals make this hard, so we just throw it in
        // and see if the library will accept it
        // @ts-ignore
        convert().describe(measure);
        return true; // no throw means we're good
    }catch{
        return false;
    }
}

//** Requires that the conversion is valid  */
export function convertIngredientTo(ingredient : IngredientEntry, unit : string) : IngredientEntry{
    const ingredientCopy = {...ingredient};
    const fixedSymbol = fixUnit(ingredient.measureSymbol);
    
    ingredientCopy.amount = convert(ingredient.amount)
        // @ts-ignore
        .from(fixedSymbol)
        // @ts-ignore
        .to(unit);
    if(ingredient.amount2 !== null){
        ingredientCopy.amount2 = convert(ingredient.amount2)
            // @ts-ignore
            .from(fixedSymbol)
            // @ts-ignore
            .to(unit);
    }

    ingredientCopy.measureSymbol = unit;

    return ingredientCopy;
}

function combineIngredients(ingredient1 : IngredientEntry, ingredient2 : IngredientEntry) : IngredientEntry{
    const newIngredient = {
        ...ingredient1,
        amount: ingredient1.amount + ingredient2.amount,
        amount2: ingredient1.amount2 === null 
            ? null 
            : ingredient1.amount2 + ingredient2.amount2
    };

    return newIngredient;
}

//** Aggregate ingredients whose units are compatible with convert-units */
function aggregateConvertible(ingredients : IngredientEntry[]) : IngredientEntry[] {
    // group by set of possible destination conversions
    // this separates ingredients by volume vs length vs mass, etc
    const measureGroups = Object.groupBy(ingredients, 
        // @ts-ignore We know this is going to be a valid conversion
        (ingredient) => convert().describe(ingredient.measureSymbol).measure
    );

    return Object.entries(measureGroups).map(
        ([_, ingredients]) => ingredients.slice(1).map(
                (ingredient) => convertIngredientTo(ingredient, ingredients[0].measureSymbol)
            ).reduce(combineIngredients, ingredients[0])
    );
}

//** Aggregate ingredients whose units are not compatible with convert-units */
function aggregateUnconvertible(ingredients : IngredientEntry[]) : IngredientEntry[] {
    const measureGroups = Object.groupBy(ingredients,
        (ingredient) => ingredient.measureSymbol ?? "null"
    );

    return Object.entries(measureGroups).map(
        ([_, ingredients]) => ingredients.slice(1).reduce(combineIngredients, ingredients[0])
    );
}

function aggregateIngredients(ingredients : IngredientEntry[]) : IngredientEntry[]{
    // fix any weird units
    ingredients = ingredients.map(
        (ingredient) => ({...ingredient, measureSymbol: fixUnit(ingredient.measureSymbol)})
    );
    
    // group by name
    const groups = Object.groupBy(ingredients, (ingredient) => ingredient.ingredientName.toLowerCase());
    return Object.entries(groups).flatMap(
        ([_, ingredients]) => {
            // partition into arrays that can and cannot be used with the convert-units library
            const [convertible, unconvertible] = partition(ingredients, (ingredient) => isconvertible(ingredient.measureSymbol));
            return aggregateConvertible(convertible).concat(
                aggregateUnconvertible(unconvertible)
            );
        }
    );
}

function applyQuantity({quantity, recipe} : FullQuantRecipe) : IngredientEntry[]{
    return recipe.ingredients.map(
        (ingredient) => {
            ingredient.amount*=quantity;
            
            if(ingredient.amount2 !== null){
                ingredient.amount2 *= quantity;
            }
            return ingredient;
        }
    );
}

export function aggregateDays(days : FullDay[]) : IngredientEntry[]{
    return aggregateIngredients(
        days.flatMap(
            (day) => day.quantRecipes.flatMap(applyQuantity)
        )
    );
}

// TODO: make this user-configurable
const undesirableUnits = [
    "in3",
    "msk",
    "tsk",
    "kkp",
    "glas",
    "mm3",
    "cm3",
    "cl",
    "dl",
    "kanna",
    "st"
]

export function toBestUnit(ingredient : IngredientEntry, system : "imperial" | "metric" = "imperial"){

    const fixedSymbol = fixUnit(ingredient.measureSymbol);
    if(!isconvertible(fixedSymbol)){

        return ingredient;
    }
    
    const bestUnit = convert(ingredient.amount)
        // @ts-ignore
        .from(fixedSymbol)
        .toBest({
            // @ts-ignore
            exclude: undesirableUnits,
            system: system
        });

    if(bestUnit === null){
        return ingredient;
    }
    return convertIngredientTo(ingredient, bestUnit.unit);
}