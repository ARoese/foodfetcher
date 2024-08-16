"use client";

import { useDraggable } from "@dnd-kit/core";
import RecipeSmallItem from "../browse/RecipeSmallItem";
import { Recipe } from "@prisma/client";

function DraggableSmallRecipe({recipe} : {recipe : Recipe}) {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: recipe.id,
        data: recipe,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

      // TODO: modify RecipeSmallItem to have a more compatible display here
    return ( 
        <div ref={setNodeRef} {...listeners} {...attributes} key={recipe.id}>
            <RecipeSmallItem className="max-w-40 min-w-40 mx-2" recipe={recipe}/>
        </div>
     );
}

export default DraggableSmallRecipe;