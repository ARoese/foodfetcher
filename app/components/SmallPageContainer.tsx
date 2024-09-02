function SmallPageContainer({children}) {
    return ( 
        <div className="bg-white p-6
            my-8
            mx-6
            rounded-2xl md:mx-24 md:my-8">
            {children}
        </div>
    );
}

export default SmallPageContainer;