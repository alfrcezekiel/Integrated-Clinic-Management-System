import "../assets/css/main.css"
import "../assets/vendor/bootstrap/css/bootstrap.min.css"
import "../assets/vendor/bootstrap-icons/bootstrap-icons.css"
import "../assets/vendor/aos/aos.css"
import "../assets/vendor/glightbox/css/glightbox.min.css"
import "../assets/vendor/swiper/swiper-bundle.min.css"
import HeroImage from "../assets/img/dental clinic assets/bg3.jpg"
import "../assets/js/main.js";
import "../assets/vendor/bootstrap/js/bootstrap.bundle.min.js";
import "../assets/vendor/glightbox/js/glightbox.min.js"
import "../assets/vendor/imagesloaded/imagesloaded.pkgd.min.js"
import "../assets/vendor/isotope-layout/isotope.pkgd.min.js"
import AOS from "aos"
import { useState, useEffect } from "react"
import CMS from "../API/CMS.jsx"
import { Link } from "react-router-dom"

const LandingPageHeroSection = () => {
    const [title, setTitle] = useState("");
    const [teethTagline, setTeethTagline] = useState("");   

    useEffect(() => {
        const aos = () => {
            AOS.init({
                duration: 600,
                once: true
            })
        }
        aos();

        const retriveDataTitle = async () => {
            try {
                const response = await CMS.get("/CMS");
                if(!response.data || !response.data.title || !response.data.healthQuotes) {
                    throw new Error("No retrieved data title");
                } else {
                    setTitle(response.data.title);
                    setTeethTagline(response.data.healthQuotes);
                }
            } catch (error) {
                console.error(`Code functionality error for fetching data title: ${error}`);
            }
        }
        retriveDataTitle();

        return () => {
            AOS.refresh();
        }
    }, [])

    return (
        <>
            {/* <!-- Hero Section --> */}
            <section id="hero" className="hero section accent-background">

                <div className="container">
                    <div className="row gy-4">
                        <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center">
                            <h1>{title}</h1>
                            <p>{teethTagline}</p>
                            <div className="d-flex">
                                <Link className="btn-get-started" to={"/patients-portal"}>Request Appointment</Link>
                            </div>
                        </div>
                        <div className="col-lg-6 order-1 order-lg-2 hero-img">
                            <img src={HeroImage} className="img-fluid animated" alt="" />
                        </div>
                    </div>
                </div>
            </section> {/*<!-- /Hero Section -->*/}
        </>
    )
}

export default LandingPageHeroSection;