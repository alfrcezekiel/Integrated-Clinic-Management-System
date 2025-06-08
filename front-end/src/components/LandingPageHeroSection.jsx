import HeroImage from "../assets/img/dental clinic assets/bg3.jpg";
import { useState, useEffect } from "react";
import CMS from "../API/CMS.jsx";
import { Link } from "react-router-dom";

const LandingPageHeroSection = () => {
    const [title, setTitle] = useState("");
    const [teethTagline, setTeethTagline] = useState("");
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);
        const retriveDataTitle = async () => {
            try {
                const response = await CMS.get("/CMS");
                if (!response.data || !response.data.title || !response.data.healthQuotes) {
                    throw new Error("No retrieved data title");
                } else {
                    setTitle(response.data.title);
                    setTeethTagline(response.data.healthQuotes);
                }
            } catch (error) {
                console.error(`Error fetching data title: ${error}`);
            }
        };

        retriveDataTitle();
    }, []);

    return (
        <section
            id="hero"
            className="rounded-2xl bg-gradient-to-br from-purple-700 via-purple-500 to-purple-700 text-white py-20 h-[100vh] transition-all duration-700 ease-in-out transform"
        >
            <div className="container mx-auto px-6 md:px-12 h-full flex items-center justify-center">
                <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 w-full">
                    {/* Left content */}
                    <div className={`md:w-1/2 text-center md:text-left ${animate ? "animate-fade-in-left" : ""}`}>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 transition-transform duration-700 ease-in-out hover:scale-110">
                            {title}
                        </h1>
                        <p className="text-lg mb-6 text-white/90 transition-opacity duration-700 ease-in-out hover:opacity-90">
                            {teethTagline}
                        </p>
                        <Link
                            to="/PatientRegistration"
                            className="inline-block bg-blue-200 border-white text-black px-6 py-3 rounded-md hover:bg-blue-100 hover:text-purple-700 transition-colors duration-500 ease-in-out"
                        >
                            Schedule An Appointment
                        </Link>
                    </div>

                    {/* Right image */}
                    <div className={`md:w-1/2 flex justify-center ${animate ? "animate-fade-in-right" : ""}`}>
                        <img
                            src={HeroImage}
                            alt="Clinic Display"
                            className="max-w-full h-auto rounded-lg shadow-lg transition-transform duration-700 ease-in-out hover:scale-110"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LandingPageHeroSection;
