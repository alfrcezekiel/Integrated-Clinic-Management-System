import { useState, useEffect } from "react"
import CMS from "../API/CMS.jsx"

const LandingPageFooter = () => {
    const [title, setTitle] = useState("");

    useEffect(() => {
        const retrieveDataTitle = async () => {
            try {
                const response = await CMS.get("/");
                if (!response.data || !response.data.title) {
                    throw new Error("No retrieved data title");
                } else {
                    setTitle(response.data.title);
                }
            } catch (error) {
                console.error(`Code functionality error for fetching data title: ${error}`);
            }
        }
        retrieveDataTitle();
    }, [])

    const socialLinks = [{
        name: "twitter-x",
        url: "#"
    }, {
        name: "facebook",
        url: "#"
    }, {
        name: "instagram",
        url: "#"
    }, {
        name: "linkedin",
        url: "#"
    }]

    const footerLinks = [{
        name: "Home",
        path: "/"
    }, {
        name: "About us",
        path: "#about"
    }, {
        name: "Services",
        path: "#services"
    }, {
        name: "Contact",
        path: "#contact"
    }, {
        name: "Privacy Policy",
        path: "#privacy-policy"
    }]
    return (
        <footer id="footer" className="bg-black text-gray-300">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-2 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    {/* About Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <a href="/" className="inline-block">
                            <span className="text-3xl font-bold bg-white bg-clip-text text-transparent">
                                {title}
                            </span>
                        </a>
                        <p className="text-gray-400 leading-relaxed max-w-md">
                            Simplify your clinic operations and enhance patient care with our all-in-one dental management solution.
                        </p>
                        <div className="flex space-x-5">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    className="text-gray-400 hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                                    aria-label={social.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <i className={`bi bi-${social.name} text-2xl`}></i>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Useful Links */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6 pb-2 border-b border-gray-700">Useful Links</h4>
                        <ul className="space-y-3">
                            {footerLinks.map((item) => (
                                <li key={item.name}>
                                    <a
                                        href={item.path}
                                        className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group"
                                    >
                                        <span className="w-1.5 h-1.5 bg-white rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6 pb-2 border-b border-gray-700">Our Services</h4>
                        <ul className="space-y-3">
                            {[
                                'Electronic Health Records',
                                'Billing & Invoicing',
                                'Appointment Scheduling',
                                'Payment Integration',
                                'Inventory Management'
                            ].map((service) => (
                                <li key={service} className="group">
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center"
                                    >
                                        <i className="bi bi-chevron-right text-xs mr-2 text-white opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                        {service}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6 pb-2 border-b border-gray-700">Contact Us</h4>
                        <address className="not-italic space-y-4">
                            <div className="flex items-start">
                                <i className="bi bi-geo-alt text-white mt-1 mr-3 text-lg"></i>
                                <div>
                                    <p>Iloilo City, Philippines</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <i className="bi bi-telephone text-white mr-3 text-lg"></i>
                                <a
                                    href="tel:+6395895548855"
                                    className="hover:text-white transition-colors duration-200"
                                >
                                    +63 9589 55488 55
                                </a>
                            </div>
                            <div className="flex items-center">
                                <i className="bi bi-envelope text-white mr-3 text-lg"></i>
                                <a
                                    href="mailto:clinicmanagementteam@gmail.com"
                                    className="hover:text-white transition-colors duration-200 break-all"
                                >
                                    clinicmanagementteam@gmail.com
                                </a>
                            </div>
                        </address>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-500 text-sm">
                    <p>
                        &copy; {new Date().getFullYear()} <span className="text-white">{title}</span>. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default LandingPageFooter;