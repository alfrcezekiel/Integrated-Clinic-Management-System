import LandingPageHeroSection from "./LandingPageHeroSection"
import LandingPageAboutSection from "./LandingPageAboutSection"
import LandingPageServices from "./LandingPageServices"
import ScrollTop from "./ScrollTop"
import LandingPageFeatures from "./LandingPageFeatures"
import LandingPageFooter from "./LandingPageFooter"
import LandingPageFAQ from "./LandingPageFAQ"
import LandingPageContact from "./LandingPageContact"
import LandingPageHeader from "./LandingPageHeader"
import {useEffect, useRef} from "react"
import {useLocation} from "react-router-dom"

const MainContent = () => {
    const location = useLocation();
    const ref = useRef(0);
    useEffect(() => {
        const TitleHeader = () => {
            document.title = "Clinic Management System | CMS"
        }
        TitleHeader();

        const scrollToTop = () => {
            ref.current = window.scrollY;

            const timer = setTimeout(() => {
                window.scrollTo(0, ref.current);
            }, 2000);

            return () => {
                clearTimeout(timer);
            }
        }
        scrollToTop();

        
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