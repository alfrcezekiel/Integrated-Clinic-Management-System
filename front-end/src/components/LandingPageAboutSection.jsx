import "../assets/css/main.css"
import "../assets/vendor/bootstrap/css/bootstrap.min.css"
import "../assets/vendor/bootstrap-icons/bootstrap-icons.css"
import "../assets/vendor/aos/aos.css"
import "../assets/vendor/glightbox/css/glightbox.min.css"
import "../assets/vendor/swiper/swiper-bundle.min.css"
import AboutImage from "../assets/img/about.jpg"
import AOS from "aos"
import { useEffect, useState } from "react"
import "../assets/js/main.js";
import "../assets/vendor/bootstrap/js/bootstrap.bundle.min.js";
import "../assets/vendor/glightbox/js/glightbox.min.js"
import "../assets/vendor/imagesloaded/imagesloaded.pkgd.min.js"
import "../assets/vendor/isotope-layout/isotope.pkgd.min.js"
import CMS from "../API/CMS.jsx"

const LandingPageAboutSection = () => {
    const [aboutTitle, setAboutTitle] = useState("");
    const [aboutDescription, setAboutDescription] = useState("");
    const [firstDescription, setFirstDescription] = useState("")
    const [secondDescription, setSecondDescription] = useState("")
    const [thirdDescription, setThirdDescription] = useState("");
    const [fourthDescription, setFourthDescription] = useState("")
    const [emergencyServies, setEmergencyServices] = useState("")

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

                if (!response.data || !response.data.title, !response.data.description) {
                    throw new Error("No retrieved data about title");
                } else {
                    setAboutTitle(response.data.title);
                    setAboutDescription(response.data.description);
                    setFirstDescription(response.data.firstDescription)
                    setSecondDescription(response.data.secondDescription)
                    setThirdDescription(response.data.thirdDescription)
                    setFourthDescription(response.data.fourthDescription);
                    setEmergencyServices(response.data.emergencyServices);
                }
            } catch (error) {
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
                            <img src={AboutImage} className="img-fluid" alt="about-image" />
                        </div>
                        <div className="col-lg-6 order-2 order-lg-1 content" data-aos="fade-up" data-aos-delay="200">
                            <h3>{aboutTitle}</h3>
                            <p className="fst-italic">
                                {aboutDescription}
                            </p>
                            <ul>
                                <li><i className="bi bi-check-circle"></i> <span>{firstDescription}</span></li>
                                <li><i className="bi bi-check-circle"></i> <span>{secondDescription}</span></li>
                                <li><i className="bi bi-check-circle"></i> <span>{thirdDescription}</span></li>
                                <li><i className="bi bi-check-circle"></i> <span>{fourthDescription}</span></li>
                                <li><i className="bi bi-check-circle"></i> <span>{emergencyServies}</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            {/* <!-- /About Section --> */}
        </>
    )
}

export default LandingPageAboutSection; 