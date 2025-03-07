import "../assets/css/main.css"
import "../assets/vendor/bootstrap/css/bootstrap.min.css"
import "../assets/vendor/bootstrap-icons/bootstrap-icons.css"
import "../assets/vendor/aos/aos.css"
import "../assets/js/main.js";
import "../assets/vendor/glightbox/css/glightbox.min.css"
import "../assets/vendor/swiper/swiper-bundle.min.css"
import "../assets/vendor/bootstrap/js/bootstrap.bundle.min.js";
import "../assets/vendor/imagesloaded/imagesloaded.pkgd.min.js"
import "../assets/vendor/isotope-layout/isotope.pkgd.min.js"
import AOS from "aos";
import { useEffect, useState } from "react";
import CMS from "../API/CMS.jsx";
import { Link } from "react-router-dom";
import toothlogo from "../assets/img/dental clinic assets/toothlogo3.png" 

const LandingPageHeader = () => {
    const [whatWeServeTitle, setWhatWeServeTitle] = useState("");

    useEffect(() => {
        const aos = () => {
            AOS.init({
                duration: 600,
                once: true
            })
        }
        aos();

        const retrieveWhatWeServeTitle = async () => {
            try {
                const response = await CMS.get("/CMS");
                if (!response.data || !response.data.whatWeServeTitle) {
                    throw new Error("No retrieved data what we serve title");
                } else {
                    setWhatWeServeTitle(response.data.whatWeServeTitle);
                }
            } catch (error) {
                console.error(`Code functionality error for fetching what we serve title: ${error}`);
            }
        }
        retrieveWhatWeServeTitle();

        return () => {
            AOS.refresh();
        }
    }, [])

    return (
        <header id="header" className="header d-flex align-items-center fixed-top">
            <div className="container-fluid container-xl position-relative d-flex align-items-center">

                <a href="/" className="logo d-flex align-items-center me-auto">
                    {/* <!-- Uncomment the line below if you also wish to use an image logo --> */}
                    <img src={toothlogo} className="mix-blend-luminosity" alt="Tooth Logo"/>
                    {/* <h1 className="sitename">DCMS</h1> */}
                </a>

                <nav id="navmenu" className="navmenu">
                    <ul>
                        <li><a href="/" className="active">Home</a></li>
                        <li><a href="#about">About</a></li>
                        <li><a href="#services">Services</a></li>
                        <li className="dropdown"><a href="#"><span>{whatWeServeTitle}</span> <i className="bi bi-chevron-down toggle-dropdown"></i></a>
                            <ul>
                                <li><a href="#">Dropdown 1</a></li>
                                <li className="dropdown"><a href="#"><span>Deep Dropdown</span> <i className="bi bi-chevron-down toggle-dropdown"></i></a>
                                    <ul>
                                        <li><a href="#">Deep Dropdown 1</a></li>
                                        <li><a href="#">Deep Dropdown 2</a></li>
                                        <li><a href="#">Deep Dropdown 3</a></li>
                                        <li><a href="#">Deep Dropdown 4</a></li>
                                        <li><a href="#">Deep Dropdown 5</a></li>
                                    </ul>
                                </li>
                                <li><a href="#">Dropdown 2</a></li>
                                <li><a href="#">Dropdown 3</a></li>
                                <li><a href="#">Dropdown 4</a></li>
                            </ul>
                        </li>
                        <li><a href="#contact">Contact</a></li>
                        <li>
                            <Link to={"/patients-portal"}>Patients Registration Portal</Link>
                        </li>
                        <li>
                            <Link to={"/patients-login"}>CMS Login Portal</Link>
                        </li>
                    </ul>
                    <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
                </nav>
            </div>
        </header>
    );
}

export default LandingPageHeader;