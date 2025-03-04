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
                    <p>Providing comprehensive and compassionate dental care to ensure your optimal oral health.</p>
                </div>
                {/* <!-- End Section Title --> */}
                <div className="container">
                    <div className="row gy-4">
                        <div className="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="100">
                            <div className="service-item d-flex">
                                <div className="icon flex-shrink-0"><i className="bi bi-briefcase"></i></div>
                                <div>
                                    <h4 className="title"><a href="#" className="stretched-link">General Dentistry</a></h4>
                                    <p className="description">Comprehensive dental exams, cleanings, and preventive care for all ages.</p>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Service Item --> */}
                        <div className="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="200">
                            <div className="service-item d-flex">
                                <div className="icon flex-shrink-0"><i className="bi bi-card-checklist"></i></div>
                                <div>
                                    <h4 className="title"><a href="#" className="stretched-link">Cosmetic Dentistry</a></h4>
                                    <p className="description">Enhance your smile with teeth whitening, veneers, and more.</p>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Service Item --> */}
                        <div className="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="300">
                            <div className="service-item d-flex">
                                <div className="icon flex-shrink-0"><i className="bi bi-bar-chart"></i></div>
                                <div>
                                    <h4 className="title"><a href="#" className="stretched-link">Orthodontics</a></h4>
                                    <p className="description">Straighten your teeth with traditional braces or clear aligners.</p>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Service Item --> */}
                        <div className="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="400">
                            <div className="service-item d-flex">
                                <div className="icon flex-shrink-0"><i className="bi bi-binoculars"></i></div>
                                <div>
                                    <h4 className="title"><a href="#" className="stretched-link">Pediatric Dentistry</a></h4>
                                    <p className="description">Specialized dental care for children to ensure healthy smiles from a young age.</p>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Service Item --> */}
                        <div className="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="500">
                            <div className="service-item d-flex">
                                <div className="icon flex-shrink-0"><i className="bi bi-brightness-high"></i></div>
                                <div>
                                    <h4 className="title"><a href="#" className="stretched-link">Emergency Dentistry</a></h4>
                                    <p className="description">Immediate care for dental emergencies, including toothaches and injuries.</p>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Service Item --> */}
                        <div className="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="600">
                            <div className="service-item d-flex">
                                <div className="icon flex-shrink-0"><i className="bi bi-calendar4-week"></i></div>
                                <div>
                                    <h4 className="title"><a href="#" className="stretched-link">Dental Implants</a></h4>
                                    <p className="description">Permanent solutions for missing teeth with natural-looking dental implants.</p>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Service Item --> */}
                    </div>
                </div>
            </section>
            {/* <!-- /Services Section --> */}
        </>
    )
}

export default LandingPageServices;