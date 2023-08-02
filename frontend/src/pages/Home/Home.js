import React, { useEffect, useContext, useRef, useMemo } from "react";
import ItemCard from "../../components/ItemCard";
import CategoryCard from "../../components/CategoryCard";
import { AppContext } from "../../AppContext";
import axios from "axios";
import "./Home.css";


function Banner(props){

    const { bannerDetails } = props;
    const timeOut = useRef(null);
    const [bannerMoveDetail, setBannerMoveDetail] = React.useState({
        bannerIndex : 0,
        clickSide : "right"
    });
    const [autoPlay, setAutoPlay] = React.useState(true);

    const bannerCards = bannerDetails.map((banner, index)=>{
        function getBannerClass(index){
            let prevIndex;
            if(bannerMoveDetail.clickSide === "right"){
                prevIndex = bannerMoveDetail.bannerIndex === 0 ? bannerDetails.length - 1 : bannerMoveDetail.bannerIndex - 1;
            }
            else if(bannerMoveDetail.clickSide === "left"){
                prevIndex = bannerMoveDetail.bannerIndex === bannerDetails.length - 1 ? 0 : bannerMoveDetail.bannerIndex + 1; 
            }

            if(index === prevIndex && bannerMoveDetail.clickSide === "right"){
                return "banner-out-left banner-card";
            }
            else if(index === prevIndex && bannerMoveDetail.clickSide === "left"){
                return "banner-out-right banner-card";
            }
            else if(index === bannerMoveDetail.bannerIndex && bannerMoveDetail.clickSide === "right"){
                return "banner-in-right banner-card";
            }
            else if(index === bannerMoveDetail.bannerIndex && bannerMoveDetail.clickSide === "left"){
                return "banner-in-left banner-card";
            }
            else{
                return "banner-card banner-inactive";
            }
        }

        return (
            <div className={getBannerClass(index)} key={index}>
                <img src={banner.BannerImage} alt="" className="banner-card-image" />
            </div>
        );
    });


    useEffect(()=>{
        timeOut.current = autoPlay && setTimeout(() => {
            goRight();
        }, 5000);

        return ()=>{
            clearTimeout(timeOut.current);
        }
    });

    function goLeft(){
        setBannerMoveDetail((prevBannerDetail)=>{
            return {
                ...prevBannerDetail,
                bannerIndex : prevBannerDetail.bannerIndex === 0 ? bannerDetails.length - 1 : prevBannerDetail.bannerIndex - 1,
                clickSide : "left"
            }
        });
    }

    function goRight(){
        setBannerMoveDetail((prevBannerDetail)=>{
            return {
                ...prevBannerDetail,
                bannerIndex : prevBannerDetail.bannerIndex === bannerDetails.length - 1 ? 0 : prevBannerDetail.bannerIndex + 1,
                clickSide : "right"
            }
        });
    }

    return (
        <div className="banner-container" onMouseEnter={()=>{setAutoPlay(false);clearTimeout(timeOut);}} onMouseLeave={()=>{setAutoPlay(true)}}>
            <div className="banner-arrow-left" onClick={goLeft}>
                <i className="fa-solid fa-chevron-left"></i>
            </div>
            <div className="banner-arrow-right" onClick={goRight}>
                <i className="fa-solid fa-chevron-right"></i>
            </div>
            {bannerCards}
        </div>
    );
}


function Home(){
    
    const { domain, ngrokHeader, accessToken, isLoggedIn } = useContext(AppContext);
    const [bannerDetails, setBannerDetails] = React.useState([{
        BannerName : "",
        BannerImage : "",
        BannerID : ""
    }]);
    const [topItemDetails, setTopItemDetails] = React.useState([]);
    const [topCategoryDetails, setTopCategoryDetails] = React.useState([]);

    const topItems = useMemo(()=>{
        return topItemDetails.map((item)=>{
            return (
                <div className="home-top-item-card-container" key={item.ItemID}>
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

    },[topItemDetails])

    const topCategories = useMemo(()=>{
        return topCategoryDetails.map((category)=>{
            return (
                <div className="home-top-category-card-container" key={category.CategoryID}>
                    <CategoryCard
                        categoryName={category.CategoryName}
                        categoryImage={category.CategoryImage}
                        categoryID={category.CategoryID}
                    />
                </div>
            );
        });

    },[topCategoryDetails])


    useEffect(()=>{

        // fetch banner data
        axios.get(`${domain}/banner/`, {headers : {...ngrokHeader}})
        .then((response)=>{
            const bannerData = response.data.banners;
            setBannerDetails(bannerData);
        })
        .catch((err)=>{
            console.log(err.message);
        })

        // fetch top items data
        const topItemsBody = {
            "topItemsCount" : 10
        }
        const authHeader = {
            "Authorization" : `Bearer ${accessToken}`
        }

        if(isLoggedIn){
            axios.post(`${domain}/item/top`, topItemsBody, {headers : {...authHeader, ...ngrokHeader}})
            .then((response)=>{
                setTopItemDetails(response.data.topItems);
            })
            .catch((err)=>{
                console.log(err.message);
            })
        }
        else{
            axios.post(`${domain}/item/top`, topItemsBody, {headers : {...ngrokHeader}})
            .then((response)=>{
                setTopItemDetails(response.data.topItems);
            })
            .catch((err)=>{
                console.log(err.message);
            })
        }

        // fetch top Categories Data
        const topCategoriesBody = {
            "topCategoriesCount" : 3
        }
        axios.post(`${domain}/category/top`, topCategoriesBody, {headers : {...ngrokHeader}})
        .then((response)=>{
            setTopCategoryDetails(response.data.topCategories);
        })
        .catch((err)=>{
            console.log(err.message);
        })

    },[])


    return (
        <div className="home-container">
            <Banner 
                bannerDetails={bannerDetails}
            />
            <div className="home-top-items-container">
                <div className="home-top-items-header">Top Items</div>
                <div className="home-top-item-cards">
                    {topItems}
                </div>
            </div>
            <div className="home-top-categories-container">
                <div className="home-top-categories-header">Top Categories</div>
                <div className="home-top-category-cards">
                    {topCategories}
                </div>
            </div>
        </div>
    );
}

export default Home;