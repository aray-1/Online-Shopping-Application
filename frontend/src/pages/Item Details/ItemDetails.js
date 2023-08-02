import React, { useEffect, useContext, useState, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { AppContext } from "../../AppContext";
import ItemCard from "../../components/ItemCard";
import Utilities from "../../utility-functions";
import "./ItemDetails.css";
import axios from "axios";

const itemTemplate = {
    ItemName : {
        PrimaryName : "",
        SecondaryName : ""
    },
    ItemCategory : {
        CategoryName : "",
        CategoryID : ""
    },
    ItemID : "",
    ItemImage : "",
    ItemCount : 0,
    ItemPrice : 0,
    ItemDiscountPrice : 0,
    ItemDescription : "",
    ItemTableDetails : [{Property : "", Value : ""}],
    ItemSaleCount : 0,
    ItemShopID : ""
};


function ItemDetails(){

    const location = useLocation();
    const { domain, ngrokHeader, userDetails, isLoggedIn, accessToken, setCartCount, addCartLoad, setAddCartLoad, setMessage, setShowMessage } = useContext(AppContext);
    const observer = useRef(null);
    const popularItemsRef = useRef();
    const [item, setItem] = useState(itemTemplate);
    const [itemQuantity, setItemQuantity] = useState(1);
    const [commentsData, setCommentsData] = useState([]);
    const [popularItemsData, setPopularItemsData] = useState([]);
    const [newCommentBody, setNewCommentBody] = useState("");
    const [addCommentBorderClass, setAddCommentBorderClass] = useState("item-details-comment-border-hide");
    const [addCommentButtonClass, setAddCommentButtonClass] = useState("item-details-comment-btn-hide");


    const originalPrice = item.ItemPrice;
    const discountPrice = item.ItemDiscountPrice < 0 ? Math.floor(originalPrice * (1 - Utilities.getRandomDiscount(20, item.ItemID))) : item.ItemDiscountPrice;
    const discountPercent = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);

    const tableDetails = useMemo(()=>{
        return item.ItemTableDetails.map((tableDetail, index)=>{
            return (
                <div className="item-table-detail" key={index}>
                    <span className="item-table-detail-property">{tableDetail.Property} : </span>
                    <span className="item-table-detail-value">{tableDetail.Value}</span>
                </div>
            );
        });
    },[item.ItemTableDetails]);

    const comments = useMemo(()=>{
        return commentsData.map((comment, index)=>{
            return (
                <div className={`comment${userDetails.email === comment.Email ? " my-comment" : ""}`} key={index}>
                    <div className="comment-header">
                        <span className="comment-username">{comment.UserName},</span>
                        <span className="comment-time">{comment.Time} ago</span> 
                    </div>
                    <div className="comment-body">{comment.Body}</div>
                </div>
            );
        });
    },[commentsData]);

    const popularItems = useMemo(()=>{
        return popularItemsData.map((item)=>{
            return (
                <div className="popular-item" key={item.ItemID}>
                    <ItemCard
                        itemName={item.ItemName.PrimaryName}
                        itemImage={item.ItemImage}
                        itemID={item.ItemID}
                        itemCount={item.ItemCount}
                        itemMRP={item.ItemPrice}
                        itemFavourite={item.ItemFavourite}
                    />
                </div>
            );
        });
    },[popularItemsData]);


    useEffect(()=>{
        // scroll to top
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        
        // fetch item data
        const itemID = location.state.itemID;
        const itemDetailsBody = {
            itemList : [
                {itemID : itemID}
            ]
        }
        axios.post(`${domain}/item/details`, itemDetailsBody, {headers : {...ngrokHeader}})
        .then((response)=>{
            setItem(response.data.items[0]);
        })
        .catch((err)=>{
            console.log(err.message);
        })

        const commentRequestBody = {
            "itemID" : location.state.itemID
        }
        axios.post(`${domain}/item/get-comment`, commentRequestBody, {headers : {...ngrokHeader}})
        .then((response)=>{
            if(response.data.comments.length > 0) setCommentsData(response.data.comments);
        })
        .catch((err)=>{
            console.log(err.message);
            setMessage(err.response.data.errorMessage);
            setShowMessage(true);
        })
        
    },[location.state]);

    // Lazily load popular items
    useEffect(()=>{
        
        function loadPopularItems(){
            const requestBody = {
                "popularItemsCount" : 10,
                "categoryID" : item.ItemCategory.CategoryID
            };
            const authHeader = {
                "Authorization" : `Bearer ${accessToken}`
            }

            if(isLoggedIn){
                axios.post(`${domain}/item/popular`, requestBody, {headers : {...authHeader, ...ngrokHeader}})
                .then((response)=>{
                    setPopularItemsData(response.data.items);
                })
                .catch((err)=>{
                    console.log(err.message);
                })
            }
            else{
                axios.post(`${domain}/item/popular`, requestBody, {headers : {...ngrokHeader}})
                .then((response)=>{
                    setPopularItemsData(response.data.items);
                })
                .catch((err)=>{
                    console.log(err.message);
                })
            }
        }
        
        if(item !== itemTemplate){
            observer.current = new IntersectionObserver((entries)=>{
                const entry = entries[0];
                if(!entry.isIntersecting) return;
                loadPopularItems(entry);
                observer.current.unobserve(entry.target);
            },{
                rootMargin : "100px"
            });
    
            observer.current.observe(popularItemsRef.current);
        }

        return ()=>{
            if(observer.current) observer.current.disconnect();
        }

    },[item]);

    function increaseItemQuantity(){
        if(itemQuantity < item.ItemCount && item.ItemCount > 0) setItemQuantity(prevCount=>prevCount + 1);
    }

    function decreaseItemQuantity(){
        if(itemQuantity > 1 && item.ItemCount > 0) setItemQuantity(prevCount=>prevCount - 1);
    }

    function addToCart(){
        if(addCartLoad) return;
        if(!isLoggedIn) return;

        setAddCartLoad(true);
        const requestBody = {
            "itemID" : item.ItemID,
            "itemQuantity" : itemQuantity
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

    function pushComment(){
        if(!isLoggedIn) return;
        if(newCommentBody.length === 0) return;
        
        const newComment = {
            UserName : userDetails.userName,
            Email : userDetails.email,
            Time : "1 minute",
            Body : newCommentBody
        }
        
        const requestBody = {
            "itemID" : item.ItemID,
            "userName" : userDetails.userName,
            "body" : newCommentBody
        }

        const authHeader = {
            "Authorization" : `Bearer ${accessToken}`
        }

        axios.post(`${domain}/item/push-comment`, requestBody, {headers : {...authHeader, ...ngrokHeader}})
        .then((response)=>{
            setCommentsData(prevData=>[newComment, ...prevData]);
            setNewCommentBody("");
            setAddCommentBorderClass("item-details-comment-border-hide");
            setAddCommentButtonClass("item-details-comment-btn-hide");
        })
        .catch((err)=>{
            console.log(err.message);
            setMessage(err.response.data.errorMessage);
            setShowMessage(true);
        })
    }

    function handleCommentChange(event){
        setNewCommentBody(event.target.value);
    }

    function handleCommentFocus(){
        setAddCommentBorderClass("item-details-comment-border-display");
        setAddCommentButtonClass("item-details-comment-btn-display");
    }

    function handleCommentBlur(){
        if(newCommentBody.length === 0){
            setAddCommentBorderClass("item-details-comment-border-hide");
            setAddCommentButtonClass("item-details-comment-btn-hide");
        }
    }

    function adjustTextarea(event){
        event.target.style.height = "auto";
        event.target.style.height = `${event.target.scrollHeight}px`;
    }

    function cartTooltipText(){
        if(!isLoggedIn) return "You Are Not Logged In";
        else if(item.ItemCount === 0) return "Item Is Out Of Stock";
    }

    return (
        <div className="item-details-container">
            <style>
                {
                    `body{
                        background-color : var(--color-0) !important;
                    }`
                }
            </style>
            <div className="item-details-section1">
                <div className="item-details-image-container">
                    <img src={item.ItemImage} alt="Item" className="item-details-image" />
                </div>
                <div className="item-basic-information">
                    <div className="item-details-name">{item.ItemName.PrimaryName + " " + item.ItemName.SecondaryName}</div>
                    <div className="item-details-price">
                        <div className="item-details-discount">
                            <span className="item-details-discount-percent">-{discountPercent}%</span>
                            <span className="item-details-discount-price"><sup>₹</sup>{discountPrice}</span>
                        </div>
                        <div className="item-details-mrp">M.R.P.: <span>₹{originalPrice}</span></div>
                    </div>
                    <div className="item-details-about-item">
                        <div className="item-details-about-item-text">About This Item</div>
                        {tableDetails}
                    </div>
                </div>
                <div className="item-details-section1-buttons">
                    <div className="item-details-stock-container">
                        <div className={`item-details-stock-bullet-${item.ItemCount > 0 ? "green" : "red"}`}></div>
                        <div className={`item-details-stock-${item.ItemCount > 0 ? "green" : "red"}`}>{item.ItemCount > 0 ? "In Stock" : "Out of Stock"}</div>
                    </div>
                    <div className="item-details-quantity-container">
                        <div className="item-details-quantity-text">Qty:</div>
                        <div className="item-details-change-quantity">
                            <div className="item-details-quantity">{ item.ItemCount === 0 ? 0 : itemQuantity}</div>
                            <div className="item-details-quantity-arrows">
                                <div className={`item-details-quantity-uparrow-${itemQuantity === item.ItemCount || item.ItemCount === 0 ? "inactive" : "active"}`} onClick={increaseItemQuantity}>
                                    <i className="fa-solid fa-angle-up"></i>
                                </div>
                                <div className={`item-details-quantity-downarrow-${itemQuantity === 1 || item.ItemCount === 0 ? "inactive" : "active"}`} onClick={decreaseItemQuantity}>
                                    <i className="fa-solid fa-angle-down"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`item-details-add-cart-${!isLoggedIn || item.ItemCount === 0 ? "inactive" : "active"}`} onClick={addToCart}>
                        Add To Cart
                        <div className="tooltip-container">
                            <div className="tooltip-arrow"></div>
                            <div className="tooltip-content">
                                {cartTooltipText()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="item-details-description-container">
                <div className="item-details-description-header">Product Description</div>
                <div className="item-details-description-body">{item.ItemDescription}</div>
            </div>
            <div className="item-details-comments-container">
                <div className="item-details-comment-header">Comments</div>
                <div className="item-details-new-comment">
                    <div className="item-comment-input-container">
                        <div className={addCommentBorderClass}></div>
                        <textarea rows={1} type="text" className="item-comment-input" placeholder="Add a comment..." value={newCommentBody} onChange={handleCommentChange} onInput={adjustTextarea} onFocus={handleCommentFocus} onBlur={handleCommentBlur} />
                    </div>
                    <button className={`${addCommentButtonClass}${!isLoggedIn ? " comment-btn-inactive" : ""}`} onClick={pushComment}>
                        Comment
                        <div className="tooltip-container">
                            <div className="tooltip-arrow"></div>
                            <div className="tooltip-content">
                                Please Login To Share A Comment
                            </div>
                        </div>
                    </button>
                </div>
                <div className="item-details-comments">
                    {commentsData.length === 0 ? 
                    <div className="item-details-no-comments">There Are No Comments For This Item</div> : comments}
                </div>
            </div>
            <div className="popular-items-container" ref={popularItemsRef}>
                <div className="popular-items-header">Popular Items In This Category</div>
                <div className="popular-items">{popularItems}</div>
            </div>
        </div>
    );
}

export default ItemDetails;