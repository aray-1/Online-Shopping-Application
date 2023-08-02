import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../AppContext";

function Footer(){

    const { categories } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();
    const categoryList = categories.map((category, index)=>{
        return (
            <div className="footer-category-container" key={category.CategoryID}>
                <div className="footer-category-bullet"></div>
                <div className="footer-category" onClick={()=>{goToCategory(category.CategoryID)}}>{category.CategoryName}</div>
            </div>
        );
    });

    const categoryList1 = categoryList.slice(0, Math.ceil(categoryList.length/2));
    const categoryList2 = categoryList.slice(Math.ceil(categoryList.length/2), categoryList.length);

    function goToTop(){
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }

    function goToCategory(categoryID){
        navigate("/category", {state : {categoryID : categoryID}});
    }

    function goToAboutUs(){
        navigate("/about-us");
    }

    function goToContactUs(){
        navigate("/contact-us", {state : {pathname : location.pathname}});
    }



    return (
        <div className="footer-container">
            <div className="back-to-top-btn" onClick={goToTop}>Back To Top</div>
            <div className="footer-bottom-container">
                <div className="footer-categories">
                    <div className="footer-category-header">Categories</div>
                    <div className="footer-category-list">
                        <div className="footer-categories-column1">{categoryList1}</div>
                        <div className="footer-categories-column2">{categoryList2}</div>
                    </div>
                </div>
                <div className="footer-column2">
                    <div className="footer-about-us" onClick={goToAboutUs}>About Us</div>
                    <div className="footer-contact-us" onClick={goToContactUs}>Contact Us</div>
                </div>
                <div className="footer-socials">
                    <div className="footer-socials-group1">
                        <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
                            <div className="facebook social-icon">
                                <i className="fa-brands fa-square-facebook"></i>
                            </div>
                        </a>
                        <a href="https://www.twitter.com" target="_blank" rel="noreferrer">
                            <div className="twitter social-icon">
                                <i className="fa-brands fa-square-twitter"></i>
                            </div>
                        </a>
                    </div>
                    <div className="footer-socials-group2">
                        <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
                            <div className="linkedin social-icon">
                                <i className="fa-brands fa-linkedin"></i>
                            </div>
                        </a>
                        <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
                            <div className="instagram social-icon">
                                <i className="fa-brands fa-square-instagram"></i>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
            <div className="footer-copyright">
                &copy; Ray Development. All Rights Reserved 2023.
            </div>
        </div>
    );
}

export default Footer;