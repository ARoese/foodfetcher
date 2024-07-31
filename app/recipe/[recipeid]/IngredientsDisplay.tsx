function IngredientsDisplay({ingredients}) {
    return ( 
        <ul className="text-center">
            {
                ingredients.map(
                    (i) => <li key={i}> {`ingredient ${i}`} </li>
                )
            }
        </ul>
     );
}

export default IngredientsDisplay;