import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../AppContext";
import Utilities from "../utility-functions";
import axios from "axios";

function ItemCard(props) {
    const { itemName, itemImage, itemID, itemMRP, itemCount, itemFavourite } = props;
    const { domain, ngrokHeader, isLoggedIn, accessToken, setCartCount, favToggleLoad, setFavToggleLoad, addCartLoad, setAddCartLoad, setMessage, setShowMessage } = useContext(AppContext);
    const navigate = useNavigate();
    const [favItem, setFavItem] = useState(itemFavourite);
    const originalPrice = itemMRP;
    const discountPrice = Math.floor(originalPrice * (1 - Utilities.getRandomDiscount(20, itemID)));
    const discountPercent = Math.ceil(((originalPrice - discountPrice) / originalPrice) * 100);

    function goToItem(){
        navigate("/item-details", {state : {itemID : itemID}});
    }

    function toggleFavourite(){
        if(favToggleLoad) return;
        if(!isLoggedIn){
            setMessage("Please Login To Add Favourite Item");
            setShowMessage(true);
            return;
        }
        
        setFavToggleLoad(true);
        
        const requestBody = {itemID, shopID : ""};
        const authHeader = {"Authorization" : `Bearer ${accessToken}`};

        if(favItem){
            setFavItem(false);
            axios.delete(`${domain}/user/favourite-items`,{
                headers : {...authHeader, ...ngrokHeader},
                data : requestBody
            })
            .then((response)=>{
                setFavToggleLoad(false);
                setMessage(response.data.message);
                setShowMessage(true);
            })
            .catch((err)=>{
                setFavItem(true);
                setFavToggleLoad(false);
                console.log(err.message);
                console.log(err.response.data.errorMessage);
                setMessage("Could not remove favourite item");
                setShowMessage(true);
            })
        }
        else{
            setFavItem(true);
            axios.post(`${domain}/user/favourite-items`, requestBody, {headers : {...authHeader, ...ngrokHeader}})
            .then((response)=>{
                setFavToggleLoad(false);
                setMessage(response.data.message);
                setShowMessage(true);
            })
            .catch((err)=>{
                setFavItem(false);
                setFavToggleLoad(false);
                console.log(err.message);
                console.log(err.response.data.errorMessage);
                setMessage("Could not add to favourite items");
                setShowMessage(true);
            })
        }
    }

    function addToCart(){
        if(addCartLoad) return;
        if(!isLoggedIn){
            setMessage("Please Login To Add To Cart");
            setShowMessage(true);
            return;
        }

        setAddCartLoad(true);
        const requestBody = {
            "itemID" : itemID,
            "itemQuantity" : 1
        }

        const authHeader = {
            "Authorization" : `Bearer ${accessToken}`
        }

        axios.post(`${domain}/user/add-cart-details`, requestBody, {headers : {...authHeader, ...ngrokHeader}})
        .then((response)=>{
            setCartCount(prevCount => prevCount + 1);
            setAddCartLoad(false);
            setMessage(response.data.message);
            setShowMessage(true);
        })
        .catch((err)=>{
            setAddCartLoad(false);
            console.log(err.message);
            setMessage(err.response.data.errorMessage);
            setShowMessage(true);
        })
    }

    return (
        <div className="item-card-container">
            <div className="item-favourite-btn" onClick={toggleFavourite}>
                <div>
                    <div className={`item-favourite-icon2-${!isLoggedIn || !favItem ? "inactive" : "active"}`}>
                        <i className="fa-solid fa-heart"></i>
                    </div>
                    <div className={`item-favourite-icon1-${!isLoggedIn || !favItem ? "inactive" : "active"}`}>
                        <i className="fa-regular fa-heart"></i>
                    </div>
                </div>
            </div>
            <div className="item-image-container">
                <img src={itemImage} alt="" className="item-image" onClick={goToItem}/>
            </div>
            <div className="item-name" onClick={goToItem}>{itemName}</div>
            <div className="item-price">
                <sup>₹</sup>
                <span className="item-price-discount">{discountPrice}</span>
                &nbsp;&nbsp;MRP : ₹<span className="item-price-original">{originalPrice}</span>
                &nbsp;<span className="item-discount-text">({discountPercent}% off)</span>
            </div>
            <div className="item-stock">
                <div className={`item-stock-bullet-${itemCount>0 ? "green" : "red"}`}></div>
                <div className={`item-stock-text-${itemCount>0 ? "green" : "red"}`}>{itemCount > 0 ? "In Stock" : "Out Of Stock"}</div>
            </div>
            <div className="item-add-cart-btn" onClick={addToCart}>
                <div className="item-add-cart-text">Add To Cart</div>
                <div className="item-add-cart-icon">
                    <i className="fa-solid fa-cart-plus"></i>
                </div>
            </div>
        </div>
    );
}

export default ItemCard;