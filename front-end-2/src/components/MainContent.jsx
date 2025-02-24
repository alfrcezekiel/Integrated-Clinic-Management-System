import "../assets/css/main.css"
import "../assets/vendor/bootstrap/css/bootstrap.min.css"
import "../assets/vendor/bootstrap-icons/bootstrap-icons.css"
import "../assets/vendor/aos/aos.css"
import "../assets/vendor/glightbox/css/glightbox.min.css"
import "../assets/vendor/swiper/swiper-bundle.min.css"
import LandingPageHeroSection from "./LandingPageHeroSection"
import LandingPageAboutSection from "./LandingPageAboutSection"

const MainContent = () => {
    return (
        <>
            <main className="main">
                <LandingPageHeroSection />
                <LandingPageAboutSection />
            </main>
        </>
    )
}

export default MainContent;