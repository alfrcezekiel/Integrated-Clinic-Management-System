import AboutImage from "../assets/img/about.jpg"
import AOS from "aos"
import { useEffect, useState } from "react"
import CMS from "../API/CMS.jsx"
import { CheckCircleIcon } from "@heroicons/react/24/outline"
import ScrollLink from "./Scroll_Link/scroll_link.jsx";

const LandingPageAboutSection = () => {
    const [aboutTitle, setAboutTitle] = useState("");
    const [aboutDescription, setAboutDescription] = useState("");
    const [firstDescription, setFirstDescription] = useState("")
    const [secondDescription, setSecondDescription] = useState("")
    const [thirdDescription, setThirdDescription] = useState("");
    const [fourthDescription, setFourthDescription] = useState("")
    const [emergencyServices, setEmergencyServices] = useState("")

    useEffect(() => {
        const aos = () => {
            AOS.init({
                duration: 600,
                once: true
            })
        }
        aos();

        const retrieveDataAboutTitle = async () => {
            try {
                const response = await CMS.get("/");

                if (!response.data || !response.data.title, !response.data.description) {
                    throw new Error("No retrieved data about title");
                } else {
                    setAboutTitle(response.data.title);
                    setAboutDescription(response.data.description);
                    setFirstDescription(response.data.firstDescription)
                    setSecondDescription(response.data.secondDescription)
                    setThirdDescription(response.data.thirdDescription)
                    setFourthDescription(response.data.fourthDescription);
                    setEmergencyServices(response.data.emergencyServices);
                }
            } catch (error) {
                console.error(`Error fetching data: ${error}`);
            }
        }
        retrieveDataAboutTitle();
        return () => {
            AOS.refresh();
        };
    }, [])

    return (
        <section id="about" className="bg-white py-16 md:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Image Section */}
                    <div
                        className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-500"
                        data-aos="fade-right"
                        data-aos-delay="100"
                    >
                        <img
                            src={AboutImage}
                            alt="About our clinic"
                            className="w-full h-auto object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
                    </div>

                    {/* Content Section */}
                    <div
                        className="space-y-6"
                        data-aos="fade-left"
                        data-aos-delay="200"
                    >
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                            {aboutTitle}
                        </h2>

                        <p className="text-lg text-gray-600">
                            {aboutDescription}
                        </p>

                        <ul className="space-y-4">
                            {[firstDescription, secondDescription, thirdDescription, fourthDescription, emergencyServices].map((item, index) => (
                                item && (
                                    <li key={index} className="flex items-start space-x-3">
                                        <CheckCircleIcon className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-1" />
                                        <span className="text-gray-700">{item}</span>
                                    </li>
                                )
                            ))}
                        </ul>

                        <div className="pt-4">
                            <ScrollLink
                                to="/cms"
                                targetId="contact"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors duration-200"
                            >
                                Contact Us
                                <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </ScrollLink>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default LandingPageAboutSection;