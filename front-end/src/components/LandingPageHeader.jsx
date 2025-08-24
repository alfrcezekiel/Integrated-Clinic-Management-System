import {
    useEffect,
    useState,
    useRef
} from "react";
import { Link } from "react-router-dom";
import CMS from "../API/CMS.jsx";
import AOS from "aos";
import "aos/dist/aos.css";

const LandingPageHeader = () => {
    const [whatWeServeTitle, setWhatWeServeTitle] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null)

    // Close the dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }

            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.classList.contains("navbar-toggler")) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMobileMenu = (e) => {
        e.preventDefault();
        setIsMobileMenuOpen(!isMobileMenuOpen);
    }

    const toggleDropdown = (e, dropdownType) => {
        e.preventDefault();
        if (dropdownType === "login") {
            setIsOpen(!isOpen);
            setIsDropdownOpen(false);
        } else {
            setIsDropdownOpen(!isDropdownOpen);
            setIsOpen(false);
        }
    }
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

    return (
        <header id="header" className="fixed top-0 w-full bg-violet-600 shadow z-10">
            <div className="container mx-auto max-w-screen-xl px-4 py-3">
                <div className="d-flex justify-content-between align-items-center">
                    <a href="/cms" className="flex items-center space-x-2">
                        <h1 className="text-2xl font-bold text-white">CMS</h1>
                    </a>

                    {/* Mobile Toggle */}
                    <button
                        className="navbar-toggler d-lg-none"
                        type="button"
                        aria-label="Toggle navigation"
                        onClick={toggleMobileMenu}
                    >
                        <span className={`navbar-toggler-icon d-flex flex-column justify-content-between`}>
                            <span className={`d-block w-100 bg-white mb-1 rounded ${isMobileMenuOpen ? 'transform-rotate-45 translate-y-1' : ''}`} style={{ height: '3px', transition: 'all 0.3s ease' }}></span>
                            <span className={`d-block w-100 bg-white mb-1 rounded ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} style={{ height: '3px', transition: 'all 0.3s ease' }}></span>
                            <span className={`d-block w-100 bg-white rounded ${isMobileMenuOpen ? 'transform-rotate--45 translate-y--1' : ''}`} style={{ height: '3px', transition: 'all 0.3s ease' }}></span>
                        </span>
                    </button>

                    <nav className="hidden xl:flex space-x-6 items-center text-white font-medium">
                        <a href="/cms" className="hover:text-blue-300 text-white">Home</a>
                        <a href="#about" className="hover:text-blue-300 text-white">About</a>
                        <a href="#services" className="hover:text-blue-300 text-white">Services</a>
                        <div className="relative inline-block" ref={dropdownRef}>
                            <button
                                className="flex items-center hover:text-blue-300"
                                onClick={() => setIsDropdownOpen(prev => !prev)}
                            >
                                <span>{whatWeServeTitle}</span>
                                <i className="bi bi-chevron-down ml-1"></i>
                            </button>
                            {isDropdownOpen && (
                                <ul className="absolute left-0 top-full mt-4 bg-white text-gray-800 shadow-md rounded-md w-48 z-20 p-3">
                                    <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 text-black">General Consultation</a></li>
                                    <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 text-black">Pediatrics</a></li>
                                    <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 text-black">Dental Services</a></li>
                                    <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 text-black">Laboratory Tests</a></li>
                                    <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 text-black">Pharmacy</a></li>
                                    <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 text-black">Physiotherapy</a></li>
                                    <li><a href="#" className="block px-4 py-2 hover:bg-gray-100 text-black">Specialist Clinics</a></li>
                                </ul>
                            )}
                        </div>
                        <a href="#contact" className="hover:text-blue-300 text-white">Contact</a>
                        <Link
                            to="/PatientRegistration"
                            className="hover:text-blue-300 text-white"
                        >
                            Patients Registration Portal
                        </Link>
                        {/* Login Dropdown */}
                        <div className="relative inline-block" ref={dropdownRef}>
                            <button
                                className="flex items-center hover:text-blue-300"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                <span>Login</span>
                                <i className="bi bi-chevron-down ml-1"></i>
                            </button>
                            {isOpen && (
                                <ul className="absolute left-0 mt-4 bg-white text-gray-800 shadow-md rounded-md w-60 z-20 p-3">
                                    <li>
                                        <Link
                                            to="/PatientLogin"
                                            className="block px-4 py-3 hover:bg-gray-100 text-black"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Patients Login Portal
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/ClinicLogin"
                                            className="block px-4 py-3 hover:bg-gray-100 text-black"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Clinic Login Portal
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/AdminLogin"
                                            className="block px-4 py-3 hover:bg-gray-100 text-black"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Admin Portal
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </div>
                    </nav>
                </div>
                {/* Mobile Menu */}
                <div
                    ref={mobileMenuRef}
                    className={`${isMobileMenuOpen ? 'd-block' : 'd-none'} d-lg-none w-100`}
                    id="navbarMobile"
                >
                    <div className="container-fluid p-0">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <a href="/cms" className="nav-link text-white px-3 py-2" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
                            </li>
                            <li className="nav-item">
                                <a href="#about" className="nav-link text-white px-3 py-2" onClick={() => setIsMobileMenuOpen(false)}>About</a>
                            </li>
                            <li className="nav-item">
                                <a href="#services" className="nav-link text-white px-3 py-2" onClick={() => setIsMobileMenuOpen(false)}>Services</a>
                            </li>

                            <li className="nav-item dropdown">
                                <button
                                    className="nav-link text-white d-flex justify-content-between align-items-center w-100 px-3 py-2 text-start bg-transparent border-0"
                                    onClick={(e) => toggleDropdown(e, "services")}
                                >
                                    {whatWeServeTitle}
                                    <i className={`bi bi-chevron-${isDropdownOpen ? "up" : "down"}`}></i>
                                </button>
                                {isDropdownOpen && (
                                    <ul className="bg-violet-600 ps-4 m-0">
                                        <li><a href="#" className="dropdown-item text-white py-2" onClick={() => setIsMobileMenuOpen(false)}>General Consultation</a></li>
                                        <li><a href="#" className="dropdown-item text-white py-2" onClick={() => setIsMobileMenuOpen(false)}>Pediatrics</a></li>
                                        <li><a href="#" className="dropdown-item text-white py-2" onClick={() => setIsMobileMenuOpen(false)}>Dental Services</a></li>
                                        <li><a href="#" className="dropdown-item text-white py-2" onClick={() => setIsMobileMenuOpen(false)}>Laboratory Tests</a></li>
                                        <li><a href="#" className="dropdown-item text-white py-2" onClick={() => setIsMobileMenuOpen(false)}>Pharmacy</a></li>
                                        <li><a href="#" className="dropdown-item text-white py-2" onClick={() => setIsMobileMenuOpen(false)}>Physiotherapy</a></li>
                                        <li><a href="#" className="dropdown-item text-white py-2" onClick={() => setIsMobileMenuOpen(false)}>Specialist Clinics</a></li>
                                    </ul>
                                )}
                            </li>

                            <li className="nav-item">
                                <a href="#contact" className="nav-link text-white px-3 py-2" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
                            </li>
                            <li className="nav-item">
                                <Link
                                    to="/PatientRegistration"
                                    className="nav-link text-white px-3 py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Patients Registration Portal
                                </Link>
                            </li>

                            <li className="nav-item dropdown">
                                <button
                                    className="nav-link text-white d-flex justify-content-between align-items-center w-100 text-start px-3 py-2 bg-transparent border-0"
                                    onClick={(e) => toggleDropdown(e, "login")}
                                >
                                    Login
                                    <i className={`bi bi-chevron-${isOpen ? "up" : "down"}`}></i>
                                </button>
                                {isOpen && (
                                    <ul className="ps-4 m-0 bg-violet-600">
                                        <li>
                                            <Link
                                                to="/PatientLogin"
                                                className="dropdown-item text-white px-3 py-2"
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                            >
                                                Patients Login Portal
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="/ClinicLogin"
                                                className="dropdown-item text-white px-3 py-2"
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                            >
                                                Clinic Login Portal
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="/AdminLogin"
                                                className="dropdown-item text-white px-3 py-2"
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                            >
                                                Admin Portal
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default LandingPageHeader;
