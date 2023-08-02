import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLoadOrders } from "../../custom-hooks";
import "./Orders.css";
import Utilities from "../../utility-functions";

// const shopOrderTemplate = {
//     ...orderTemplate,
//     ShopID : "",
//     ShopName : "",
//     OrderImage : ""
// }

function NormalOrderCard(props){

    const { normalOrder } = props;
    const normalOrderRef = useRef();
    const [isOpened, setIsOpened] = useState(false);
    const orderedItems = normalOrder.OrderItems.length;
    const [orderRows, totalPrice] = getOrderRows();

    useEffect(()=>{
        function handleClick(event){
            if(!(normalOrderRef.current.contains(event.target))) setIsOpened(false);
        }
        document.addEventListener("click", handleClick);
        return ()=>{
            document.removeEventListener("click", handleClick);
        }
    });

    function getOrderRows(){
        let totalPrice = 0;
        const rows = normalOrder.OrderItems.map((item, index)=>{
            totalPrice += item.ItemQuantity * item.ItemPrice;
            return (
                <div className="normal-order-card-row" key={index}>
                    <div className="normal-order-card-serial">{index + 1}</div>
                    <div className="normal-order-card-itemname">{item.ItemName}</div>
                    <div className="normal-order-card-itemprice">{item.ItemPrice}</div>
                    <div className="normal-order-card-itemquantity">{item.ItemQuantity}</div>
                    <div className="normal-order-card-itemtotal">{item.ItemQuantity * item.ItemPrice}</div>
                </div>
            );
        });

        return [rows, totalPrice];
    }

    function toggleOpen(){
        setIsOpened(prevState=>!prevState);
    }

    return (
        <div className="normal-order-card-container" ref={normalOrderRef}>
            <div className={`normal-order-card-header${isOpened ? "-open" : ""}`} onClick={toggleOpen}>
                <div className="normal-order-card-header-text">
                    Order of {orderedItems} item{orderedItems ? "s" : ""} ordered on {normalOrder.OrderDate} 
                    <span className={`normal-order-card-${normalOrder.Delivered ? "delivered" : "pending"}`}>({normalOrder.Delivered ? "Delivered" : "Pending"})</span>
                </div>
                <div className={`normal-order-card-${isOpened ? "close" : "open"}`}>
                    {isOpened ? <i className="fa-solid fa-minus"></i> : <i className="fa-solid fa-plus"></i>}
                </div>
            </div>
            <div className={`normal-order-card-information-wrapper${isOpened ? "-open" : ""}`}>
                <div className={`normal-order-card-information-container`}>
                    <div className="normal-order-card-header-row">
                        <div className="normal-order-card-serial-header">S.No.</div>
                        <div className="normal-order-card-itemname-header">Item Name</div>
                        <div className="normal-order-card-itemprice-header">Item Price</div>
                        <div className="normal-order-card-itemquantity-header">Item Quantity</div>
                        <div className="normal-order-card-itemtotal-header">Item Total</div>
                    </div>
                    {orderRows}
                    <div className="normal-order-card-total-price">Total Price : <div>{totalPrice}</div></div>
                    <div className="normal-order-card-total-words">{Utilities.numberToText(totalPrice)} rupee{totalPrice > 1 ? "s" : ""} only</div>
                </div>
            </div>
        </div>
    );
}



function Orders(){

    // const [normalOrdersData, setNormalOrdersData] = useState([orderTemplate]);
    // const [shopOrderData, setShopOrderData] = useState([shopOrderTemplate]);
    const limit = 15;
    const [page, setPage] = useState(1);
    const { normalOrdersData, loading, hasMore } = useLoadOrders(page, limit);
    const observer = useRef();
    const lastOrderRef = useCallback((node)=>{
        if(loading) return;
        if(observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries)=>{
            if(entries[0].isIntersecting && hasMore) setPage(prevPage => prevPage + 1);
        },{
            rootMargin : "150px"
        });

        if(node) observer.current.observe(node);

    }, [loading, hasMore]);

    const [normalOrderCards, pendingOrders] = useMemo(()=>{
        let pending = 0;
        const cards = normalOrdersData.map((order, index)=>{
            if(!order.Delivered) pending++;
            if(index < normalOrdersData.length - 1){
                return (
                    <div className="normal-order-card" key={order.OrderID}>
                        <NormalOrderCard
                            normalOrder={order}
                        />
                    </div>
                );
            }
            else{
                return (
                    <div className="normal-order-card" key={order.OrderID} ref={lastOrderRef}>
                        <NormalOrderCard
                            normalOrder={order}
                        />
                    </div>
                );
            }
        });
        return [cards, pending];
    },[normalOrdersData])

    return (
        <div className="orders-wrapper">
            <div className="orders-container">
                <div className="orders-header">
                    Your Cart
                    <div className="orders-header-background"></div>
                </div>
                {normalOrderCards}
                {normalOrdersData.length === 0 && <div className="no-orders">You Have No Placed Orders To View</div>}
            </div>
            <div className="orders-right-column">
                <div className="orders-pending">
                    <div className="orders-pending-text">Pending :</div>
                    <div className="orders-pending-value">{pendingOrders}</div>
                </div>
            </div>
        </div>
    );
}

export default Orders;