function SmallPageContainer({children}) {
    return ( 
        <div className="bg-global min-h-screen px-24 py-16">
            <div className="bg-white rounded-2xl py-6 p-6">
                {children}
            </div>
        </div>
    );
}

export default SmallPageContainer;