import React, { useState, createContext } from "react";

export const AppContext = createContext();

export const AppProvider = ({children})=>{
    // global state variables
    const domain = "http://localhost:4000";
    const ngrokHeader = {"ngrok-skip-browser-warning": true};

    const [razorpayKey, setRazorpayKey] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userDetails, setUserDetails] = useState({
        userName : "",
        password : "",
        email : ""
    });
    const [cartCount, setCartCount] = useState(0);
    const [shoppingList, setShoppingList] = useState([{}]);

    const [categories, setCategories] = useState([{CategoryName : "", CategoryID : ""}]);

    // To Control Rapid Clicking
    const [addCartLoad, setAddCartLoad] = useState(false);
    const [removeCartLoad, setRemoveCartLoad] = useState(false);
    const [favToggleLoad, setFavToggleLoad] = useState(false);
    const [buyLoad, setBuyLoad] = useState(false);

    const [message, setMessage] = useState("");
    const [showMessage, setShowMessage] = useState(false);

    const value = {
        domain,
        ngrokHeader,
        razorpayKey,
        setRazorpayKey,
        accessToken,
        setAccessToken,
        isLoggedIn,
        setIsLoggedIn,
        userDetails,
        setUserDetails,
        cartCount,
        setCartCount,
        shoppingList,
        setShoppingList,
        categories,
        setCategories,
        addCartLoad,
        setAddCartLoad,
        removeCartLoad,
        setRemoveCartLoad,
        favToggleLoad,
        setFavToggleLoad,
        buyLoad,
        setBuyLoad,
        message,
        setMessage,
        showMessage,
        setShowMessage
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}