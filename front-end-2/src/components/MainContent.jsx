import LandingPageHeroSection from "./LandingPageHeroSection"
import LandingPageAboutSection from "./LandingPageAboutSection"
import LandingPageServices from "./LandingPageServices"
import ScrollTop from "./ScrollTop"

const MainContent = () => {
    return (
        <>
            <main className="main">
                <LandingPageHeroSection />
                <LandingPageAboutSection />
                <LandingPageServices />
            </main>
            <ScrollTop />
        </>
    )
}

export default MainContent;