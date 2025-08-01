import "../assets/css/main.css"
import "../assets/vendor/bootstrap/css/bootstrap.min.css"
import "../assets/vendor/bootstrap-icons/bootstrap-icons.css"
import "../assets/vendor/aos/aos.css"
import "../assets/vendor/glightbox/css/glightbox.min.css"
import "../assets/vendor/swiper/swiper-bundle.min.css"
import FeaturesImage from "../assets/img/features.svg"
import "../assets/js/main.js";
import "../assets/vendor/bootstrap/js/bootstrap.bundle.min.js";
import "../assets/vendor/glightbox/js/glightbox.min.js"
import "../assets/vendor/imagesloaded/imagesloaded.pkgd.min.js"
import "../assets/vendor/isotope-layout/isotope.pkgd.min.js"
import AOS from "aos"
import { useEffect, useState } from "react"
import CMS from "../API/CMS.jsx"

const LandingPageFeatures = () => {
    const [featuresTitle, setFeaturesTitle] = useState("");
    const [ehrText, setEhrText] = useState("");
    const [appointmentText, setAppointmentText] = useState("")
    const [paymentText, setPaymentText] = useState("")
    const [inventoryText, setInventoryText] = useState("")

    useEffect(() => {
        const aos = () => {
            AOS.init({
                duration: 600,
                once: true
            })
        }
        aos();

        const retrieveDataFeatures = async () => {
            const response = await CMS.get("/CMS");

            if (!response.data || !response.data.featuresTitle || !response.data.ehrText || !response.data.appointmentSchedulingText || !response.data.paymentIntegrationText || !response.data.inventoryText) {
                throw new Error("No retrieved data features in server");
            } else {
                setFeaturesTitle(response.data.featuresTitle);
                setEhrText(response.data.ehrText);
                setAppointmentText(response.data.appointmentSchedulingText);
                setPaymentText(response.data.paymentIntegrationText);
                setInventoryText(response.data.inventoryText);
            }
        }
        retrieveDataFeatures();

        return () => {
            AOS.refresh();
        }
    }, [])

    return (
        <>
            {/* <!-- Features Section --> */}
            <section id="features" className="features section">
                {/* <!-- Section Title --> */}
                <div className="container section-title" data-aos="fade-up">
                    <h2>{featuresTitle}</h2>
                    <p>Streamline your clinic operations with our advanced features designed to improve patient care and reduce administrative tasks.</p>
                </div>
                {/* <!-- End Section Title --> */}
                <div className="container">
                    <div className="row gy-4 justify-content-between">
                        <div className="features-image col-lg-5 order-lg-2 d-flex align-items-center" data-aos="fade-up" data-aos-delay="100">
                            <img src={FeaturesImage} className="img-fluid" alt="Features Image" />
                        </div>
                        <div className="col-lg-6 d-flex flex-column justify-content-center">
                            {/* EHR Feature */}
                            <div className="features-item d-flex ps-0 ps-lg-3 pt-4 pt-lg-0" data-aos="fade-up" data-aos-delay="200">
                                <i className="bi bi-file-earmark-medical flex-shrink-0"></i>
                                <div>
                                    <h4>{ehrText}</h4>
                                    <p>Securely store and manage patient records, treatment history, and prescriptions with our comprehensive EHR system.</p>
                                </div>
                            </div>
                            {/* <!-- End Features Item--> */}

                            {/* Appointment Feature */}
                            <div className="features-item d-flex mt-5 ps-0 ps-lg-3" data-aos="fade-up" data-aos-delay="300">
                                <i className="bi bi-calendar-check flex-shrink-0"></i>
                                <div>
                                    <h4>{appointmentText}</h4>
                                    <p>Easily book, reschedule, and manage patient appointments with an intuitive scheduling system that reduces no-shows.</p>
                                </div>
                            </div>
                            {/* <!-- End Features Item--> */}

                            {/* Payment Feature */}
                            <div className="features-item d-flex mt-5 ps-0 ps-lg-3" data-aos="fade-up" data-aos-delay="400">
                                <i className="bi bi-credit-card flex-shrink-0"></i>
                                <div>
                                    <h4>{paymentText}</h4>
                                    <p>Streamline billing with automated invoicing, insurance claims, and multiple payment options for a hassle-free experience.</p>
                                </div>
                            </div>
                            {/* <!-- End Features Item--> */}

                            {/* Inventory Feature */}
                            <div className="features-item d-flex mt-5 ps-0 ps-lg-3" data-aos="fade-up" data-aos-delay="500">
                                <i className="bi bi-clipboard-data flex-shrink-0"></i>
                                <div>
                                    <h4>{inventoryText}</h4>
                                    <p>Track and manage dental supplies efficiently to prevent shortages and ensure smooth clinic operations.</p>
                                </div>
                            </div>
                            {/* <!-- End Features Item--> */}
                        </div>
                    </div>
                </div>
            </section>
            {/* <!-- /Features Section --> */}
        </>
    )
}

export default LandingPageFeatures;