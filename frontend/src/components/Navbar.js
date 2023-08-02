import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../AppContext";
import SideBar from "./SideBar";
import axios from "axios";

function Navbar(){

    const { domain, ngrokHeader, categories, userDetails, accessToken, setAccessToken, cartCount, setCartCount, setUserDetails, isLoggedIn, setIsLoggedIn, setMessage, setShowMessage } = useContext(AppContext);
    const limit = 15;
    const navigate = useNavigate();
    const location = useLocation();
    const categoryDropdownRef = useRef();
    const searchOptionsRef = useRef();
    const logoutRef = useRef();
    const notificationPopupRef = useRef();
    const searchInputRef = useRef();
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchOptions, setSearchOptions] = useState([{ItemName : "Try Writing Something.", ItemID : ""}]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notificationMessages, setNotificationMessages] = useState([]);

    const categoryList = categories.map((category)=>{
        return (
            <div className="navbar-category" onClick={()=>{goToCategory(category.CategoryID)}} key={category.CategoryID}>{category.CategoryName}</div>
        );
    });

    const searchOptionsList = searchOptions.map((item)=>{

        if(item.ItemName.PrimaryName){
            const name = item.ItemName.PrimaryName;
            const nameLower = name.toLowerCase();
            const nameSplit = nameLower.split(searchText.toLowerCase());
            const len1 = nameSplit[0].length;

            return (
                <div className="navbar-search-option-item" key={item.ItemID} onClick={()=>{goToItemDetails(item.ItemID, name)}}>
                    {name.substring(0, len1)}
                    <span>{item.ItemID ? name.substring(len1, len1 + searchText.length) : ""}</span>
                    {item.ItemID ? name.substring(len1 + searchText.length) : item.ItemName}
                </div>
            );
        }
        else{
            return (
                <div className="navbar-search-option-item" key={item.ItemID}>
                    <span>{item.ItemID ? item.itemName.substring(0, searchText.length) : ""}</span>
                    {item.ItemID ? item.ItemName.substring(searchText.length) : item.ItemName}
                </div>
            );
        }


    })

    const notificationMessagesList = notificationMessages.map((message, index)=>{
        return (
            <div className="notification-message" key={index}>
                <div className="notification-message-subject">{message.Header}</div>
                <div className="notification-message-body">{message.Body}</div>
            </div>
        );
    })

    useEffect(()=>{
          
        if(isLoggedIn){
            const authHeader = {
                "Authorization" : `Bearer ${accessToken}`
            }

            axios.get(`${domain}/user/cart-count`, { headers : {...authHeader, ...ngrokHeader} })
            .then((response)=>{
                setCartCount(response.data.cartCount);
            })
            .catch((err)=>{
                console.log(err.message);
            })
            
            axios.get(`${domain}/user/notifications`, { headers : {...authHeader, ...ngrokHeader} })
            .then((response)=>{
                setNotificationMessages(response.data.notifications);
            })
            .catch((err)=>{
                console.log(err.message);
            })
        }
            
    },[location.pathname, location.state, isLoggedIn]);

    useEffect(()=>{
        function checkClick(event){
            if(!categoryDropdownRef.current.contains(event.target)) setCategoryOpen(false);
        }

        document.addEventListener("mousedown", checkClick);

        return ()=>{
            document.removeEventListener("mousedown", checkClick);
        };
    });

    useEffect(()=>{
        function checkClick(event){
            if(!searchOptionsRef.current.contains(event.target)) setSearchOpen(false);
        }

        document.addEventListener("mousedown", checkClick);

        return ()=>{
            document.removeEventListener("mousedown", checkClick);
        };
    });

    useEffect(()=>{
        function checkClick(event){
            if(!logoutRef.current?.contains(event.target)) setLogoutOpen(false);
        }

        document.addEventListener("mousedown", checkClick);

        return ()=>{
            document.removeEventListener("mousedown", checkClick);
        };
    });

    useEffect(()=>{
        function checkClick(event){
            if(!notificationPopupRef.current.contains(event.target)) setNotificationOpen(false);
        }

        document.addEventListener("mousedown", checkClick);

        return ()=>{
            document.removeEventListener("mousedown", checkClick);
        };
    });

    useEffect(()=>{
        if(searchText){
            // send request to database for new list
            const requestBody = {searchText : searchText.toLowerCase(), limit}
            axios.post(`${domain}/item/autocomplete`, requestBody, {headers : {"Authorization" : `Bearer ${accessToken}`, ...ngrokHeader}})
            .then((response)=>{
                if(response.data.items.length === 0){
                    setSearchOptions([{ItemName : "No Matches Found", ItemID : ""}]);
                }
                else setSearchOptions([...response.data.items]);
            })
            .catch((err)=>{
                console.log(err.message);
                console.log(err.response.data.errorMessage);
            })
        }
        else setSearchOptions([{ItemName : "Try Writing Something", ItemID : ""}]);
    },[searchText]);

    function goToSearchResults(event){
        if(event.key === "Enter" && searchText.length > 0){
            setSearchOpen(false);
            searchInputRef.current.blur();
            navigate("/search-results", {state : {searchText}});
        }
    }

    function goToItemDetails(itemID, itemName){
        setSearchOpen(false);
        setSearchText(itemName)
        navigate("/item-details", {state : {itemID}});
    }

    function goToCategory(categoryID){
        setCategoryOpen(false);
        navigate("/category", {state : {categoryID : categoryID}});
    }

    function goToHome(){
        navigate("/");
    }

    function goToSignIn(){
        const prevPath = location.pathname;
        const {...properties} = location.state || {};

        navigate("/sign-in", {state : {prevPath, ...properties}});
    }

    function goToCart(){
        if(!isLoggedIn){
            setMessage("Please Login to view your cart");
            setShowMessage(true);
            return;
        }
        navigate("/your-cart");
    }

    function goToShops(){
        navigate("/shops");
    }
    
    function goToOrders(){
        navigate("/orders");
    }

    function openCategoryDropdown(){
        setCategoryOpen(prevState=>!prevState);
    }

    function searchTextChange(event){
        setSearchText(event.target.value);
    }

    function handleSearchFocus(){
        setSearchOpen(true);
    }

    function handleLogoutOpenClick(){
        setLogoutOpen(prevState=>!prevState);
    }

    function handleLogout(){
        setAccessToken("");
        setCartCount(0);
        setUserDetails({
            userName : "",
            password : "",
            email : ""
        });
        setIsLoggedIn(false);
        navigate("/");
    }

    function openNotification(){
        if(!isLoggedIn){
            setMessage("Please Login To View Notifications");
            setShowMessage(true);
            return;
        }
        setNotificationOpen(true);
    }

    function closeNotifications(){
        setNotificationOpen(false);
    }

    return (
        <div className="navbar-container">
            <SideBar 
                isLoggedIn={isLoggedIn}
            />
            <div className="navbar1-container">
                <div className="website-logo" onClick={goToHome}>
                    <span className="r">R</span>
                    <span className="a">α</span>
                    <span className="y">ყ</span>
                    <span className="m">M</span>
                    <span className="a">α</span>
                    <span className="r">ɾ</span>
                    <span className="t">ƚ</span>
                </div>
                <div className="navbar-search" ref={searchOptionsRef}>
                    <input autoComplete="off" placeholder="Search in RayMart" type="text" id="navbar-text" className="navbar-search-text" name="searchText" value={searchText} onChange={searchTextChange} onFocus={handleSearchFocus} onKeyDown={goToSearchResults} ref={searchInputRef} />
                    <label htmlFor="navbar-text" className="navbar-search-icon">
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </label>
                    <div className={`navbar-search-options-wrapper-${searchOpen ? "open" : "close"}`}>
                        <div className={`navbar-search-options-${searchOpen ? "open" : "close"}`}>
                            {searchOptionsList}
                        </div>
                    </div>
                </div>
                <div className={`navbar-search-overlay-${ searchOpen ? "open" : "close" }`}></div>
                <div className="navbar-signin">
                    {/* not signed in */}
                    {!isLoggedIn && <div className="navbar-no-signin" onClick={goToSignIn}>Sign In</div>}
                    {isLoggedIn && <div className="navbar-signed-in" ref={logoutRef}>
                        <div className={`navbar-logout-container-${logoutOpen ? "open" : "close"}`}>
                            <div className="navbar-logout-text" onClick={handleLogout}>Log Out</div>
                        </div>
                        <div className="navbar-signin-text-container" onClick={handleLogoutOpenClick}>
                            <div className="navbar-user">
                                <div className="navbar-user-hello">Hello</div>
                                <div className="navbar-user-name">{userDetails.userName}</div>
                            </div>
                            <div className="navbar-logout-arrow">
                                <i className={`fa-solid fa-chevron-right${logoutOpen ? " arrow-rotate" : ""}`}></i>
                            </div>
                        </div>
                    </div>}
                </div>
                <div className="navbar-notification">
                    <div className="navbar-notification-circle" onClick={openNotification}>
                        {isLoggedIn && <div className="navbar-notification-count">{notificationMessages.length}</div>}
                        <div className="navbar-notification-icon">
                            <i className="fa-solid fa-bell"></i>
                        </div>
                    </div>
                    <div className={`navbar-notification-popup-overlay-${notificationOpen ? "open" : "close"}`}></div>
                    <div className={`navbar-notification-popup-container-${notificationOpen ? "open" : "close"}`} ref={notificationPopupRef}>
                        <div className="navbar-notification-header-container">
                            <div className="navbar-notification-header">Notifications</div>
                            <div className="navbar-notification-close-icon" onClick={closeNotifications}>
                                <i className="fa-solid fa-xmark"></i>
                            </div>
                        </div>
                        <div className="navbar-notification-message-container">
                            {notificationMessagesList.length > 0 ? notificationMessagesList : 
                                <div className="no-notifications"><span>You Have No New Notifications</span></div>
                            }
                        </div>
                    </div>
                </div>
                <div className="navbar-cart-btn" onClick={goToCart}>
                    <div className="navbar-cart-text">Cart</div>
                    {isLoggedIn && <div className="navbar-cart-count">{cartCount}</div>}
                    <div className="navbar-cart-icon">
                        <i className="fa-solid fa-cart-shopping"></i>
                    </div>
                </div>
            </div>

            <div className="navbar2-container">
                <div className="navbar-delivery-location-btn">
                    <div className="navbar-delivery-location-container">
                        <div className="navbar-delivery-location-text">Delivery <span>Location</span></div>
                        <div className="navbar-delivery-location-icon">
                            <i className="fa-solid fa-location-dot"></i>
                        </div>
                    </div>
                    <div className="navbar-border"></div>
                </div>
                <div className="navbar-shops-btn" onClick={goToShops}>
                    <div className="navbar-shops-container">
                        <div className="navbar-shops-text">Shops</div>
                        <div className="navbar-shops-icon">
                            <i className="fa-solid fa-shop"></i>
                        </div>
                    </div>
                    <div className="navbar-border"></div>
                </div>
                <div className="navbar-orders-btn" onClick={goToOrders}>
                    <div className="navbar-orders-text">Orders</div>
                    <div className="navbar-border"></div>
                </div>
                <div className="navbar-categories-btn" ref={categoryDropdownRef}>
                    <div className="navbar-catgeories-container"  onClick={openCategoryDropdown}>
                        <div className="navbar-categories-text">Categories</div>
                        <div className={`navbar-categories-arrow${categoryOpen ? " arrow-rotate" : ""}`}>
                            <i className="fa-solid fa-chevron-right"></i>
                        </div>
                    </div>
                    <div className={`navbar-border${categoryOpen ? " navbar-border-active" : ""}`}></div>
                    <div className={`navbar-categories-dropdown-container-${categoryOpen ? "open" : "close"}`}>
                        <div className={`navbar-categories-dropdown-${ categoryOpen ? "open" : "close" }`}>
                            {categoryList}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;