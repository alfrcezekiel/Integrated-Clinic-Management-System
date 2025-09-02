import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";


const LandingPageFAQ = () => {
    const faqs = [
        {
            question: "How can I book an appointment?",
            answer: "You can book an appointment by calling our clinic or visiting our website.  Walk-ins are also welcome, but we recommend scheduling in advance to ensure availability",
        },
        {
            question: "How can I access my medical records?",
            answer: "You can access your medical records through our secure patient portal. If you need assistance, our staff will be happy to help.",
        },
        {
            question: "What should I bring to my first appointment?",
            answer: "Please bring a valid ID, your insurance card, a list of current medications, and any relevant medical records. If you have any specific forms or documents, bring those as well.",
        },
        {
            question: "Do you accept walk-in patients?",
            answer: "Yes, we accept walk-in patients. However, we recommend booking an appointment to minimize waiting times.",
        },
        {
            question: "Do you offer vaccinations?",
            answer: "Yes, we provide a range of vaccinations, including flu shots, travel vaccines, and routine immunizations.",
        },
        {
            question: "What should I do in case of a medical emergency?",
            answer: "In case of a medical emergency, please call 911 or visit the nearest emergency room. Our clinic is equipped to handle non-emergency medical issues.",
        },
    ];

    const [activeIndex, setActiveIndex] = useState(null);

    useEffect(() => {
        AOS.init({ duration: 600, once: true });
    }, []);

    const toggleFAQ = (index) => {
        setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    return (
        <section id="faq" className="py-20 bg-white">
            <div className="container mx-auto px-4 text-center" data-aos="fade-up">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-600 text-lg">Everything you need to know about your health care</p>
            </div>

            <div className="container mx-auto px-4 mt-6">
                <div className="max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="100">
                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                onClick={() => toggleFAQ(index)}
                                className={
                                    `border shadow-sm border-gray-200 rounded-2xl px-4 py-5 transition-all duration-300 cursor-pointer ${activeIndex === index ? "bg-blue-50 border-blue-500 shadow-md" : "bg-white"}`
                                }
                            >
                                <div className="flex justify-between items-center">
                                    <h6 className="text-md text-gray-800">{faq.question}</h6>
                                    <i
                                        className={
                                            `bi transition-transform duration-200 text-sm ${activeIndex === index ? "bi-chevron-down rotate-180" : "bi-chevron-right"} text-blue-600`
                                        }
                                    ></i>
                                </div>
                                <div
                                    className={
                                        `text-gray-700 transition-all duration-300 ease-in-out overflow-hidden ${activeIndex === index ? "mt-3 max-h-[300px]" : "max-h-0"}`
                                    }
                                >
                                    <p className="text-base leading-relaxed">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LandingPageFAQ;
