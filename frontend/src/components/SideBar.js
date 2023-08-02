import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function SideBar(props){

    const { isLoggedIn } = props;
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarNoSigninStyle = {
        "display" : "flex",
        "justifyContent" : "center",
        "alignItems" : "center"
    };
    const sidebarSigninStyle = {

    };

    function changeSidebarState(){
        setSidebarOpen(prevState=>!prevState);
    }

    function goToSignIn(){
        navigate("/sign-in");
        setSidebarOpen(prevState=>!prevState);
    }

    function goToHome(){
        navigate("/");
        setSidebarOpen(prevState=>!prevState);
    }

    function goToProfile(){
        navigate("/profile");
        setSidebarOpen(false);
    }

    function goToOrders(){
        navigate("/orders");
        setSidebarOpen(false);
    }

    function goToFavourites(){
        // navigate("/favourites");
    }

    function goToAboutUs(){
        navigate("/about-us");
    }

    function goToContactUs(){
        navigate("/contact-us", {state : {pathname : location.pathname}});
    }

    return (
        <div className="sidebar-wrapper">
            <div className={`sidebar-${!sidebarOpen ? "opening" : "closing"}-btn`} onClick={changeSidebarState}>
                <div className={`rectangle-bar1-${!sidebarOpen ? "opening" : "closing"}`}></div>
                <div className={`rectangle-bar2-${!sidebarOpen ? "opening" : "closing"}`}></div>
                <div className={`rectangle-bar3-${!sidebarOpen ? "opening" : "closing"}`}></div>
            </div>
            <div className="sidebar-container">
                <div className={`sidebar-overlay-${sidebarOpen ? "open" : "close"}`}></div>
                <div className={`sidebar-content-${sidebarOpen ? "open" : "close"}`} style={isLoggedIn ? sidebarSigninStyle : sidebarNoSigninStyle}>
                    {!isLoggedIn && <div className="sidebar-no-signin">
                        <div className="sidebar-no-signin-text">Not Signed In Yet?</div>
                        <div className="sidebar-signin-btn" onClick={goToSignIn}>Sign In</div>
                    </div>}
                    {isLoggedIn && <div className="sidebar-signedin">
                        <div className="sidebar-home-btn" onClick={()=>{
                            if(location.pathname !=="/") goToHome();
                        }}>
                            <div className="sidebar-home-btn-container">
                                <div className={`sidebar-home-icon ${location.pathname === "/" ? "sidebar-home-icon-active" : "sidebar-home-icon-inactive"}`}>
                                    <i className="fa-solid fa-house"></i>
                                </div>
                                <div className="sidebar-home-text">Home</div>
                            </div>
                            <div className="sidebar-home-border"></div>
                        </div>
                        <div className="sidebar-my-account">
                            <div className="sidebar-my-account-header-container">
                                <div className="sidebar-my-account-header">My Account</div>
                                <div className="sidebar-my-account-border"></div>
                            </div>
                            <div className="sidebar-profile-btn" onClick={goToProfile}>Profile</div>
                            <div className="sidebar-orders-btn" onClick={goToOrders}>Orders</div>
                            <div className="sidebar-Favourites" onClick={goToFavourites}>Favourites</div>
                        </div>
                        <div className="sidebar-help-support">
                            <div className="sidebar-help-support-header-container">
                                <div className="sidebar-help-support-header">Help & Support</div>
                                <div className="sidebar-help-support-border"></div>
                            </div>
                            <div className="sidebar-about-us" onClick={goToAboutUs}>About Us</div>
                            <div className="sidebar-contact-us" onClick={goToContactUs}>Contact Us</div>
                        </div>
                        <div className="sidebar-socials">
                            <div className="sidebar-socials-header-container">
                                <div className="sidebar-socials-header">Social Links</div>
                                <div className="sidebar-socials-border"></div>
                            </div>
                            <div className="sidebar-socials-icons">
                                <div className="sidebar-social-group1">
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
                                <div className="sidebar-social-group2">
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
                    </div>}
                </div>
            </div>
        </div>
    );
}

export default SideBar;