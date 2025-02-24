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
// import "../assets/vendor/purecounter/purecounter_vanilla.js"
import "../assets/vendor/imagesloaded/imagesloaded.pkgd.min.js"
import "../assets/vendor/isotope-layout/isotope.pkgd.min.js"
import AOS from "aos"
import { useEffect } from "react"

const LandingPageFeatures = () => {
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
            {/* <!-- Features Section --> */}
            <section id="features" className="features section">
                {/* <!-- Section Title --> */}
                <div className="container section-title" data-aos="fade-up">
                    <h2>Features</h2>
                    <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p>
                </div>
                {/* <!-- End Section Title --> */}
                <div className="container">
                    <div className="row gy-4 justify-content-between">
                        <div className="features-image col-lg-5 order-lg-2 d-flex align-items-center" data-aos="fade-up" data-aos-delay="100">
                            <img src={FeaturesImage} className="img-fluid" alt="Features Image" />
                        </div>
                        <div className="col-lg-6 d-flex flex-column justify-content-center">
                            <div className="features-item d-flex ps-0 ps-lg-3 pt-4 pt-lg-0" data-aos="fade-up" data-aos-delay="200">
                                <i className="bi bi-archive flex-shrink-0"></i>
                                <div>
                                    <h4>Est labore ad</h4>
                                    <p>Consequuntur sunt aut quasi enim aliquam quae harum pariatur laboris nisi ut aliquip</p>
                                </div>
                            </div>
                            {/* <!-- End Features Item--> */}
                            <div className="features-item d-flex mt-5 ps-0 ps-lg-3" data-aos="fade-up" data-aos-delay="300">
                                <i className="bi bi-basket flex-shrink-0"></i>
                                <div>
                                    <h4>Harum esse qui</h4>
                                    <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt</p>
                                </div>
                            </div>
                            {/* <!-- End Features Item--> */}
                            <div className="features-item d-flex mt-5 ps-0 ps-lg-3" data-aos="fade-up" data-aos-delay="400">
                                <i className="bi bi-broadcast flex-shrink-0"></i>
                                <div>
                                    <h4>Aut occaecati</h4>
                                    <p>Aut suscipit aut cum nemo deleniti aut omnis. Doloribus ut maiores omnis facere</p>
                                </div>
                            </div>
                            {/* <!-- End Features Item--> */}
                            <div className="features-item d-flex mt-5 ps-0 ps-lg-3" data-aos="fade-up" data-aos-delay="500">
                                <i className="bi bi-camera-reels flex-shrink-0"></i>
                                <div>
                                    <h4>Beatae veritatis</h4>
                                    <p>Expedita veritatis consequuntur nihil tempore laudantium vitae denat pacta</p>
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