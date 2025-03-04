import LandingPageHeroSection from "./LandingPageHeroSection"
import LandingPageAboutSection from "./LandingPageAboutSection"
import LandingPageServices from "./LandingPageServices"
import ScrollTop from "./ScrollTop"
import LandingPageFeatures from "./LandingPageFeatures"
import LandingPageFooter from "./LandingPageFooter"
import LandingPageFAQ from "./LandingPageFAQ"
import LandingPageContact from "./LandingPageContact"
import LandingPageHeader from "./LandingPageHeader"
import {useEffect} from "react"
import {useLocation} from "react-router-dom"

const MainContent = () => {
    const location = useLocation();

    useEffect(() => {
        const TitleHeader = () => {
            document.title = "DCMS | Home"
        }
        TitleHeader();
    }, [location.pathname])
    
    return (
        <> 
            <LandingPageHeader />
            <main className="main">
                <LandingPageHeroSection />
                <LandingPageAboutSection />
                <LandingPageServices />
                <LandingPageFeatures />
                <LandingPageFAQ />
                <LandingPageContact />
                <LandingPageFooter />
            </main>
            <ScrollTop />
        </>
    )
}

export default MainContent;