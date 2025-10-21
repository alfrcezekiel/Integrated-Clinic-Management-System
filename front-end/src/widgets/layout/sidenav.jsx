import PropTypes from "prop-types";
import { useState, useEffect, useCallback } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

const SideNav = ({ brandName, routes }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [clinicOpen, setClinicOpen] = useState(false);
    const [appointmentOpen, setAppointmentOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1280); // xl breakpoint is 1280px in Tailwind

    // Update isMobile state on window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1280); // xl breakpoint
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleMobileMenu = useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen]);

    const toggleClinicMenu = useCallback(() => {
        setClinicOpen(!clinicOpen);
    }, [clinicOpen]);

    const toggleAppointmentMenu = useCallback(() => {
        setAppointmentOpen(!appointmentOpen);
    }, [appointmentOpen]);

    const navItemClasses = ({ isActive }) =>
        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
            ? "bg-blue-50 text-blue-600 font-semibold font-sans"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`;

    const subNavItemClasses = ({ isActive }) =>
        `flex items-center pl-8 pr-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${isActive
            ? "bg-blue-50 text-blue-600 font-medium font-sans"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        }`;

    return (
        <>
            {/* Mobile menu button - shown on lg screens and below */}
            <button
                onClick={toggleMobileMenu}
                className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md lg:block xl:hidden"
                aria-label="Toggle menu"
            >
                <div className="w-6 flex flex-col space-y-1.5">
                    <span className={`block h-0.5 bg-gray-600 transition-all duration-200 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`block h-0.5 bg-gray-600 transition-all duration-200 ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                    <span className={`block h-0.5 bg-gray-600 transition-all duration-200 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </div>
            </button>

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
                    isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
                }`}
            >
                <div className="flex flex-col h-full overflow-y-auto mt-12">
                    {/* Brand */}
                    <div className="py-4 border-b border-gray-200">
                        <Link to={"/patients-dashboard/Home"} className="inline-block">
                            <h1 className="text-lg font-bold text-gray-800 py-5 px-12 text-center font-sans">{brandName}</h1>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-5 space-y-2">
                        {/* Regular Nav Items */}
                        {routes.map(({ layout, pages }, index) => (
                            <div key={index} className="space-y-1">
                                {pages
                                    .filter(
                                        (page) =>
                                            !["View Clinics", "Appointments", "Pending Appointments", "Approved Appointments", "Declined Appointments"].includes(page.name)
                                    )
                                    .map(({ icon, name, path }, idx) => (
                                        <NavLink
                                            key={`${index}-${idx}`}
                                            to={`${layout}${path}`}
                                            className={navItemClasses}
                                            onClick={() => isMobile && setIsOpen(false)}
                                        >
                                            <span className="mr-3">{icon}</span>
                                            {name}
                                        </NavLink>
                                    ))}
                            </div>
                        ))}

                        {/* Clinic Management Dropdown */}
                        <div className="mt-2">
                            <button
                                onClick={toggleClinicMenu}
                                className="w-full cursor-pointer flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                <div className="flex items-center font-sans">
                                    <span className="mr-3">🏥</span>
                                    Clinic Management
                                </div>
                                {clinicOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>

                            <div className={`overflow-hidden transition-all duration-200 ${clinicOpen ? 'mt-1 mb-2' : 'h-0'}`}>
                                <div className="py-1 space-y-1">
                                    {routes.map(({ layout, pages }, index) =>
                                        pages
                                            .filter((page) => page.name === "View Clinics")
                                            .map(({ path, icon, name }) => (
                                                <NavLink
                                                    key={`clinic-${index}`}
                                                    to={`${layout}${path}`}
                                                    className={subNavItemClasses}
                                                    onClick={() => isMobile && setIsOpen(false)}
                                                >
                                                    <span className="mr-3">{icon}</span>
                                                    {name}
                                                </NavLink>
                                            ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Appointment Management Dropdown */}
                        <div className="mt-2">
                            <button
                                onClick={toggleAppointmentMenu}
                                className="w-full flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                <div className="flex items-center font-sans">
                                    <span className="mr-3">📅</span>
                                    Appointment Management
                                </div>
                                {appointmentOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>

                            <div className={`overflow-hidden transition-all duration-200 ${appointmentOpen ? 'mt-1 mb-2' : 'h-0'}`}>
                                <div className="py-1 space-y-1">
                                    {routes.map(({ layout, pages }, index) =>
                                        pages
                                            .filter((page) =>
                                                ["Appointments", "Pending Appointments", "Approved Appointments", "Declined Appointments"].includes(page.name)
                                            )
                                            .map(({ path, icon, name }) => (
                                                <NavLink
                                                    key={`appt-${index}-${name}`}
                                                    to={`${layout}${path}`}
                                                    className={subNavItemClasses}
                                                    onClick={() => isMobile && setIsOpen(false)}
                                                >
                                                    <span className="mr-3">{icon}</span>
                                                    {name}
                                                </NavLink>
                                            ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Overlay for mobile and lg screens when menu is open */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-opacity-50 lg:bg-opacity-30 xl:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

SideNav.propTypes = {
    brandName: PropTypes.string,
    routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

SideNav.defaultProps = {
    brandName: "Patients Dashboard",
};

export default SideNav;