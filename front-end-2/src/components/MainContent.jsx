import LandingPageHeroSection from "./LandingPageHeroSection"
import LandingPageAboutSection from "./LandingPageAboutSection"
import LandingPageServices from "./LandingPageServices"
import ScrollTop from "./ScrollTop"
import LandingPageFeatures from "./LandingPageFeatures"
import LandingPageFooter from "./LandingPageFooter"
import LandingPageFAQ from "./LandingPageFAQ"
import LandingPageContact from "./LandingPageContact"
import LandingPageHeader from "./LandingPageHeader"
// import purecounter from "@srexi/purecounterjs"
import {useEffect} from "react"
const MainContent = () => {
    useEffect(() => {
        const TitleHeader = () => {
            document.title = "CMS | Home"
        }
        TitleHeader();
    }, [])
    
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