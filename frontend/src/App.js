import React, { useEffect, useContext } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation
} from "react-router-dom";
import { AppContext } from "./AppContext";
import "./App.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import MessageBox from "./components/MessageBox";
import SignIn from "./pages/Sign In/SignIn";
import Home from "./pages/Home/Home";
import Category from "./pages/Category/Category";
import ItemDetails from "./pages/Item Details/ItemDetails";
import SearchResults from "./pages/Search Results/SearchResults";
import AboutUs from "./pages/About Us/AboutUs";
import ContactUs from "./pages/Contact Us/ContactUs";
import Cart from "./pages/Cart/Cart";
import Shops from "./pages/Shops/Shops";
import Orders from "./pages/Orders/Orders";
import Profile from "./pages/Profile/Profile";
import axios from "axios";


function App() {

	const { setRazorpayKey, isLoggedIn, setIsLoggedIn, userDetails, setUserDetails, cartCount, domain, setCategories, accessToken, setAccessToken, ngrokHeader } = useContext(AppContext);
	const [colorPalate, setColorPalate] = React.useState({
		color0: "#FFFFFF",
		color1: "#FEEAE6",
		color2: "#FFC2C2",
		color3: "#FF7F7F",
		color4: "#FF4D4D",
		color5: "#D32F2F",
		color6: "#00001D"
	});

	useEffect(()=>{

		// fetch access token in local storage from reload event
		const tokenLocalStorage = JSON.parse(localStorage.getItem("accessToken"));
		localStorage.clear();
		if(tokenLocalStorage !== null){
			axios.get(`${domain}/user/get-details`, {headers : {"Authorization" : `Bearer ${tokenLocalStorage}`, ...ngrokHeader}})
			.then((response)=>{
				setIsLoggedIn(true);
				setAccessToken(tokenLocalStorage);
				setUserDetails(response.data.userDetails);
			})
			.catch((err)=>{
				console.log(err.message);
				console.log(err.response.data.errorMessage);
			})
		}

		// fetch all categories name and ID
		axios.get(`${domain}/category/all`, {headers : {...ngrokHeader}})
		.then((response)=>{
			setCategories(response.data.categories);
		})
		.catch((err)=>{
			console.log(err.message);
		})

		axios.get(`${domain}/payment/key`, {headers : {...ngrokHeader}})
		.then((response)=>{
			setRazorpayKey(response.data.key);
		})
		.catch((err)=>{
			console.log(err.message);
		})

	},[])

	useEffect(()=>{
		function handleReload(event){
			if(event.currentTarget.performance.navigation.type === 1 && isLoggedIn){
				localStorage.setItem("accessToken", JSON.stringify(accessToken));
			}
		}

		window.addEventListener("unload", handleReload);
		return ()=>{
			window.removeEventListener("unload", handleReload);
		}
	})

	return (
		<Router>
			<style>
				{
					`:root{
						--color-0: ${colorPalate.color0};
						--color-1: ${colorPalate.color1};
						--color-2: ${colorPalate.color2};
						--color-3: ${colorPalate.color3};
						--color-4: ${colorPalate.color4};
						--color-5: ${colorPalate.color5};
						--color-6: ${colorPalate.color6};
					}`
				}
			</style>
			<div className="app-container">
				<Routes>
					<Route path="/" element={
						<>
							<Navbar />
							<Home />
							<Footer />
						</>
					} />
					<Route path="/sign-in" element={<SignIn />} />
					<Route path="/category" element={
						<>
							<Navbar />
							<Category />
							<Footer />
						</>
					} />
					<Route path="/item-details" element={
						<>
							<Navbar />
							<ItemDetails />
							<Footer />
						</>
					} />
					<Route path="/search-results" element={
						<>
							<Navbar />
							<SearchResults />
							<Footer />
						</>
					}/>
					<Route path="/about-us" element={<AboutUs />} />
					<Route path="/contact-us" element={<ContactUs />} />
					{isLoggedIn && <Route path="/your-cart" element={
						<>
							<Navbar />
							<Cart />
							<Footer />
						</>
					} />}
					<Route path="/shops" element={<Shops />} />
					<Route path="/orders" element={
						<>
							<Navbar />
							<Orders />
							<Footer />
						</>
					}/>
					{isLoggedIn && <Route path="/profile" element={<Profile />} />}
				</Routes>
				<MessageBox />
			</div>
		</Router>
	);
}

export default App;