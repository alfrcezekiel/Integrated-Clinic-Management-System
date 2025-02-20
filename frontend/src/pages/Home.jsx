import { useEffect } from "react";
import '../App.css';
import { Link, Outlet } from 'react-router-dom';
import Button from '../components/Button';
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

    const [logo, setLogo] = useState("");
    const [title, setTitle] = useState("");
    const [descriptionICMS, setDescriptionICMS] = useState("");
    
    useEffect(() => {
        const fetchLogoData = async () => {
            try {
                const response = await EndpointURI.get("/icms");
                if (!response.data || !response.data.logo || !response.data.title || !response.data.description) {
                    throw new Error("Cannot retrieve data in the server");
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
            <header className={`header-container ${isSticky ? "sticky" : ""}`}>
                <div className="logo-box">
                    <Link className="logo-text" to="/ICMS">{logo}</Link>
                    <Outlet />
                </div>
                <div className="navigation-box">
                    <nav className="navigation-links">
                        <ul>
                            <li>
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
            <section id="about" className="about-container">
                <h1>About</h1>
            </section>
            <section id="services" className="services-container">
                <h1>Services</h1>
            </section>
        </>
    );
}
export default Home;