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
        <header id="header" className="fixed top-0 w-full bg-violet-600 shadow z-50">
            <div className="container mx-auto max-w-screen-xl flex items-center justify-between px-4 py-3">
                <a href="/cms" className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-white">CMS</h1>
                </a>

                <nav className="hidden xl:flex space-x-6 items-center text-white font-medium">
                    <a href="/cms" className="hover:text-blue-300 text-white">Home</a>
                    <a href="#about" className="hover:text-blue-300 text-white">About</a>
                    <a href="#services" className="hover:text-blue-300 text-white">Services</a>

                    {/* What We Serve Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center hover:text-blue-300">
                            <span>{whatWeServeTitle}</span>
                            <i className="bi bi-chevron-down ml-1"></i>
                        </button>
                        <ul className="absolute left-0 mt-2 hidden group-hover:block bg-white text-gray-800 shadow-md rounded-md w-48 z-20">
                            <li><a href="#" className="block px-4 py-2 hover:bg-gray-100">Dropdown 1</a></li>
                            <li className="relative group">
                                <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                    <span>Deep Dropdown</span>
                                    <i className="bi bi-chevron-right"></i>
                                </div>
                                <ul className="absolute left-full top-0 mt-0 hidden group-hover:block bg-white shadow-md rounded-md w-48 z-20">
                                    <li><a href="#" className="block px-4 py-2 hover:bg-gray-100">Deep Dropdown 1</a></li>
                                    <li><a href="#" className="block px-4 py-2 hover:bg-gray-100">Deep Dropdown 2</a></li>
                                    <li><a href="#" className="block px-4 py-2 hover:bg-gray-100">Deep Dropdown 3</a></li>
                                    <li><a href="#" className="block px-4 py-2 hover:bg-gray-100">Deep Dropdown 4</a></li>
                                    <li><a href="#" className="block px-4 py-2 hover:bg-gray-100">Deep Dropdown 5</a></li>
                                </ul>
                            </li>
                            <li><a href="#" className="block px-4 py-2 hover:bg-gray-100">Dropdown 2</a></li>
                            <li><a href="#" className="block px-4 py-2 hover:bg-gray-100">Dropdown 3</a></li>
                            <li><a href="#" className="block px-4 py-2 hover:bg-gray-100">Dropdown 4</a></li>
                        </ul>
                    </div>

                    <a href="#contact" className="hover:text-blue-300 text-white">Contact</a>
                    <Link to="/patients-portal" className="hover:text-blue-300 text-white">Patients Registration Portal</Link>

                    {/* Login Dropdown */}
                    <div className="relative group" ref={dropdownRef}>
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
