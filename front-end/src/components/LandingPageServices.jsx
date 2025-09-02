import AOS from "aos"
import { useEffect } from "react"

const services = [
    {
        id: 1,
        icon: "bi-heart-pulse",
        title: "Primary Care",
        description: "Comprehensive primary care services for patients of all ages, including annual physicals, immunizations, and preventive care.",
        delay: "100"
    },
    {
        id: 2,
        icon: "bi-clipboard2-pulse",
        title: "Chronic Disease Management",
        description: "Personalized treatment plans for chronic conditions like diabetes, hypertension, and heart disease.",
        delay: "150"
    },
    {
        id: 3,
        icon: "bi-thermometer",
        title: "Urgent Care",
        description: "Immediate medical attention for non-life-threatening illnesses and injuries with minimal wait times.",
        delay: "200"
    },
    {
        id: 4,
        icon: "bi-capsule",
        title: "Pharmacy Services",
        description: "On-site pharmacy with prescription filling, medication counseling, and medication therapy management.",
        delay: "250"
    },
    {
        id: 5,
        icon: "bi-heart",
        title: "Cardiology",
        description: "Comprehensive heart health services including EKGs, stress tests, and cardiovascular disease management.",
        delay: "300"
    },
    {
        id: 6,
        icon: "bi-lungs",
        title: "Pulmonology",
        description: "Specialized care for respiratory conditions like asthma, COPD, and sleep disorders.",
        delay: "350"
    }
];

const LandingPageServices = () => {
    useEffect(() => {
        AOS.init({
            duration: 600,
            once: true
        });
        return () => AOS.refresh();
    }, []);

    return (
        <section id="services" className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div
                    className="text-center max-w-3xl mx-auto mb-12 md:mb-20"
                    data-aos="fade-up"
                >
                    <span className="inline-block px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full mb-4">
                        Our Services
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Comprehensive Healthcare Services
                    </h2>
                    <p className="text-lg text-gray-600">
                        Delivering exceptional medical care with compassion and expertise to improve your health and wellbeing.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100"
                            data-aos="fade-up"
                            data-aos-delay={service.delay}
                        >
                            <div className="p-6 md:p-8">
                                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-100 transition-colors duration-300 group-hover:scale-110">
                                    <i className={`bi ${service.icon} text-3xl`}></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                                    {service.title}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {service.description}
                                </p>
                                <div className="absolute bottom-6 left-8">
                                    <a
                                        href="#"
                                        className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors duration-200"
                                    >
                                        Learn more
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LandingPageServices;