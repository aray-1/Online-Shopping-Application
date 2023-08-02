import React, { useContext, useState } from "react";
import { AppContext } from "../../AppContext";
import "./Profile.css";
import { useNavigate } from "react-router-dom";

function Profile(){

    const navigate = useNavigate();
    const { domain, userDetails } = useContext(AppContext);
    const [userName, setUserName] = useState(userDetails.userName);
    const [password, setPassword] = useState(userDetails.password);
    const [saveChangesOtp, setSaveChangesOtp] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [editUserName, setEditUserName] = useState(false);
    const [editPasssword, setEditPassword] = useState(false);
    const [verifyOtpPage, setVerifyOtpPage] = useState(false);
    const [profileOverlayClass, setProfileOverlayClass] = useState("profile-overlay-hide");
    const [profileLoadingClass, setProfileLoadingClass] = useState("profile-loading-hide");
    const [profileOtpBorderClass, setProfileOtpBorderClass] = useState("profile-otp-border-hide");
    const [profileWrongOtpClass, setProfileWrongOtpClass] = useState("profile-wrong-otp-hide");
    const [profileWrongOtpText, setProfileWrongOtpText] = useState("");
    
    function handleUserNameChange(event){
        setUserName(event.target.value);
    }

    function handlePasswordChange(event){
        setPassword(event.target.value);
    }

    function handleCopy(event){
        event.preventDefault();
    }

    function handlePaste(event){
        event.preventDefault();
    }

    function handleOtpChange(event){
        if(event.target.value.length <= 6) setSaveChangesOtp(event.target.value);
    }

    function handleOtpBlur(){
        if(saveChangesOtp.length === 0) setProfileOtpBorderClass("profile-otp-border-hide");
    }

    function handleOtpFocus(){
        setProfileOtpBorderClass("profile-otp-border-display");
    }


    function toggleShowPassword(){
        setShowPassword(prevState=>!prevState);
    }

    function toggleEditUserName(){
        setEditUserName(true);
    }

    function undoUserNameChange(){
        setUserName(userDetails.userName);
        setEditUserName(false);
    }

    function toggleEditPassword(){
        setEditPassword(true);
    }

    function undoPasswordChange(){
        setPassword(userDetails.password);
        setEditPassword(false);
    }

    function sendOTP(){
        // request for OTP
        // setProfileLoadingClass("profile-loading-display");
        // setProfileOverlayClass("profile-overlay-display");
        setVerifyOtpPage(true);
    }

    function resendOTP(){
        // do aomething
        // setProfileLoadingClass("profile-loading-display");
        // setProfileOverlayClass("profile-overlay-display");
    }

    function verifyOTP(){
        //
    }

    function goToProfile(){
        setVerifyOtpPage(false);
    }

    function goToHome(){
        navigate("/");
    }

    return (
        <div className="profile-container">
            {!verifyOtpPage && <div className="profile-main-area">
                <div className="profile-back-btn" onClick={goToHome}>
                    <i className="fa-solid fa-arrow-left-long"></i>
                </div>
                <div className={profileOverlayClass}></div>
                <div className={profileLoadingClass}></div>
                <div className="profile-logo">RαყMαɾƚ</div>
                <div className="profile-header">Profile</div>
                <div className="profile-email-container">
                    <div className="profile-email-label">Email</div>
                    <div className="profile-email-value">{userDetails.email}</div>
                </div>

                <div className="profile-username-container">
                    <div className="profile-username-label">Username</div>

                    {!editUserName && <div className="profile-username-input username-input-disable" onCopy={handleCopy}>{userName}</div>}

                    {editUserName && <input type="text" className="profile-username-input username-input-active" value={userName} onChange={handleUserNameChange} onCopy={handleCopy} onPaste={handlePaste}/>}

                    {!editUserName && <div className="profile-edit-btn" onClick={toggleEditUserName}>
                        <i className="fa-solid fa-pen-to-square"></i>
                    </div>}
                    {editUserName && <div className="profile-stop-edit-btn" onClick={undoUserNameChange}>
                        <i className="fa-solid fa-xmark"></i>
                    </div>}
                </div>

                <div className="profile-passsword-container">
                    <div className="profile-password-label">Passsword</div>
                    <div className="profile-password-input-container">
                        
                        {!editPasssword && <div className="profile-password-input password-input-disable" onCopy={handleCopy}>
                            {showPassword ? password : Array(password.length).fill(<span className="password-bullet"></span>)}
                        </div>}

                        {editPasssword && <input type={showPassword ? "text" : "password"} className="profile-password-input password-input-active" value={password} onChange={handlePasswordChange} onCopy={handleCopy} onPaste={handlePaste}/>}
                        
                        {!editPasssword && <div className="profile-edit-btn" onClick={toggleEditPassword}>
                            <i className="fa-solid fa-pen-to-square"></i>
                        </div>}

                        {editPasssword && <div className="profile-stop-edit-btn" onClick={undoPasswordChange}>
                            <i className="fa-solid fa-xmark"></i>
                        </div>}

                        {showPassword && <div className="profile-show-password" onClick={toggleShowPassword}>
                            <i className="fa-solid fa-eye"></i>
                        </div>}
                        {!showPassword &&  <div className="profile-hide-password" onClick={toggleShowPassword}>
                            <i className="fa-solid fa-eye-slash"></i>
                        </div>}
                    </div>
                </div>
                {(userName !== userDetails.userName || password !== userDetails.password) &&
                    <div className="profile-save-changes-btn" onClick={sendOTP}>Save Changes</div>}
            </div>}
            {verifyOtpPage && <div className="profile-main-area">
                <div className="profile-back-btn" onClick={goToProfile}>
                    <i className="fa-solid fa-arrow-left-long"></i>
                </div>
                <div className={profileLoadingClass}></div>
                <div className={profileOverlayClass}></div>
                <div className="profile-logo">RαყMαɾƚ</div>
                <div className="profile-header">Email Verification</div>
                <div className="profile-verification-information">Enter 6-digit OTP sent to your email</div>
                <div className="profile-verification-otp">
                    <div className={profileOtpBorderClass}></div>
                    <input placeholder="Enter 6-digit OTP" type="text" className="profile-otp-input" value={saveChangesOtp} onChange={handleOtpChange} onFocus={handleOtpFocus} onBlur={handleOtpBlur} onPaste={handlePaste} />
                </div>
                <div className={profileWrongOtpClass}>{profileWrongOtpText}</div>
                <div className="profile-resend-otp"><span onClick={resendOTP}>Resend OTP</span></div>
                <div className="profile-verify-otp" onClick={verifyOTP}>Verify</div>
            </div>}
        </div>
    );
}

export default Profile;