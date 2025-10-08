import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import CMS from "../API/CMS.jsx";
import AOS from "aos";
import "aos/dist/aos.css";
import ScrollLink from "./Scroll_Link/scroll_link";
import ClinicLogo from "../assets/img/ClinicManagementLogo.png"
const LandingPageHeader = () => {
    const [whatWeServeTitle, setWhatWeServeTitle] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const location = useLocation();

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsDropdownOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.mobile-menu-button')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [location.pathname]);

    const toggleMobileMenu = (e) => {
        e.preventDefault();
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleDropdown = (type) => {
        if (type === "login") {
            setIsOpen(!isOpen);
            setIsDropdownOpen(false);
        } else {
            setIsDropdownOpen(!isDropdownOpen);
            setIsOpen(false);
        }
    };

    useEffect(() => {
        AOS.init({ duration: 600, once: true });

        const retrieveWhatWeServeTitle = async () => {
            try {
                const response = await CMS.get("/CMS");
                if (!response.data?.whatWeServeTitle) {
                    throw new Error("No retrieved data what we serve title");
                }
                setWhatWeServeTitle(response.data.whatWeServeTitle);
            } catch (error) {
                console.error(`Error fetching title: ${error}`);
            }
        };

        retrieveWhatWeServeTitle();
        return () => AOS.refresh();
    }, []);

    const navLinks = [
        { name: "Home", href: "#home", isScroll: false },
        { name: "About", href: "#about", isScroll: true },
        { name: "Services", href: "#services", isScroll: true },
        { name: whatWeServeTitle, type: "dropdown" },
        { name: "Contact", href: "#contact", isScroll: true },
        { name: "Patient Registration Portal", href: "/PatientRegistration", isScroll: false },
    ];

    const servicesDropdown = [
        "General Consultation",
        "Pediatrics",
        "Dental Services",
        "Laboratory Tests",
        "Pharmacy",
        "Physiotherapy",
        "Specialist Clinics"
    ];

    const loginDropdown = [
        { name: "Patients Login Portal", to: "/PatientLogin" },
        { name: "Clinic Login Portal", to: "/ClinicLogin" },
    ];

    return (
        <header className="fixed w-full bg-gradient-to-b from-black to-black/80 shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <ScrollLink to="/cms" targetId="home" className="flex-shrink-0 flex items-center">
                        <img 
                            src={ClinicLogo}
                            alt="Clinic Logo"
                            className="object-center w-32 h-26"
                        />
                    </ScrollLink>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navLinks.map((item, index) => (
                            <div key={index} className="relative group" ref={item.type === "dropdown" ? dropdownRef : null}>
                                {item.href ? (
                                    item.isScroll ? (
                                        <ScrollLink
                                            to="/cms"
                                            targetId={item.href.split('#')[1]}
                                            className={`px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white hover:text-black transition-colors duration-200 ${item.className || ''}`}
                                        >
                                            {item.name}
                                        </ScrollLink>
                                    ) : (
                                        <Link
                                            to={item.href}
                                            className={`px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white hover:text-black transition-colors duration-200 ${item.className || ''}`}
                                        >
                                            {item.name}
                                        </Link>
                                    )
                                ) : (
                                    <button
                                        onClick={() => toggleDropdown('services')}
                                        className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white hover:text-black transition-colors duration-200 flex items-center cursor-pointer"
                                    >
                                        {item.name}
                                        <svg
                                            className={`ml-1 h-4 w-4 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                )}
                                {item.type === "dropdown" && isDropdownOpen && (
                                    <div className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                        <div className="py-1">
                                            {servicesDropdown.map((service, i) => (
                                                <a
                                                    key={i}
                                                    href="#"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    {service}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {/* Login Dropdown */}
                        <div className="relative group ml-2" ref={dropdownRef}>
                            <button
                                onClick={() => toggleDropdown('login')}
                                className="px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-white hover:text-black cursor-pointer transition-colors duration-200 flex items-center"
                            >
                                Login
                                <svg
                                    className={`ml-1 h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {isOpen && (
                                <div className="absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                    <div className="py-1">
                                        {loginDropdown.map((item, i) => (
                                            <Link
                                                key={i}
                                                to={item.to}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMobileMenu}
                            className="mobile-menu-button inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-black hover:bg-white focus:outline-none transition duration-150 ease-in-out cursor-pointer"
                            aria-label="Main menu"
                        >
                            <svg
                                className={`h-6 w-6 ${isMobileMenuOpen ? 'hidden' : 'block'}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <svg
                                className={`h-6 w-6 ${isMobileMenuOpen ? 'block' : 'hidden'}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div
                ref={mobileMenuRef}
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-black`}
            >
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {navLinks.map((item, index) => (
                        <div key={index}>
                            {item.href ? (
                                <Link
                                    to={item.href}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white hover:text-black transition-colors duration-200"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ) : (
                                <div>
                                    <button
                                        onClick={() => toggleDropdown('services')}
                                        className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white hover:text-black cursor-pointer transition-colors duration-200 flex justify-between items-center"
                                    >
                                        {item.name}
                                        <svg
                                            className={`h-5 w-5 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {isDropdownOpen && (
                                        <div className="pl-4">
                                            {servicesDropdown.map((service, i) => (
                                                <a
                                                    key={i}
                                                    href="#"
                                                    className="block px-3 py-2 text-sm text-white hover:bg-white transition-colors duration-200 rounded-md hover:text-black cursor-pointer"
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                >
                                                    {service}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Mobile Login Dropdown */}
                    <div className="pt-4 pb-2 border-t border-white">
                        <div className="space-y-1">
                            {loginDropdown.map((item, i) => (
                                <Link
                                    key={i}
                                    to={item.to}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white hover:text-black transition-colors duration-200 cursor-pointer"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default LandingPageHeader;
