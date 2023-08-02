import React from "react";
import "./AboutUs.css"

function AboutUs(){
    return (
        <div className="aboutus-container">
            <style>
                {
                    `body{
                        background-color : var(--color-0);
                    }`
                }
            </style>
            <div className="aboutus-header">
                <div className="aboutus-cart-icon">
                    <i className="fa-solid fa-cart-shopping"></i>
                </div>
                <div className="aboutus-website-logo">
                    <div className="r1">R</div>
                    <div className="a2">α</div>
                    <div className="y3">ყ</div>
                    <div className="m4">M</div>
                    <div className="a5">α</div>
                    <div className="r6">ɾ</div>
                    <div className="t7">ƚ</div>
                </div> 
                <svg className="aboutus-header-curve" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#FFFFFF" fill-opacity="1" d="M0,32L34.3,69.3C68.6,107,137,181,206,218.7C274.3,256,343,256,411,245.3C480,235,549,213,617,192C685.7,171,754,149,823,149.3C891.4,149,960,171,1029,192C1097.1,213,1166,235,1234,208C1302.9,181,1371,107,1406,69.3L1440,32L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path></svg>
            </div>

            <div className="aboutus-mission">
                <div className="aboutus-mission-header">Our Mission</div>
                <div className="aboutus-mission-text">At our online shopping website, we are committed to making your shopping experience as smooth and hassle-free as possible. Our mission is to provide easy access to high-quality products, including groceries, bathroom and kitchen accessories, and electronics, all in one convenient place. We believe in connecting customers directly with their preferred shops to place orders online, eliminating the need for physical visits and long waiting times. Our goal is to create a platform that is not only efficient but also reliable, so that you can shop with confidence and peace of mind. Come and experience the convenience of online shopping with us!</div>
            </div>
            
        </div>
    );
}

export default AboutUs;


{/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#0099ff" fill-opacity="1" d="M0,32L40,69.3C80,107,160,181,240,181.3C320,181,400,107,480,90.7C560,75,640,117,720,154.7C800,192,880,224,960,229.3C1040,235,1120,213,1200,170.7C1280,128,1360,64,1400,32L1440,0L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"></path></svg>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#00cba9" fill-opacity="1" d="M0,64L34.3,85.3C68.6,107,137,149,206,170.7C274.3,192,343,192,411,165.3C480,139,549,85,617,58.7C685.7,32,754,32,823,58.7C891.4,85,960,139,1029,186.7C1097.1,235,1166,277,1234,250.7C1302.9,224,1371,128,1406,80L1440,32L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path></svg> */}