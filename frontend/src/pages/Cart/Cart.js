import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoadCartItems } from "../../custom-hooks";
import { AppContext } from "../../AppContext";
import Utilities from "../../utility-functions";
import "./Cart.css";
import axios from "axios";


function CartItemCard(props){

    const { item, removeCartItem, removeItemLocal, updateQuantity, setTotalPrice, setBuyAll } = props;
    const navigate = useNavigate();
    const { ngrokHeader, razorpayKey, setCartCount, accessToken, domain, removeCartLoad, setRemoveCartLoad, buyLoad, setBuyLoad } = useContext(AppContext);
    const [newItemQuantity, setNewItemQuantity] = useState(item.ItemQuantity);
    const [updateQuantityClass, setUpdateQuantityClass] = useState("cart-card-update-quantity-hide");
    const [removeCardClass, setRemoveCardClass] = useState("");
    const [removeCardWrapperClass, setRemoveCardWrapperClass] = useState("");

    const originalPrice = item.ItemPrice;
    const discountPrice = item.ItemDiscountPrice < 0 ? Math.floor(originalPrice * (1 - Utilities.getRandomDiscount(20, item.ItemID))) : item.ItemDiscountPrice;
    const discountPercent = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);

    useEffect(()=>{
        if(newItemQuantity === item.ItemQuantity || newItemQuantity > item.ItemCount) setUpdateQuantityClass("cart-card-update-quantity-hide");
        else setUpdateQuantityClass("cart-card-update-quantity-display");
    },[newItemQuantity, item.ItemQuantity]);

    useEffect(()=>{
        setNewItemQuantity(item.ItemQuantity);
    },[item.ItemQuantity]);

    function increaseQuantity(){
        if(newItemQuantity < item.ItemCount){
            setNewItemQuantity(prevQuantity=>prevQuantity + 1);
            setTotalPrice(prevPrice=>prevPrice + discountPrice);
        }
    }

    function decreaseQuantity(){
        if(newItemQuantity > 1 && item.ItemCount > 0){
            setNewItemQuantity(prevQuantity=>prevQuantity - 1);
            setTotalPrice(prevPrice=>prevPrice - discountPrice);
        }
    }

    function resetQuantity(){
        setNewItemQuantity(item.ItemQuantity);
        setTotalPrice(prevPrice=>prevPrice + ((item.ItemQuantity - newItemQuantity) * discountPrice));
    }

    async function update(){
        try{
            await updateQuantity(item.ItemID, newItemQuantity);
    
            axios.get(`${domain}/user/buy-all-status`, {headers : {"Authorization" : `Bearer ${accessToken}`, ...ngrokHeader}})
            .then((response)=>{
                setBuyAll(response.data.buyAllStatus);
            })
            .catch((err)=>{
                throw Error(err.message);
            })
        }
        catch(err){
            console.log(err.message);
        }
    }


    async function removeItem(){
        try{
            if(removeCartLoad) return;

            setRemoveCartLoad(true);

            await removeCartItem([item.ItemID]);
            
            setRemoveCartLoad(false);

            setRemoveCardClass(" cart-card-remove");
            setRemoveCardWrapperClass(" cart-card-wrapper-remove");

            setTimeout(()=>{
                setRemoveCardWrapperClass(" cart-card-wrapper-remove border-none");

                const originalPrice = item.ItemPrice;
                const discountPrice = item.ItemDiscountPrice < 0 ? Math.floor(originalPrice * (1 - Utilities.getRandomDiscount(20, item.ItemID))) : item.ItemDiscountPrice;

                const priceChange = discountPrice * item.ItemQuantity;
                setTotalPrice(prevPrice => prevPrice - priceChange);
                removeItemLocal(item.ItemID);
                setCartCount(prevCount => prevCount - 1);
                
            }, 500);

        }
        catch(err){
            console.log(err.message);
        }
    }

    function goToItemDetails(){
        navigate("/item-details", {state : {itemID : item.ItemID}});
    }

    async function buySingleItem(){
        try{
            if(buyLoad) return;

            setBuyLoad(true);

            const paymentAmount = discountPrice * item.ItemQuantity;
    
            const receipt = await Utilities.makePayment(paymentAmount, domain, accessToken, razorpayKey);
            const isAuthentic = await Utilities.verifyPayment(receipt, domain, accessToken);
            
            if(!isAuthentic) throw Error("Payment Unsuccessful");

            const orderItem = {
                ItemName : item.ItemName.PrimaryName,
                ItemPrice : discountPrice,
                ItemQuantity : item.ItemQuantity
            }

            await Utilities.addOrder([orderItem], domain, accessToken, paymentAmount);
            await removeCartItem([item.ItemID]);

            setBuyLoad(false);

            setRemoveCardClass(" cart-card-remove");
            setRemoveCardWrapperClass(" cart-card-wrapper-remove");
            setTimeout(()=>{
                console.log("hello");
                setRemoveCardWrapperClass(" cart-card-wrapper-remove border-none");

                const originalPrice = item.ItemPrice;
                const discountPrice = item.ItemDiscountPrice < 0 ? Math.floor(originalPrice * (1 - Utilities.getRandomDiscount(20, item.ItemID))) : item.ItemDiscountPrice;

                const priceChange = discountPrice * item.ItemQuantity;
                setTotalPrice(prevPrice => prevPrice - priceChange);
                removeItemLocal(item.ItemID);
                setCartCount(prevCount => prevCount - 1);
                
            }, 500);
        }
        catch(err){
            console.log(err.message);
        }
    }

    return (
        <div className={`cart-card-wrapper${removeCardWrapperClass}`}>
            <div className={`cart-card${removeCardClass}`}>
                <div className="cart-card-image-container">
                    <img src={item.ItemImage} alt="Item" className="cart-card-image" onClick={goToItemDetails} />
                </div>

                <div className="cart-card-information">
                    <div className="cart-card-name" onClick={goToItemDetails}>{item.ItemName.PrimaryName + " " + item.ItemName.SecondaryName}</div>
                    <div className="cart-card-price">
                        <span className="cart-card-discount-percent">-{discountPercent}%</span>
                        <span className="cart-card-discount-price"><sup>₹</sup>{discountPrice}</span>
                        <span className="cart-card-mrp">( M.R.P.: <span>₹{originalPrice}</span> )</span>
                    </div>
                    <div className="cart-card-total-price">
                        <span className="cart-card-total-price-text">Total Price :</span>
                        <span className="cart-card-total-price-value">{newItemQuantity * discountPrice}</span>
                    </div>
                </div>

                <div className="cart-card-stock-quantity">
                    <div className="cart-card-stock">
                        <div className={`cart-card-bullet-${item.ItemCount > 0 ? "green" : "red"}`}></div>
                        <div className={`cart-card-stock-text-${item.ItemCount > 0 ? "green" : "red"}`}>{item.ItemCount > 0 ? "In Stock" : "Out Of Stock"}</div>
                    </div>
                    <div className="cart-card-quantity-container">
                        <div className="cart-card-quantity-text">Qty :</div>
                        <div className="cart-card-quantity">
                            <div className="cart-card-quantity-value">{newItemQuantity}</div>
                            <div className="cart-card-quantity-arrows">
                                <div className={`cart-card-quantity-uparrow-${newItemQuantity >= item.ItemCount || item.ItemCount === 0 ? "inactive" : "active"}`} onClick={increaseQuantity}>
                                    <i className="fa-solid fa-angle-up"></i>
                                </div>
                                <div className={`cart-card-quantity-downarrow-${newItemQuantity <= 1 || item.ItemCount === 0 ? "inactive" : "active"}`} onClick={decreaseQuantity}>
                                    <i className="fa-solid fa-angle-down"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={updateQuantityClass}>
                        <div className="cart-card-update-quantity-btn" onClick={update}>Update</div>
                        <div className="cart-card-reset-quantity-btn" onClick={resetQuantity}>
                            <i className="fa-solid fa-rotate-left"></i>
                        </div>
                    </div>
                </div>

                <div className="cart-card-buttons">
                    <div className="cart-card-remove-btn" onClick={removeItem}>Remove</div>
                    <div className={`cart-card-buy-btn-${item.ItemCount === 0 || item.ItemQuantity > item.ItemCount ? "inactive" : "active"}`} onClick={buySingleItem}>
                        Buy
                        <div className="tooltip-container">
                            <div className="tooltip-arrow"></div>
                            <div className="tooltip-content">
                                {item.ItemCount === 0 ? "This item is out of stock" : `Maximum items available : ${item.ItemCount}`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


function Cart(){

    const limit = 12;
    const navigate = useNavigate();
    const { domain, ngrokHeader, setCartCount, accessToken, razorpayKey, buyLoad, setBuyLoad } = useContext(AppContext);
    const [page, setPage] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);
    const [buyAll, setBuyAll] = useState(true);
    const {cartItems,
           removeCartItem,
           removeItemLocal,
           updateQuantity,
           removeAllItemsLocal,
           loading,
           error,
           hasMore} = useLoadCartItems(page, limit);
    const observer = useRef();

    const lastItemRef = useCallback((node)=>{
        if(loading) return;
        if(observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries)=>{
            if(entries[0].isIntersecting && hasMore){
                setPage(prevPage => prevPage + 1);
            }
        },{
            rootMargin : "150px"
        });

        if(node) observer.current.observe(node);

    }, [loading, hasMore]);

    const cartCards = useMemo(()=>{
        return getCartCards();
    },[cartItems]);

    useEffect(()=>{
        window.scrollTo({
            top: 0,
            behavior : "smooth"
        });

        axios.get(`${domain}/user/cart-total`, {headers : {"Authorization" : `Bearer ${accessToken}`, ...ngrokHeader}})
        .then((response)=>{
            setTotalPrice(response.data.totalPrice);
        })
        .catch((err)=>{
            console.log(err.message);
            console.log(err.response.data.errorMessage);
        })

        axios.get(`${domain}/user/buy-all-status`, {headers : {"Authorization" : `Bearer ${accessToken}`, ...ngrokHeader}})
        .then((response)=>{
            setBuyAll(response.data.buyAllStatus);
        })
        .catch((err)=>{
            console.log(err.message);
            console.log(err.response.data.errorMessage);
        })

    },[])

    function getCartCards(){

        const cards = cartItems.length > 0 && cartItems.map((item, index)=>{

            if(index < cartItems.length - 1){
                return (
                    <div className="cart-card-container" key={item.ItemID}>
                        <CartItemCard
                            item={item}
                            removeCartItem={removeCartItem}
                            removeItemLocal={removeItemLocal}
                            updateQuantity={updateQuantity}
                            setBuyAll={setBuyAll}
                            setTotalPrice={setTotalPrice}
                        />
                    </div>
                );
            }
            else{
                return (
                    <div className="cart-card-container" key={item.ItemID} ref={lastItemRef}>
                        <CartItemCard
                            item={item}
                            removeCartItem={removeCartItem}
                            removeItemLocal={removeItemLocal}
                            updateQuantity={updateQuantity}
                            setBuyAll={setBuyAll}
                            setTotalPrice={setTotalPrice}
                        />
                    </div>
                );
            }
        });

        return cards;
    }

    async function buyAllItems(){
        try{
            if(buyLoad) return;

            setBuyLoad(true);

            const receipt = await Utilities.makePayment(totalPrice, domain, accessToken, razorpayKey);
            const isAuthentic = await Utilities.verifyPayment(receipt, domain, accessToken);
            
            if(!isAuthentic) throw Error("Payment Unsuccessful");

            const cartResponse = await axios.get(`${domain}/user/all-cart-items`, {headers : {"Authorization" : `Bearer ${accessToken}`, ...ngrokHeader}});

            const itemIDs = cartResponse.data.itemIDs;
            const itemNames = cartResponse.data.itemNames;
            const itemQuantities = cartResponse.data.itemQuantities;
            const itemPrices = cartResponse.data.itemPrices;

            const orderItems = itemIDs.map((itemID)=>{
                return {
                    ItemName : itemNames[itemID],
                    ItemPrice : itemPrices[itemID],
                    ItemQuantity : itemQuantities[itemID]
                }
            });

            await Utilities.addOrder(orderItems, domain, accessToken, totalPrice);
            await removeCartItem(itemIDs);

            setBuyLoad(false);
            
            removeAllItemsLocal();
            setTotalPrice(0);
            setCartCount(0);
            console.log("All Items Bought");
        }
        catch(err){
            console.log(err);
            console.log(err.message);
        }
    }

    function goToHome(){
        navigate("/");
    }

    return (
        <div className="cart-wrapper">
            <div className="cart-container">
                <div className="cart-header">
                    Your Cart
                    <div className="cart-header-background"></div>
                </div>
                <div className="cart-cards-container">
                    {cartItems.length > 0 ? cartCards : 
                    <div className="no-cart-items">
                        No Items In Your Cart.
                        <div onClick={goToHome}>Try Adding Some Items</div>
                    </div>}

                </div>
                <div className="cart-right-column">
                    <div className="cart-total-price-container">
                        <div className="cart-total-price-text">Total Price :</div>
                        <div className="cart-total-price-value">{totalPrice}</div>
                    </div>
                    <div className={`cart-buy-all-${buyAll && cartItems.length > 0 ? "active" : "inactive"}`} onClick={buyAllItems}>
                        Buy All
                        <div className="tooltip-container">
                            <div className="tooltip-arrow"></div>
                            <div className="tooltip-content">
                                {!buyAll ? "Some item(s) cannot be bought" : cartItems.length === 0 ? "No Items in Cart" : ""}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;