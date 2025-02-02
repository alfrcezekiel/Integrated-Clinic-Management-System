import { useEffect } from "react";
import '../App.css';
import { Link, Outlet } from 'react-router-dom';
import Button from '../components/Button';
import { useState } from "react";
import EndpointURI from "../API/Endpoint";

function Home() {
    useEffect(() => {
        document.title = "Integrated Clinic Management System(ICMS)";
    }, [])

    const [logo, setLogo] = useState("");
    const [title, setTitle] = useState("");
    const [descriptionICMS, setDescriptionICMS] = useState("");
    
    useEffect(() => {
        const fetchLogoData = async () => {
            try {
                const response = await EndpointURI.get("/icms");
                if (!response.data || !response.data.logo || !response.data.title) {
                    throw new Error("Incomplete data received");
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
            <header className="header-container">
                <div className="logo-box">
                    <Link className="logo-text" to="/ICMS">{logo}</Link>
                    <Outlet />
                </div>
                <div className="navigation-box">
                    <nav className="navigation-links">
                        <ul>
                            <li>
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
        </>
    );
}
export default Home;