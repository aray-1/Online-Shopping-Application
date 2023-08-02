import React from "react";
import { useNavigate } from "react-router-dom";

function CategoryCard(props){
    const navigate = useNavigate();
    const {categoryImage, categoryName, categoryID} = props;

    function goToCategory(){
        navigate("/category", {state : {categoryID : categoryID}});
    }

    return (
        <div className="category-container">
            <div className="category-image-container">
                <img src={categoryImage} alt="" className="category-image" onClick={goToCategory}/>
            </div>
            <div className="category-text-container" onClick={goToCategory}>
                {categoryName}
            </div>
        </div>
    );
}

export default CategoryCard;