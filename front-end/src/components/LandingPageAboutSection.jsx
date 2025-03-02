import "../assets/css/main.css"
import "../assets/vendor/bootstrap/css/bootstrap.min.css"
import "../assets/vendor/bootstrap-icons/bootstrap-icons.css"
import "../assets/vendor/aos/aos.css"
import "../assets/vendor/glightbox/css/glightbox.min.css"
import "../assets/vendor/swiper/swiper-bundle.min.css"
import AboutImage from "../assets/img/about.jpg"
import AOS from "aos"
import { useEffect, useState} from "react"
import "../assets/js/main.js";
import "../assets/vendor/bootstrap/js/bootstrap.bundle.min.js";
import "../assets/vendor/glightbox/js/glightbox.min.js"
import "../assets/vendor/imagesloaded/imagesloaded.pkgd.min.js"
import "../assets/vendor/isotope-layout/isotope.pkgd.min.js"
import CMS from "../API/CMS.jsx"

const LandingPageAboutSection = () => {
    const [aboutTitle, setAboutTitle] = useState("");
    const [aboutDescription, setAboutDescription] = useState("");  

    useEffect(() => {
        const aos = () => {
            AOS.init({
                duration: 600,
                once: true
            })
        }
        aos();

        const retrieveDataAboutTitle = async () => {
            try {
                const response = await CMS.get("/CMS");

                if(!response.data || !response.data.title, !response.data.description) {
                    throw new Error("No retrieved data about title");
                } else {
                    setAboutTitle(response.data.title);
                    setAboutDescription(response.data.description);
                }
            } catch(error) {
                console.error(`Code functionality error for fetching data about title: ${error}`);
            }
        }
        retrieveDataAboutTitle();
        return () => {
            AOS.refresh();
        };
    }, [])

    return (
        <>
            {/* <!-- About Section --> */}
            <section id="about" className="about section">
                <div className="container">
                    <div className="row gy-4">
                        <div className="col-lg-6 order-1 order-lg-2" data-aos="fade-up" data-aos-delay="100">
                            <img src={AboutImage} className="img-fluid" alt="about-image"/>
                        </div>
                        <div className="col-lg-6 order-2 order-lg-1 content" data-aos="fade-up" data-aos-delay="200">
                            <h3>{aboutTitle}</h3>
                            <p className="fst-italic">
                                {aboutDescription}
                            </p>
                            <ul>
                                <li><i className="bi bi-check-circle"></i> <span>Ullamco laboris nisi ut aliquip ex ea commodo consequat.</span></li>
                                <li><i className="bi bi-check-circle"></i> <span>Duis aute irure dolor in reprehenderit in voluptate velit.</span></li>
                                <li><i className="bi bi-check-circle"></i> <span>Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate trideta storacalaperda mastiro dolore eu fugiat nulla pariatur.</span></li>
                            </ul>
                            <a href="#" className="read-more"><span>Read More</span><i className="bi bi-arrow-right"></i></a>
                        </div>
                    </div>
                </div>
            </section>
            {/* <!-- /About Section --> */}
        </>
    )
}

export default LandingPageAboutSection; 