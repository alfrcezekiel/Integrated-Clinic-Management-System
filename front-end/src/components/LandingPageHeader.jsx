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
    const dropdownRef = useRef(null);
    // Close the dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
            <div className="container mx-auto max-w-screen-xl flex items-center justify-between px-4 py-3">
                <a href="/cms" className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-white">CMS</h1>
                </a>

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
                    <Link to="/patients-portal" className="hover:text-blue-300 text-white">Patients Registration Portal</Link>

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
                                        to="/patients-login"
                                        className="block px-4 py-3 hover:bg-gray-100 text-black"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Patients Login Portal
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/doctor-portal/login"
                                        className="block px-4 py-3 hover:bg-gray-100 text-black"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Clinic Login Portal
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/cms/login-admin"
                                        className="block px-4 py-3 hover:bg-gray-100 text-black"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        CMS Admin Portal
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </div>
                </nav>

                {/* Mobile Toggle (non-functional placeholder) */}
                <button className="xl:hidden text-white text-2xl focus:outline-none">
                    <i className="bi bi-list"></i>
                </button>
            </div>
        </header>
    );
};

export default LandingPageHeader;
