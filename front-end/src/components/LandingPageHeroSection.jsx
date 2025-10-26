import HeroImage from "../assets/img/dental clinic assets/bg3.jpg";
import { useState, useEffect } from "react";
import CMS from "../API/CMS.jsx";
import { Link } from "react-router-dom";

const LandingPageHeroSection = () => {
    const [title, setTitle] = useState("");
    const [teethTagline, setTeethTagline] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const retriveDataTitle = async () => {
            try {
                const isProduction = import.meta.env.VITE_ENV === "production";
                const endpoint = isProduction ? `${import.meta.env.VITE_BASE_API_URL}/` : "/";

                const response = await CMS.get(endpoint);
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
        <section className="relative overflow-hidden bg-white py-60 xl:py-60 lg:py-70 md:py-70 sm:py-40">
            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Left content */}
                    <div className={`transition-all duration-700 ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                        <div className="max-w-lg">
                            <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-4xl font-bold text-gray-900 leading-tight mb-6">
                                {title}
                            </h1>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                                {teethTagline}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/PatientRegistration"
                                    className="px-8 py-4 bg-black hover:bg-gray-900 text-white font-medium rounded-md shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-center text-base"
                                >
                                    Schedule An Appointment
                                </Link>
                                <Link
                                    to="/services"
                                    className="px-8 py-4 border-2 text-black hover:bg-gray-50 hover:text-black font-medium rounded-md transition-all duration-200 text-center text-base"
                                >
                                    Our Services
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right image */}
                    <div className={`relative transition-all duration-700 delay-100 ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                        <div className="relative rounded-xl overflow-hidden shadow-xl">
                            <div className="aspect-w-4 aspect-h-3">
                                <img
                                    src={HeroImage}
                                    alt="Dental Clinic"
                                    className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-102"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-6 text-white">
                                <p className="text-sm font-medium text-indigo-200">Professional Care</p>
                                <h3 className="text-xl font-bold">Your Health, Our Commitment</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full -mt-16 -mr-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full -mb-32 -ml-32 opacity-50"></div>
        </section>
    );
};

export default LandingPageHeroSection;