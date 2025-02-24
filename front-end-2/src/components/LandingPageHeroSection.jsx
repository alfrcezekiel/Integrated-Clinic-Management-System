import "../assets/css/main.css"
import "../assets/vendor/bootstrap/css/bootstrap.min.css"
import "../assets/vendor/bootstrap-icons/bootstrap-icons.css"
import "../assets/vendor/aos/aos.css"
import "../assets/vendor/glightbox/css/glightbox.min.css" 
import "../assets/vendor/swiper/swiper-bundle.min.css"
import HeroImage from "../assets/img/hero-img.png"

const LandingPageHeroSection = () => {
    return (
        <>
            {/* <!-- Hero Section --> */}
            <section id="hero" className="hero section accent-background">

                <div className="container">
                    <div className="row gy-4">
                        <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center">
                            <h1>Bettter Digital Experience With Techie</h1>
                            <p>We are team of talented designers making websites with Bootstrap</p>
                            <div className="d-flex">
                                <a href="#about" className="btn-get-started">Get Started</a>
                            </div>
                        </div>
                        <div className="col-lg-6 order-1 order-lg-2 hero-img">
                            <img src={HeroImage} className="img-fluid animated" alt=""/>
                        </div>
                    </div>
                </div>

            </section> {/*<!-- /Hero Section -->*/}
        </>
    )
}

export default LandingPageHeroSection;