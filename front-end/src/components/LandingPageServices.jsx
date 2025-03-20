import "../assets/vendor/bootstrap/css/bootstrap.min.css"
import "../assets/vendor/bootstrap-icons/bootstrap-icons.css"
import "../assets/vendor/aos/aos.css"
import "../assets/vendor/swiper/swiper-bundle.min.css"
import "../assets/css/main.css"
import "../assets/vendor/glightbox/css/glightbox.min.css"
import "../assets/js/main.js";
import "../assets/vendor/bootstrap/js/bootstrap.bundle.min.js";
import "../assets/vendor/glightbox/js/glightbox.min.js"
// import "../assets/vendor/purecounter/purecounter_vanilla.js"
import "../assets/vendor/imagesloaded/imagesloaded.pkgd.min.js"
import "../assets/vendor/isotope-layout/isotope.pkgd.min.js"
import AOS from "aos"
import { useEffect } from "react"
const LandingPageServices = () => {
    useEffect(() => {
        const aos = () => {
            AOS.init({
                duration: 600,
                once: true
            })
        }
        aos();
        return () => {
            AOS.refresh();
        }
    }, [])

    return (
        <>
            {/* <!-- Services Section --> */}
            <section id="services" className="services section">
                {/* <!-- Section Title --> */}
                <div className="container section-title" data-aos="fade-up">
                    <h2>Services</h2>
                    <p>Providing comprehensive and compassionate healthcare to ensure your optimal well-being.</p>
                </div>
                {/* <!-- End Section Title --> */}
                <div className="container">
                    <div className="row gy-4">
                        <div className="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="100">
                            <div className="service-item d-flex">
                                <div className="icon flex-shrink-0"><i className="bi bi-heart-pulse"></i></div> {/* Icon for General Health Checkups */}
                                <div>
                                    <h4 className="title"><a href="#" className="stretched-link">General Health Checkups</a></h4>
                                    <p className="description">Comprehensive health exams, screenings, and preventive care for all ages.</p>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Service Item --> */}
                        <div className="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="200">
                            <div className="service-item d-flex">
                                <div className="icon flex-shrink-0"><i className="bi bi-clipboard2-pulse"></i></div> {/* Icon for Chronic Disease Management */}
                                <div>
                                    <h4 className="title"><a href="#" className="stretched-link">Chronic Disease Management</a></h4>
                                    <p className="description">Personalized care plans for managing diabetes, hypertension, and other chronic conditions.</p>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Service Item --> */}
                        <div className="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="300">
                            <div className="service-item d-flex">
                                <div className="icon flex-shrink-0"><i className="bi bi-emoji-smile"></i></div> {/* Icon for Pediatric Care */}
                                <div>
                                    <h4 className="title"><a href="#" className="stretched-link">Pediatric Care</a></h4>
                                    <p className="description">Specialized healthcare services for children to ensure healthy growth and development.</p>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Service Item --> */}
                        <div className="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="400">
                            <div className="service-item d-flex">
                                <div className="icon flex-shrink-0"><i className="bi bi-gender-female"></i></div> {/* Icon for Women's Health */}
                                <div>
                                    <h4 className="title"><a href="#" className="stretched-link">Women&apos;s Health</a></h4>
                                    <p className="description">Comprehensive care for women, including prenatal, gynecological, and wellness services.</p>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Service Item --> */}
                        <div className="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="500">
                            <div className="service-item d-flex">
                                <div className="icon flex-shrink-0"><i className="bi bi-exclamation-triangle"></i></div> {/* Icon for Emergency Care */}
                                <div>
                                    <h4 className="title"><a href="#" className="stretched-link">Emergency Care</a></h4>
                                    <p className="description">Immediate medical attention for emergencies, including injuries and acute illnesses.</p>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Service Item --> */}
                        <div className="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="600">
                            <div className="service-item d-flex">
                                <div className="icon flex-shrink-0"><i className="bi bi-clipboard2-data"></i></div> {/* Icon for Diagnostic Services */}
                                <div>
                                    <h4 className="title"><a href="#" className="stretched-link">Diagnostic Services</a></h4>
                                    <p className="description">Advanced diagnostic tools for accurate and timely health assessments.</p>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Service Item --> */}
                    </div>
                </div>
            </section>
            {/* <!-- /Services Section --> */}
        </>
    );
}

export default LandingPageServices;