function SmallPageContainer({children}) {
    return ( 
        <div className="bg-global flex-1 px-24 py-8">
            <div className="bg-white rounded-2xl p-6">
                {children}
            </div>
        </div>
    );
}

export default SmallPageContainer;