import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../AppContext";
import "./ContactUs.css";
import axios from "axios";

function ContactUs() {

    const location = useLocation();
    const navigate = useNavigate();
    const { domain, ngrokHeader, userDetails, accessToken, isLoggedIn, setMessage, setShowMessage } = useContext(AppContext);
    const [prevPath, setPrevPath] = useState("/");
    const [contactInformation, setContactInformation] = useState({
        contactName: userDetails.userName,
        contactEmail: userDetails.email,
        contactMessage: ""
    })

    useEffect(() => {
        setPrevPath(location.state?.pathname ? location.state.pathname : "/");
    }, [])

    function goBack() {
        navigate(prevPath);
    }

    function handleChange(event) {
        setContactInformation(prevInformation => {
            return {
                ...prevInformation,
                [event.target.name]: event.target.value
            }
        })
    }

    function handleSubmit() {
        if(!isLoggedIn){
            setMessage("Please Login To Send A Message");
            setShowMessage(true);
            return;
        }
        else if(!contactInformation.contactMessage) {
            setMessage("Cannot Send An Empty Message");
            setShowMessage(true);
        }

        const requestBody = {
            "contactEmail" : contactInformation.contactEmail,
            "contactName" : contactInformation.contactName,
            "contactMessage" : contactInformation.contactMessage
        }

        const authHeader = {
            "Authorization" : `Bearer ${accessToken}`
        }

        axios.post(`${domain}/contact/send`, requestBody, {headers : {...authHeader, ...ngrokHeader}})
        .then((response)=>{
            setMessage(response.data.message);
            setShowMessage(true);
        })
        .catch((err)=>{
            console.log(err.message);
        })
    }

    return (
        <div className="contact-us-wrapper">
            <div className="back-btn" onClick={goBack}>
                <i className="fa-solid fa-arrow-left"></i>
            </div>
            <div className="contact-us-container">
                <div className="contact-us-information">
                    <div className="contact-us-information-blur"></div>
                    <div className="contact-us-introduction">
                        <div className="contact-us-introduction-header">Contact Us</div>
                        <div className="contact-us-introduction-text">
                            Whether you have a question, concern, or just want to say hello, we would love to hear from you. Don't hesitate to reach out to us using any of the methods listed below. We look forward to connecting with you!
                        </div>
                    </div>
                    <div className="contact-us-socials">
                        <div className="contact-us-socials-header">Follow Us</div>
                        <div className="contact-us-socials-icons">
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
                <div className="contact-us-form-area">
                    <label className="contact-us-name-label" htmlFor="contact-us-name-input">Name</label>
                    <input type="text" autoComplete="off" className="contact-us-name-input" id="contact-us-name-input" name="contactName" value={contactInformation.contactName} onChange={handleChange} />

                    <label className="contact-us-email-label" htmlFor="contact-us-email-input">Email</label>
                    <input type="email" autoComplete="off" className="contact-us-email-input" id="contact-us-email-input" name="contactEmail" value={contactInformation.contactEmail} onChange={handleChange} />

                    <label className="contact-us-message-label" htmlFor="contact-us-message-input">Message</label>
                    <textarea className="contact-us-message-input" id="contact-us-message-input" name="contactMessage" value={contactInformation.contactMessage} onChange={handleChange} />

                    <button className={`submit-btn${isLoggedIn ? "" : " submit-btn-inactive"}`} onClick={handleSubmit}>
                        Submit
                    </button>
                </div>
            </div>

        </div>
    );
}

export default ContactUs;