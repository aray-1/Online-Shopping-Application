import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import ItemCard from "../../components/ItemCard";
import { useLocation } from "react-router-dom";
import { useLoadItems } from "../../custom-hooks";
import "./Category.css";
import axios from "axios";
import { AppContext } from "../../AppContext";

const categoryTemplate = {
    CategoryBannerImage : ""
}

function Category(){

    const { domain, ngrokHeader } = useContext(AppContext);
    const limit = 12;
    const location = useLocation();
    const observer = useRef(null);
    const [page, setPage] = useState(1);
    const [categoryData, setCategoryData] = useState(categoryTemplate);
    const [categoryItemsData, loading, error, hasMore] = useLoadItems(location.state.categoryID, page, limit);
    
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

    const categoryItems = categoryItemsData?.map((item, index)=>{
        if(index < categoryItemsData.length - 1){
            return (
                <div className="category-item-container" key={index}>
                    <ItemCard 
                        itemName={item.ItemName.PrimaryName}
                        itemImage={item.ItemImage}
                        itemID={item.ItemID}
                        itemMRP={item.ItemPrice}
                        itemCount={item.ItemCount}
                        itemFavourite={item.ItemFavourite}
                    />
                </div>
            );
        }
        else{
            return (
                <div className="category-item-container" key={index} ref={lastItemRef}>
                    <ItemCard 
                        itemName={item.ItemName.PrimaryName}
                        itemImage={item.ItemImage}
                        itemID={item.ItemID}
                        itemMRP={item.ItemPrice}
                        itemCount={item.ItemCount}
                        itemFavourite={item.ItemFavourite}
                    />
                </div>
            );
        }
    });

    useEffect(()=>{
        setPage(1);
        // scroll to top
        window.scrollTo({
            top : 0
        });

        //then fetch catgeory data
        const categoryBody = {
            "categoryID" : location.state.categoryID
        }
        axios.post(`${domain}/category/banner`, categoryBody, {headers : {...ngrokHeader}})
        .then((response)=>{
            setCategoryData({CategoryBannerImage : response.data.categoryBannerImage});
        })
        .catch((err)=>{
            console.log(err.message);
        })

    },[location.state]);
    
    return (
        <div className="category-page-wrapper">
            <div className="category-page-container">
                <div className="category-banner-container">
                    <img src={categoryData.CategoryBannerImage} alt="Category Banner" className="category-banner-image" />
                </div>
                <div className="category-items-container">
                    {categoryItems}
                </div>
            </div>
        </div>
    );
}

export default Category;