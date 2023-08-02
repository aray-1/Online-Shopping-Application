import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "./AppContext";

export function useLoadItems(categoryID, pageNumber, limit){

    const { domain, accessToken, isLoggedIn, ngrokHeader } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [categoryItems, setCategoryItems] = useState([]);
    const [hasMore, setHasMore] = useState(true);

    useEffect(()=>{
        setCategoryItems([]);
    },[categoryID])

    useEffect(()=>{
        setLoading(true);
        setError(false);

        const requestBody = {
            "categoryID" : categoryID,
            "page" : pageNumber,
            "limit" : limit
        }

        const authHeader = {
            "Authorization" : `Bearer ${accessToken}`
        }

        if(isLoggedIn){
            axios.post(`${domain}/item/by-category`, requestBody, {headers : {...authHeader, ...ngrokHeader}})
            .then((response)=>{
                setCategoryItems(prevItems=>[...prevItems, ...response.data.items]);
                setHasMore(response.data.items.length > 0);
                setLoading(false);
            })
            .catch((err)=>{
                console.log(err.message);
                setError(true);
            })
        }
        else{
            axios.post(`${domain}/item/by-category`, requestBody, {headers : {...ngrokHeader}})
            .then((response)=>{
                setCategoryItems(prevItems=>[...prevItems, ...response.data.items]);
                setHasMore(response.data.items.length > 0);
                setLoading(false);
            })
            .catch((err)=>{
                console.log(err.message);
                setError(true);
            })
        }


    },[categoryID, pageNumber]);

    return [categoryItems, loading, error, hasMore];
}

export function useLoadCartItems(pageNumber, limit){

    const { domain, accessToken, ngrokHeader } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const authHeader = {
        "Authorization" : `Bearer ${accessToken}`
    }

    async function removeCartItem(itemIDs){
        return new Promise((resolve, reject) => {
            setLoading(true); // loading will reset to false after local updation
            setError(false);
    
            const requestBody = {
                items : itemIDs
            }
    
            axios.delete(`${domain}/user/cart-details`, {
                headers : {...authHeader, ...ngrokHeader},
                data : requestBody
            })
            .then((response)=>{
                console.log(response.data.message);
                resolve();                
            })
            .catch((err)=>{
                console.log(err.response.data.errorMessage);
                setError(true);
                reject(err);
            })
        })
    }

    function removeItemLocal(itemID){
        setCartItems(prevItems => {
            const filteredItems = prevItems.filter((item)=>{
                if(item.ItemID !== itemID) return true;
                return false;
            })
            return filteredItems;
        });
        setLoading(false);
    }

    function removeAllItemsLocal(){
        setCartItems([]);
        setLoading(false);
    }

    async function updateQuantity(itemID, itemQuantity){
        return new Promise((resolve, reject)=>{
            const requestBody = {
                "itemID" : itemID,
                "itemQuantity" : itemQuantity
            }
    
            axios.post(`${domain}/user/cart-quantity`, requestBody, {headers : {...authHeader, ...ngrokHeader}})
            .then((response)=>{
                console.log(response.data.message);
                setCartItems(prevCart=>{
                    const newCart = prevCart.map((cartItem)=>{
                        if(cartItem.ItemID !== itemID) return cartItem;
                        const newCartItem = {...cartItem, ItemQuantity : itemQuantity};
                        return newCartItem;
                    });
                    return newCart;
                });
                resolve();
            })
            .catch((err)=>{
                console.log(err.response.data.errorMessage);
                reject(err);
            })
        })
    }

    useEffect(()=>{
        setLoading(true);
        setError(false);

        const requestBody = {
            "page" : pageNumber,
            "limit" : limit
        }

        axios.post(`${domain}/user/get-cart-details`, requestBody, {headers : {...authHeader, ...ngrokHeader}})
        .then((response)=>{
            setCartItems(prevItems => [...prevItems, ...response.data.cartItems]);
            setHasMore(response.data.cartItems.length > 0);
            setLoading(false);
        })
        .catch((err)=>{
            console.log(err.response.data.errorMessage);
            setError(true);
        })

    }, [pageNumber]);

    return {cartItems, removeCartItem, removeItemLocal, updateQuantity, removeAllItemsLocal, loading, error, hasMore};
}

export function useLoadOrders(pageNumber, limit){
    const { domain, accessToken, ngrokHeader } = useContext(AppContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(false);
    const authHeader = {
        "Authorization" : `Bearer ${accessToken}`
    }

    useEffect(()=>{
        setLoading(true);
        setError(false);

        const requestBody = {
            "page" : pageNumber,
            "limit" : limit
        }

        axios.post(`${domain}/user/get-orders`, requestBody, {headers : {...authHeader, ...ngrokHeader}})
        .then((response)=>{
            setOrders(prevOrders => [...prevOrders, ...response.data.orders]);
            setHasMore(response.data.orders.length > 0);
            setLoading(false);
        })
        .catch((err)=>{
            console.log(err.message);
            console.log(err.response.data.errorMessage);
            setError(true);
        })

    },[pageNumber]);

    return {normalOrdersData : orders, loading, error, hasMore};
}

export function useLoadSearchResults(searchText, pageNumber, limit){
    const { domain, isLoggedIn, accessToken, ngrokHeader } = useContext(AppContext);
    const [searchItems, setSearchItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(false);

    useEffect(()=>{
        setSearchItems([]);
    },[searchText]);

    useEffect(()=>{
        setLoading(true);
        setError(false);

        if(searchText.length === 0) return;

        const requestBody = {
            searchText : searchText.toLowerCase(),
            page : pageNumber,
            limit : limit
        }

        const authHeader = {
            "Authorization" : `Bearer ${accessToken}`
        }

        if(isLoggedIn){
            axios.post(`${domain}/item/search-results`, requestBody, {headers : {...authHeader, ...ngrokHeader}})
            .then((response)=>{
                setLoading(false);
                setHasMore(response.data.items.length > 0);
                setSearchItems(prevItems => [...prevItems, ...response.data.items]);
            })
            .catch((err)=>{
                console.log(err.message);
                console.log(err.response.data.errorMessage);
                setError(true);
            })
        }
        else{
            axios.post(`${domain}/item/search-results`, requestBody, {headers : {...ngrokHeader}})
            .then((response)=>{
                setLoading(false);
                setHasMore(response.data.items.length > 0);
                setSearchItems(prevItems => [...prevItems, ...response.data.items]);
            })
            .catch((err)=>{
                console.log(err.message);
                console.log(err.response.data.errorMessage);
                setError(true);
            })
        }


    }, [pageNumber, searchText]);

    return {searchItemsData : searchItems, loading, error, hasMore};
}