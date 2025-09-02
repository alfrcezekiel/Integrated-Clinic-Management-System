import FeaturesImage from "../assets/img/features.svg"
import AOS from "aos"
import { useEffect, useState } from "react"
import CMS from "../API/CMS.jsx"
import PropTypes from "prop-types";

const FeatureCard = ({ icon, title, description, delay }) => (
    <div
        className="flex items-start p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
        data-aos="fade-up"
        data-aos-delay={delay}
    >
        <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg text-blue-600 mr-5">
            <i className={`bi ${icon} text-2xl`}></i>
        </div>
        <div className="px-2">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    </div>
);

FeatureCard.propTypes = {
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    delay: PropTypes.string.isRequired
};

const LandingPageFeatures = () => {
    const [featuresTitle, setFeaturesTitle] = useState("");
    const [ehrText, setEhrText] = useState("");
    const [appointmentText, setAppointmentText] = useState("");
    const [paymentText, setPaymentText] = useState("");
    const [inventoryText, setInventoryText] = useState("");

    useEffect(() => {
        AOS.init({
            duration: 600,
            once: true
        });

        const retrieveDataFeatures = async () => {
            const response = await CMS.get("/CMS");

            if (!response.data || !response.data.featuresTitle || !response.data.ehrText || !response.data.appointmentSchedulingText || !response.data.paymentIntegrationText || !response.data.inventoryText) {
                throw new Error("No retrieved data features in server");
            } else {
                setFeaturesTitle(response.data.featuresTitle);
                setEhrText(response.data.ehrText);
                setAppointmentText(response.data.appointmentSchedulingText);
                setPaymentText(response.data.paymentIntegrationText);
                setInventoryText(response.data.inventoryText);
            }
        };
        retrieveDataFeatures();

        return () => {
            AOS.refresh();
        };
    }, []);

    const features = [
        {
            icon: "bi-file-earmark-medical",
            title: ehrText,
            description: "Securely store and manage patient records, treatment history, and prescriptions with our comprehensive EHR system.",
            delay: "200"
        },
        {
            icon: "bi-calendar-check",
            title: appointmentText,
            description: "Easily book, reschedule, and manage patient appointments with an intuitive scheduling system that reduces no-shows.",
            delay: "300"
        },
        {
            icon: "bi-credit-card",
            title: paymentText,
            description: "Streamline billing with automated invoicing, insurance claims, and multiple payment options for a hassle-free experience.",
            delay: "400"
        },
        {
            icon: "bi-clipboard-data",
            title: inventoryText,
            description: "Track and manage dental supplies efficiently to prevent shortages and ensure smooth clinic operations.",
            delay: "500"
        }
    ];

    return (
        <section id="features" className="py-16 md:py-24 lg:py-32 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
                    <h2 className="text-3xl xl:text-4xl sm:text-3xl font-bold text-gray-900 mb-4">
                        {featuresTitle}
                    </h2>
                    <p className="text-lg text-gray-600 sm:text-lg sm:px-4">
                        Streamline your clinic operations with our advanced features designed to improve patient care and reduce administrative tasks.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                        {features.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                                delay={feature.delay}
                            />
                        ))}
                    </div>

                    <div className="relative p-5" data-aos="fade-left" data-aos-delay="100">
                        <div className="relative rounded-2xl overflow-hidden shadow-xl">
                            <img
                                src={FeaturesImage}
                                alt="Clinic Management Features"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500 rounded-full opacity-20"></div>
                        <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-400 rounded-full opacity-10"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LandingPageFeatures;