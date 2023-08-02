import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useLoadSearchResults } from "../../custom-hooks";
import ItemCard from "../../components/ItemCard";
import "./SearchResults.css";

function SearchResults(){

    const location = useLocation();
    const limit = 12;
    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState("");
    const {searchItemsData, loading, hasMore} = useLoadSearchResults(searchText, page, limit);
    const observer = useRef();

    const lastItemRef = useCallback((node)=>{
        if(loading) return;
        if(observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries)=>{
            if(entries[0].isIntersecting && hasMore) setPage(prevPage => prevPage + 1);
        },{
            rootMargin : "150px"
        })

        if(node) observer.current.observe(node);
    }, [loading, hasMore]);

    const searchItems = searchItemsData.map((item, index)=>{
        if(index < searchItemsData.length - 1){
            return (
                <div className="search-item-container" key={item.ItemID}>
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
                <div className="search-item-container" key={item.ItemID} ref={lastItemRef}>
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
        window.scrollTo({
            top : 0
        });

        setSearchText(location.state.searchText);
        setPage(1);

    },[location.state]);

    return (
        <div className="search-results-wrapper">
            <div className="search-results-container">
                <div className="search-text-container">
                    <span className="search-text-header">Showing search results for :</span>
                    <span className="search-text">"{searchText}"</span>
                </div>
                <div className="search-items-container">
                    {searchItemsData.length > 0 ? searchItems : <div className="search-items-empty">No Items Found!</div>}
                </div>
            </div>
        </div>
    );
}

export default SearchResults;