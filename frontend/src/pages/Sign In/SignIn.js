import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../AppContext";
import axios from "axios";
import "./SignIn.css";

function SignInBox(props){

    const { setRenderSignIn, setRenderForgotPassword, setRenderSignUp } = props;
    const navigate = useNavigate();
    const location = useLocation();
    const { setUserDetails, setIsLoggedIn, setAccessToken, domain, ngrokHeader } = useContext(AppContext);
    const [signinDetails, setSigninDetails] = useState({
        userName : "",
        password : ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [usernameLabelClass, setUsernameLabelClass] = useState("signin-username-label-down");
    const [passwordLabelClass, setPasswordLabelClass] = useState("signin-password-label-down");
    const [signinInvalidClass, setSigninInvalidClass] = useState("signin-invalid-hide");
    const [signinLoadingClass, setSigninLoadingClass] = useState("signin-no-loading");
    const [signinOverlayClass, setSigninOverlayClass] = useState("signin-no-overlay");

    function goBack(){
        const {prevPath, ...properties} = location.state || {prevPath : "/"};
        navigate(`${prevPath}`, {state : {...properties}});
    }

    function goToForgotPassword(){
        setRenderSignIn(false);
        setRenderForgotPassword(true);
    }

    function goToSignup(){
        setRenderSignIn(false);
        setRenderSignUp(true);
    }

    function handleShowPassword(){
        setShowPassword(prevState=>!prevState);
    }

    function handleUsernameFocus(){
        setUsernameLabelClass("signin-username-label-up");
    }

    function handleUsernameBlur(){
        if(!signinDetails.userName) setUsernameLabelClass("signin-username-label-down");
    }

    function handlePasswordFocus(){
        setPasswordLabelClass("signin-password-label-up");
    }

    function handlePasswordBlur(){
        if(!signinDetails.password) setPasswordLabelClass("signin-password-label-down");
    }

    function handlePaste(event){
        event.preventDefault();
    }

    function handleChange(event){
        setSigninInvalidClass("signin-invalid-hide");
        setSigninDetails(prevDetails=>{
            return {
                ...prevDetails,
                [event.target.name] : event.target.value
            }
        });
    }

    function handleSignin(){
        if(!signinDetails.userName || !signinDetails.password){
            setSigninInvalidClass("signin-invalid-display");
        }
        else{
            setSigninLoadingClass("signin-loading");
            setSigninOverlayClass("signin-overlay");
            axios.post(`${domain}/user/sign-in`, {userName : signinDetails.userName, password : signinDetails.password}, {headers : {...ngrokHeader}})
            .then((response)=>{
                setAccessToken(response.data.accessToken);
                setUserDetails(prevDetails=>{
                    return {
                        ...prevDetails,
                        userName : signinDetails.userName,
                        password : signinDetails.password,
                        email : response.data.email
                    }
                });
                setIsLoggedIn(true);
                setSigninLoadingClass("signin-no-loading");
                setSigninOverlayClass("signin-no-overlay");
                navigate("/");
            })
            .catch((err)=>{
                // for debugging of unforseen errors
                console.log(err.message);

                if(err.response.status === 501){
                    setSigninLoadingClass("signin-no-loading");
                    setSigninOverlayClass("signin-no-overlay");
                    setSigninInvalidClass("signin-invalid-display");
                    setSigninDetails(prevDetails=>{
                        return {
                            ...prevDetails,
                            userName : "",
                            password : ""
                        }
                    });
                    setUsernameLabelClass("signin-username-label-down");
                    setPasswordLabelClass("signin-password-label-down");
                }
            })
        }
    }

    return (
        <div className="signin-area">
            <div className={signinLoadingClass}></div>
            <div className={signinOverlayClass}></div>
            <div className="signin-back-icon" onClick={goBack}>
                <i className="fa-solid fa-arrow-left-long"></i>
            </div>
            <div className="signin-logo">RαყMαɾƚ</div>
            <div className="signin-header">Sign In</div>
            <div className={signinInvalidClass}>Invalid Username/Password</div>

            <div className="signin-username">
                <label htmlFor="signin-username" className={usernameLabelClass}>Username</label>
                <input type="text" id="signin-username" name="userName" className="signin-username-input" value={signinDetails.userName} onChange={handleChange} onFocus={handleUsernameFocus} onBlur={handleUsernameBlur} />
            </div>

            <div className="signin-password">
                <label htmlFor="signin-password" className={passwordLabelClass}>Password</label>
                <input type={showPassword ? "text" : "password"} id="signin-password" name="password" autoComplete="off" className="signin-password-input" value={signinDetails.password} onChange={handleChange} onFocus={handlePasswordFocus} onBlur={handlePasswordBlur} onPaste={handlePaste}/>
            </div>

            <div className="signin-show-forgot-password">
                <div className="signin-show-password">
                    <div tabIndex={0} className={`signin-show-password${showPassword ? "" : "-no"}-icon`} onClick={handleShowPassword}>
                        <i className="fa-solid fa-check"></i>
                    </div>
                    <span>Show Password</span>
                </div>
                <div className="signin-forgot-password" onClick={goToForgotPassword}>
                    <span>Forgot Password?</span>
                </div>
            </div>

            <button className="signin-btn" onClick={handleSignin}>Sign In</button>
            <div className="signin-create-account">
                <span onClick={goToSignup}>Create Account</span>
            </div>
        </div>
    );
}

function ForgotPasswordVerification(props){

    const { setRenderSignIn, setRenderForgotPassword } = props;
    const { setUserDetails, setIsLoggedIn, setAccessToken, domain, ngrokHeader } = useContext(AppContext);
    const navigate = useNavigate();
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [userOTP, setUserOTP] = useState("");
    const [forgotPasswordLabelClass, setForgotPasswordLabelClass] = useState("forgot-password-email-label-down");
    const [forgotPasswordNoEmailClass, setForgotPasswordNoEmailClass] = useState("forgot-password-no-email-hide");
    const [forgotPasswordNoEmailText, setForgotPasswordNoEmailText] = useState("Please enter an email ID")
    const [forgotPasswordLoadingClass, setForgotPasswordLoadingClass] = useState("forgot-password-no-loading");
    const [forgotPasswordOverlayClass, setForgotPasswordOverlayClass] = useState("forgot-password-no-overlay");
    const [forgotPasswordWrongOtpClass, setForgotPasswordWrongOtpClass] = useState("forgot-password-wrong-otp-hide")
    const [forgotPasswordWrongOtpText, setForgotPasswordWrongOtpText] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    function goToSignin(){
        setRenderSignIn(true);
        setRenderForgotPassword(false);
    }
    
    function handleEmailFocus(){
        setForgotPasswordLabelClass("forgot-password-email-label-up")
    }

    function handleEmailBlur(){
        if(!recoveryEmail) setForgotPasswordLabelClass("forgot-password-email-label-down");
    }
    
    function handleEmailChange(event){
        setForgotPasswordNoEmailClass("forgot-password-no-email-hide");
        setRecoveryEmail(event.target.value);
    }

    function handleOtpChange(event){
        setForgotPasswordWrongOtpClass("forgot-password-wrong-otp-hide");
        setForgotPasswordWrongOtpText("");
        if(event.target.value.length <= 6) setUserOTP(event.target.value);
    }

    function sendOtp(){
        if(!recoveryEmail) setForgotPasswordNoEmailClass("forgot-password-no-email-display");
        else{
            setForgotPasswordNoEmailClass("forgot-password-no-email-hide");
            setForgotPasswordLoadingClass("forgot-password-loading");
            setForgotPasswordOverlayClass("forgot-password-overlay");
            axios.post(`${domain}/user/forgot-password-otp`, {email : recoveryEmail}, {headers : {...ngrokHeader}})
            .then((response)=>{
                setOtpSent(true);
                setForgotPasswordLoadingClass("forgot-password-no-loading");
                setForgotPasswordOverlayClass("forgot-password-no-overlay");
            })
            .catch((err)=>{
                // for debugging of unforseen errors
                console.log(err.message);

                setRecoveryEmail("");
                setForgotPasswordLabelClass("forgot-password-email-label-down");
                setForgotPasswordNoEmailText(err.response.data.errorMessage);
                setForgotPasswordNoEmailClass("forgot-password-no-email-display");
                setForgotPasswordLoadingClass("forgot-password-no-loading");
                setForgotPasswordOverlayClass("forgot-password-no-overlay");
            })
        }
    }

    function verifyOtp(){
        setForgotPasswordLoadingClass("forgot-password-loading");
        setForgotPasswordOverlayClass("forgot-password-overlay");
        setForgotPasswordWrongOtpClass("forgot-password-wrong-otp-hide");
        axios.post(`${domain}/user/forgot-password-verify-otp`, {email : recoveryEmail, userOTP : userOTP}, {headers : {...ngrokHeader}})
        .then((response)=>{
            setForgotPasswordLoadingClass("forgot-password-no-loading");
            setForgotPasswordOverlayClass("forgot-password-no-overlay");
            setUserDetails(prevDetails=>{
                return {
                    ...prevDetails,
                    userName : response.data.userName,
                    password : response.data.password,
                    email : recoveryEmail
                }
            });
            setIsLoggedIn(true);
            setAccessToken(response.data.accessToken);
            navigate("/");
        })
        .catch((err)=>{
            // for debugging of unforseen errors
            console.log(err.message);

            setForgotPasswordWrongOtpText(err.response.data.errorMessage);
            setForgotPasswordLoadingClass("forgot-password-no-loading");
            setForgotPasswordOverlayClass("forgot-password-no-overlay");
            setForgotPasswordWrongOtpClass("forgot-password-wrong-otp-display");
        })
    }

    return (
        <div className="forgot-password-area">
            <div className="forgot-password-back-icon" onClick={goToSignin}>
                <i className="fa-solid fa-arrow-left-long"></i>
            </div>
            <div className={forgotPasswordLoadingClass}></div>
            <div className={forgotPasswordOverlayClass}></div>
            <div className="forgot-password-logo">RαყMαɾƚ</div>
            <div className="forgot-password-header">Forgot Password</div>

            <div className="forgot-password-email-container">
                <div className="forgot-password-information">Enter your registered email to receive OTP.</div>
                <div className="forgot-password-email">
                    <label htmlFor="forgot-password-email" className={forgotPasswordLabelClass}>Email</label>
                    <input type="email" id="forgot-password-email" className="forgot-password-email-input" value={recoveryEmail} onChange={handleEmailChange} onFocus={handleEmailFocus} onBlur={handleEmailBlur} />
                </div>
                <div className={forgotPasswordNoEmailClass}>{forgotPasswordNoEmailText}</div>
            </div>

            {otpSent && <div className="forgot-password-otp-container">
                <div className="forgot-password-otp">
                    <div className="forgot-password-otp-border"></div>
                    <input placeholder="Enter 6 digit OTP" className="forgot-password-otp-input" type="text" autoComplete="off" value={userOTP} onChange={handleOtpChange} />
                </div>
                <div className={forgotPasswordWrongOtpClass}>{forgotPasswordWrongOtpText}</div>
            </div>}

            {!otpSent && <button className="forgot-password-otp-btn" onClick={sendOtp}>Send OTP</button>}
            {otpSent && <div className="forgot-password-resend-otp"><span onClick={sendOtp}>Resend OTP</span></div>}
            <button className={otpSent ? "forgot-password-verify-otp-display" : "forgot-password-verify-otp-hide"}onClick={verifyOtp} >Verify</button>
        </div>
    );
}

function SignUpBox(props){

    const { setRenderSignIn, setRenderSignUp } = props;
    const { domain, ngrokHeader } = useContext(AppContext);
    const [signupDetails, setSignupDetails] = useState({
        userName : "",
        email : "",
        password : "",
        confirmPassword : ""
    });
    const [invalidUserClass, setInvalidUserClass] = useState("invalid-user-hide");
    const [invalidUserText, setInvalidUserText] = useState("");
    const [usernameLabelClass, setUsernameLabelClass] = useState("signup-username-label-down");
    const [emailLabelClass, setEmailLabelClass] = useState("signup-email-label-down");
    const [passwordLabelClass, setPasswordLabelClass] = useState("signup-password-label-down");
    const [confirmPasswordLabelClass, setConfirmPasswordLabelClass] = useState("signup-confirm-password-label-down");
    const [signupLoadingClass, setSignupLoadingClass] = useState("signup-no-loading");
    const [signupOverlayClass, setSignupOverlayClass] = useState("signup-no-overlay");
    const [showPassword, setShowPassword] = useState(false);
    const [takeDetails, setTakeDetails] = useState(true);

    const [signupOtp, setSignupOtp] = useState("");
    const [signupOtpBorderClass, setSignupOtpBorderClass] = useState("signup-otp-border-hide");
    const [signupWrongOtpClass, setSignupWrongOtpClass] = useState("signup-wrong-otp-hide");
    const [signupWrongOtpText, setSignupWrongOtpText] = useState("");

    function goToSignin(){
        setRenderSignIn(true);
        setRenderSignUp(false);
    }

    function goToSignup(){
        setTakeDetails(true);
    }
    
    function handleUsernameFocus(){
        setUsernameLabelClass("signup-username-label-up");
    }

    function handleUsernameBlur(){
        if(!signupDetails.userName) setUsernameLabelClass("signup-username-label-down");
    }

    function handleEmailFocus(){
        setEmailLabelClass("signup-email-label-up");
    }

    function handleEmailBlur(){
        if(!signupDetails.email) setEmailLabelClass("signup-email-label-down");
    }

    function handlePasswordFocus(){
        setPasswordLabelClass("signup-password-label-up");
    }

    function handlePasswordBlur(){
        if(!signupDetails.password) setPasswordLabelClass("signup-password-label-down");
    }

    function handleConfirmPasswordFocus(){
        setConfirmPasswordLabelClass("signup-confirm-password-label-up");
    }

    function handleConfirmPasswordBlur(){
        if(!signupDetails.confirmPassword) setConfirmPasswordLabelClass("signup-confirm-password-label-down");
    }

    function handleOtpFocus(){
        setSignupOtpBorderClass("signup-otp-border-display");
    }

    function handleOtpBlur(){
        if(!signupOtp) setSignupOtpBorderClass("signup-otp-border-hide");
    }

    function handleChange(event){
        if(invalidUserClass === "invalid-user-display"){
            setInvalidUserClass("invalid-user-hide");
            setInvalidUserText("");
        }
        setSignupDetails(prevDetails=>{
            return {
                ...prevDetails,
                [event.target.name] : event.target.value
            }
        });
    }

    function handleOtpChange(event){
        setSignupWrongOtpClass("signup-wrong-otp-hide");
        setSignupWrongOtpText("");
        if(event.target.value.length <= 6) setSignupOtp(event.target.value);
    }

    function toggleShowPassword(){
        setShowPassword(prevState=>!prevState);
    }

    function handlePaste(event){
        event.preventDefault();
    }

    function emailVerification(){
        if(!signupDetails.userName){
            setInvalidUserClass("invalid-user-display");
            setInvalidUserText("Username cannot be empty");
        }
        else if(!signupDetails.email){
            setInvalidUserClass("invalid-user-display");
            setInvalidUserText("Email cannot be empty");
        }
        else if(signupDetails.password.length < 8){
            setInvalidUserClass("invalid-user-display");
            setInvalidUserText("Password should contain atleast 8 characters");
        }
        else if(signupDetails.password !== signupDetails.confirmPassword){
            setInvalidUserClass("invalid-user-display");
            setInvalidUserText("Password and Confirm Password do not match.");
        }
        else{
            setInvalidUserClass("invalid-user-hide");
            setInvalidUserText("");
            setSignupLoadingClass("signup-loading");
            setSignupOverlayClass("signup-overlay");

            axios.post(`${domain}/user/sign-up-generate-otp`, {
                email : signupDetails.email,
                userName : signupDetails.userName,
                password : signupDetails.password
            }, {headers : {...ngrokHeader}})
            .then((response)=>{
                setTakeDetails(false);
                setSignupLoadingClass("signup-no-loading");
                setSignupOverlayClass("signup-no-overlay");
            })
            .catch((err)=>{
                // for debugging of unforseen errors
                console.log(err.message);

                setInvalidUserClass("invalid-user-display");
                setInvalidUserText(err.response.data.errorMessage);
                setSignupLoadingClass("signup-no-loading");
                setSignupOverlayClass("signup-no-overlay");
            })
        }
    }

    function resendSignupOtp(){
        setInvalidUserClass("invalid-user-hide");
        setInvalidUserText("");
        setSignupLoadingClass("signup-loading");
        setSignupOverlayClass("signup-overlay");

        axios.post(`${domain}/user/sign-up-resend-otp`, {email : signupDetails.email}, {headers : {...ngrokHeader}})
        .then((response)=>{
            setSignupLoadingClass("signup-no-loading");
            setSignupOverlayClass("signup-no-overlay");
        })
        .catch((err)=>{
            // for debugging of unforseen errors
            console.log(err.message);

            setSignupLoadingClass("signup-no-loading");
            setSignupOverlayClass("signup-no-overlay");
            setSignupWrongOtpClass("signup-wrong-otp-display");
            setSignupWrongOtpText(err.response.data.errorMessage);
        })
    }

    function verifySignupOtp(){
        if(signupOtp.length !== 6){
            setSignupWrongOtpClass("signup-wrong-otp-display");
            setSignupWrongOtpText("Wrong OTP");
        }
        else{
            setInvalidUserClass("invalid-user-hide");
            setInvalidUserText("");
            setSignupLoadingClass("signup-loading");
            setSignupOverlayClass("signup-overlay");
            axios.post(`${domain}/user/sign-up-verify-otp`, {
                userOTP : signupOtp,
                userName : signupDetails.userName,
                password : signupDetails.password,
                email : signupDetails.email
            }, {headers : {...ngrokHeader}})
            .then((response)=>{
                console.log(response.data);
                setRenderSignIn(true);
                setRenderSignUp(false);
                setSignupLoadingClass("signup-no-loading");
                setSignupOverlayClass("signup-no-overlay");
            })
            .catch((err)=>{
                // for debugging of unforseen errors
                console.log(err.message);

                setSignupLoadingClass("signup-no-loading");
                setSignupOverlayClass("signup-no-overlay");
                setSignupWrongOtpClass("signup-wrong-otp-display");
                setSignupWrongOtpText(err.response.data.errorMessage);
            })
        }
    }

    return (
        <div className="signup-area">
            {takeDetails && <div className="signup-details">
                <div className="signup-back-icon" onClick={goToSignin}>
                    <i className="fa-solid fa-arrow-left-long"></i>
                </div>
                <div className={signupLoadingClass}></div>
                <div className={signupOverlayClass}></div>
                <div className="signup-logo">RαყMαɾƚ</div>
                <div className="signup-header">Sign Up</div>
                <div className={invalidUserClass}>{invalidUserText}</div>
                <div className="signup-username">
                    <label htmlFor="signup-username" className={usernameLabelClass}>Username</label>
                    <input type="text" id="signup-username" name="userName" className="signup-username-input" value={signupDetails.userName} onChange={handleChange} onFocus={handleUsernameFocus} onBlur={handleUsernameBlur} />
                </div>

                <div className="signup-email">
                    <label htmlFor="signup-email" className={emailLabelClass}>Email</label>
                    <input type="text" id="signup-email" name="email" className="signup-email-input" value={signupDetails.email} onChange={handleChange} onFocus={handleEmailFocus} onBlur={handleEmailBlur} />
                </div>

                <div className="signup-password">
                    {showPassword && <div className="signup-show-password" onClick={toggleShowPassword}>
                        <i className="fa-solid fa-eye"></i>
                    </div>}
                    {!showPassword && <div className="signup-hide-password" onClick={toggleShowPassword}>
                        <i className="fa-solid fa-eye-slash"></i>
                    </div>}
                    <label htmlFor="signup-password" className={passwordLabelClass}>Password</label>
                    <input type={showPassword ? "text" : "password"} id="signup-password" name="password" className="signup-password-input" autoComplete="new-password" value={signupDetails.password} onChange={handleChange} onFocus={handlePasswordFocus} onBlur={handlePasswordBlur} onPaste={handlePaste}/>
                </div>

                <div className="signup-confirm-password">
                    <label htmlFor="signup-confirm-password" className={confirmPasswordLabelClass}>Confirm Password</label>
                    <input type="password" id="signup-confirm-password" name="confirmPassword" className="signup-confirm-password-input" value={signupDetails.confirmPassword} onChange={handleChange} onFocus={handleConfirmPasswordFocus} onBlur={handleConfirmPasswordBlur}  onPaste={handlePaste}/>
                </div>

                <button className="signup-next-btn" onClick={emailVerification}>Next</button>
            </div>}
            {!takeDetails && <div className="signup-verification">
                <div className="signup-verification-back-icon" onClick={goToSignup}>
                    <i className="fa-solid fa-arrow-left-long"></i>
                </div>
                <div className={signupLoadingClass}></div>
                <div className={signupOverlayClass}></div>
                <div className="signup-verification-logo">RαყMαɾƚ</div>
                <div className="signup-verification-header">Email Verification</div>
                <div className="signup-verification-information">Enter 6-digit OTP sent to your email</div>
                <div className="signup-verification-otp">
                    <div className={signupOtpBorderClass}></div>
                    <input placeholder="Enter 6-digit OTP" type="text" className="signup-otp-input" value={signupOtp} onChange={handleOtpChange} onFocus={handleOtpFocus} onBlur={handleOtpBlur} onPaste={handlePaste} />
                </div>
                <div className={signupWrongOtpClass}>{signupWrongOtpText}</div>
                <div className="signup-resend-otp"><span onClick={resendSignupOtp}>Resend OTP</span></div>
                <div className="signup-verify-otp" onClick={verifySignupOtp}>Verify</div>
            </div>}
        </div>
    );
}


function SignIn(){
    const [renderSignIn, setRenderSignIn] = useState(true);
    const [renderForgotPassword, setRenderForgotPassword] = useState(false);
    const [renderSignUp, setRenderSignUp] = useState(false);
    const functions = {
        setRenderSignIn,
        setRenderSignUp,
        setRenderForgotPassword
    }

    return (
        <div className="signin-container">
            {renderSignIn && <SignInBox {...functions} />}
            {renderForgotPassword && <ForgotPasswordVerification {...functions} />}
            {renderSignUp && <SignUpBox {...functions} />}
        </div>
    );
}

export default SignIn;