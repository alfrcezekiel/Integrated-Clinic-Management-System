import { useEffect } from "react";
import '../App.css';
import { Link, Outlet } from 'react-router-dom';
import Button from '../components/Button';
<<<<<<< HEAD
import { useState } from "react";
import EndpointURI from "../API/Endpoint";

function Home() {
    useEffect(() => {
        document.title = "Integrated Clinic Management System(ICMS)";
    }, [])
=======
import { useState, useRef} from "react";
import EndpointURI from "../API/Endpoint";
import {HashLink} from "react-router-hash-link";

function Home() {
    const [isSticky, setIsSticky] = useState(false);
    let lastScrollY = window.scrollY;

    const ref = useRef(0);

    useEffect(() => {
        const title = () => {
            document.title = "Integrated Clinic Management System(ICMS)";
        }
        title();

        const handleScroll = () => {
            if(window.scrollY > lastScrollY){
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }

            ref.current = lastScrollY;
        }
        
        window.addEventListener("scroll", handleScroll);
        
        return () => {
            window.removeEventListener("scroll", handleScroll);
        }
    }, [lastScrollY]);
>>>>>>> 9d3c371969277c2fa7b4fdfff5fa530d00f31763

    const [logo, setLogo] = useState("");
    const [title, setTitle] = useState("");
    const [descriptionICMS, setDescriptionICMS] = useState("");
    
    useEffect(() => {
        const fetchLogoData = async () => {
            try {
                const response = await EndpointURI.get("/icms");
<<<<<<< HEAD
                if (!response.data || !response.data.logo || !response.data.title) {
                    throw new Error("Incomplete data received");
=======
                if (!response.data || !response.data.logo || !response.data.title || !response.data.description) {
                    throw new Error("Cannot retrieve data in the server");
>>>>>>> 9d3c371969277c2fa7b4fdfff5fa530d00f31763
                }
                setLogo(response.data.logo);
                setTitle(response.data.title);
                setDescriptionICMS(response.data.description);
            } catch (error) {
                console.error(`Code functionality error for fetching logo data: ${error}`);
            }
        }
        fetchLogoData();
    }, []);

    return (
        <>
<<<<<<< HEAD
            <header className="header-container">
=======
            <header className={`header-container ${isSticky ? "sticky" : ""}`}>
>>>>>>> 9d3c371969277c2fa7b4fdfff5fa530d00f31763
                <div className="logo-box">
                    <Link className="logo-text" to="/ICMS">{logo}</Link>
                    <Outlet />
                </div>
                <div className="navigation-box">
                    <nav className="navigation-links">
                        <ul>
                            <li>
<<<<<<< HEAD
                                <Link className="link-text" to="/ICMS">Home</Link>
                            </li>
                            <li>
                                <Link className="link-text" to="/about">About</Link>
                            </li>
                            <li>
                                <Link className="link-text" to="#services">Services</Link>
                            </li>
                            <li id="login">
                                <Link className="link-text" to="/login">Login</Link>
=======
                                <HashLink className="link-text" smooth="true" to="#">Home</HashLink>
                            </li>
                            <li>
                                <HashLink className="link-text" smoooth="true" to="#about">About</HashLink>
                            </li>
                            <li>
                                <HashLink className="link-text" smooth="true" to="#services">Services</HashLink>
                            </li>
                            <li id="login">
                                <Link className="link-text" to="/login">Patients Login</Link>
>>>>>>> 9d3c371969277c2fa7b4fdfff5fa530d00f31763
                            </li>
                        </ul>
                    </nav>
                    <Outlet />
                </div>
            </header>
            <section className="main-content-container" id="home">
                <div className="home-content">
                    <div className="side-content">
                        <div className="icms-title">
                            <h1>{title}</h1>
                        </div>
                        <div className="icms-description">
                            <p>{descriptionICMS}</p>
                        </div>
                        <div className="button-container">
                            <Button name="Request Appointment" />
                        </div>
                    </div>
                </div>
            </section>
<<<<<<< HEAD
=======
            <section id="about" className="about-container">
                <h1>About</h1>
            </section>
            <section id="services" className="services-container">
                <h1>Services</h1>
            </section>
>>>>>>> 9d3c371969277c2fa7b4fdfff5fa530d00f31763
        </>
    );
}
export default Home;