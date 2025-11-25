import PropTypes from "prop-types"
import "../../App.css"
import {
    useCallback,
    useState,
    useEffect
} from "react";
import {
    Link,
    NavLink,
} from "react-router-dom";
import { ChevronDown, ChevronRight } from 'lucide-react'

// this is the sidenav component for the dashboard
const DoctorsSideNav = ({ brandName, routes }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [appointmentDropDownOpen, setAppointmentDropDownOpen] = useState(false);
    const [appointmentHistoryDropDownOpen, setAppointmentHistoryDropDownOpen] = useState(false);
    const [patientManagementDropDownOpen, setPatientManagementDropDownOpen] = useState(false);
    const [clinicBookAppointmentDropDownOpen, setClinicBookAppointmentDropDownOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [width, setWidth] = useState(window.innerWidth);

    // Detect mobile and medium screen sizes
    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setWidth(width);
            setIsMobile(width < 768);

            if (width >= 768) {
                setIsMobileMenuOpen(false); // Close mobile menu when switching to desktop
            }

            if (width > 768 && width < 1280) {
                setIsCollapsed(true);
            } else {
                setIsCollapsed(false);
            }

        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Listen for custom event to toggle mobile menu
    useEffect(() => {
        const handleToggleMobileMenu = () => {
            setIsMobileMenuOpen(prev => !prev);
        };

        const handleOpenMobileMenu = () => {
            setIsMobileMenuOpen(true);
        };

        const handleCloseMobileMenu = () => {
            setIsMobileMenuOpen(false);
        };

        const handleToggleSideBar = () => {
            if (width > 768 && width < 1280) {
                setIsCollapsed(prev => !prev);
            }
        }

        window.addEventListener('toggleMobileMenu', handleToggleMobileMenu);
        window.addEventListener('openMobileMenu', handleOpenMobileMenu);
        window.addEventListener('closeMobileMenu', handleCloseMobileMenu);
        window.addEventListener('toggleSideBar', handleToggleSideBar);

        return () => {
            window.removeEventListener('toggleMobileMenu', handleToggleMobileMenu);
            window.removeEventListener('openMobileMenu', handleOpenMobileMenu);
            window.removeEventListener('closeMobileMenu', handleCloseMobileMenu);
            window.removeEventListener('toggleSideBar', handleToggleSideBar);
        };
    }, [width]);

    // Function to handle the click event for the appointment dropdown
    const handleAppointmentDropDownClick = useCallback(() => {
        setAppointmentDropDownOpen(!appointmentDropDownOpen);
    }, [appointmentDropDownOpen])

    const appointmentHistoryDropDown = (dropdown) => {
        setAppointmentHistoryDropDownOpen(!dropdown);
    }

    // Function to handle the click event for the appointment history dropdown
    const handleAppointmentHistoryDropDownClick = useCallback(() => {
        appointmentHistoryDropDown(appointmentHistoryDropDownOpen);
    }, [appointmentHistoryDropDownOpen])

    const handlePatientManagementDropDownClick = useCallback(() => {
        setPatientManagementDropDownOpen(!patientManagementDropDownOpen);
    }, [patientManagementDropDownOpen])

    const handleClinicBookAppointmentDropDownClick = useCallback(() => {
        setClinicBookAppointmentDropDownOpen((prev) => !prev);
    }, [])

    const fieldNamesLinks = [
        "Appointments",
        "Pending Appointments",
        "Approved Appointments",
        "Declined Appointments",
        "Patient Side History",
        "Consult Patient",
        "Add Book Appointment",
        "Clinic Book Appointment",
        "Clinic Pending Booked Appointment",
        "Clinic Approved Booked Appointment",
        "Clinic Declined Booked Appointment",
        "Modify Booked Appointment",
        "Clinic Side History"
    ]

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 bg-opacity-50 z-40 md:hidden cursor-pointer"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />
            )}

            {/* Medium Screen Overlay - shows when sidebar is hidden */}
            {!isMobile && !isCollapsed && (
                <div
                    className="fixed inset-0 bg-black/50 bg-opacity-50 z-40 hidden md:block lg:hidden cursor-pointer"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`overflow-y-auto fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-xl z-50 transition-all duration-300 ease-in-out cursor-pointer ${isMobile ? (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : (isCollapsed ? '-translate-x-full' : 'translate-x-0')} ${!isMobile && !isCollapsed ? 'w-76' : ''} md:fixed`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 pt-20">
                    <Link to={"/doctor-portal/dashboard/home"} className="flex-1">
                        <h1 className={`
                            font-bold text-gray-900 transition-all duration-300
                            ${isCollapsed ? 'text-lg text-center' : 'text-xl text-center'}
                        `}>
                            {!isCollapsed && brandName}
                            {isCollapsed && brandName.charAt(0)}
                        </h1>
                    </Link>
                </div>
                <nav className={`overflow-y-auto flex-1 ${isCollapsed ? 'px-2' : 'px-4'} ${isMobile ? 'py-4' : 'py-6'}`}>
                    {/* Main Routes */}
                    {routes.map(({ layout, pages }, index) => (
                        <div key={layout || index} className="mb-6">
                            {pages
                                .filter((page) => !fieldNamesLinks.includes(page.name))
                                .map(({ icon, name, path }) => (
                                    <NavLink
                                        key={name}
                                        to={`${layout}${path}`}
                                        onClick={() => {
                                            if (isMobile) {
                                                setIsMobileMenuOpen(false);
                                            } else {
                                                if (width > 768 && width < 1280) {
                                                    setIsCollapsed(true);
                                                }
                                            }
                                        }}
                                        className={({ isActive }) => `
                                            flex items-center px-3 py-2.5 rounded-lg transition-all duration-200
                                            ${isActive
                                                ? 'bg-gray-900 text-white shadow-sm'
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                            }
                                            ${isCollapsed ? 'justify-center' : 'justify-start'}
                                        `}
                                        title={isCollapsed ? name : ''}
                                    >
                                        <span className={`
                                            flex-shrink-0
                                            ${isCollapsed ? '' : 'mr-3'}
                                        `}>
                                            {icon}
                                        </span>
                                        {!isCollapsed && (
                                            <span className="font-medium text-sm">{name}</span>
                                        )}
                                    </NavLink>
                                ))}
                        </div>
                    ))}
                    {/* Appointment Management Section */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
                        <button
                            onClick={handleAppointmentDropDownClick}
                            className={`
                                w-full flex items-center justify-between px-3 py-3 rounded-t-xl
                                transition-all duration-200 hover:bg-gray-50 cursor-pointer
                                ${isCollapsed ? 'justify-center' : 'justify-between'}
                            `}
                            title={isCollapsed ? 'Appointment Management' : ''}
                        >
                            <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                                <span className="text-gray-700">
                                    📅
                                </span>
                                {!isCollapsed && (
                                    <span className="ml-3 font-medium text-sm text-gray-900">Appointment Management</span>
                                )}
                            </div>
                            {!isCollapsed && (
                                <span className="text-gray-500">
                                    {appointmentDropDownOpen ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4" />
                                    )}
                                </span>
                            )}
                        </button>
                        {/* Appointment Management Dropdown */}
                        <div className={`
                            overflow-hidden transition-all duration-300 ease-in-out
                            ${appointmentDropDownOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
                        `}>
                            <div className="p-2 space-y-1">
                                {/* Clinic Appointment Management Sub-dropdown */}
                                <div className="block">
                                    <button
                                        onClick={handleClinicBookAppointmentDropDownClick}
                                        className={`
                                            w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
                                            transition-all duration-200 hover:bg-gray-50
                                            ${isCollapsed ? 'justify-center' : 'justify-between'}
                                        `}
                                        title={isCollapsed ? 'Clinic Appointment Management' : ''}
                                    >
                                        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                                            <span className="text-gray-600 text-sm">
                                                🏥
                                            </span>
                                            {!isCollapsed && (
                                                <span className="ml-3 text-sm text-gray-900 font-medium">Clinic Appointment Management</span>
                                            )}
                                        </div>
                                        {!isCollapsed && (
                                            <span className="text-gray-400">
                                                {clinicBookAppointmentDropDownOpen ? (
                                                    <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </span>
                                        )}
                                    </button>
                                    {/* Clinic Appointment Management Sub-items */}
                                    <div className={`
                                        overflow-hidden transition-all duration-300 ease-in-out
                                        ${clinicBookAppointmentDropDownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                                    `}>
                                        <div className="mt-1 mb-1 space-y-1">
                                            {routes.map(({ layout, pages }, index) => (
                                                pages
                                                    .filter((page) => page.subgroup === "Appointments")
                                                    .map(({ icon, subgroup, path }) => (
                                                        <NavLink
                                                            key={index}
                                                            to={`${layout}${path}`}
                                                            onClick={() => {
                                                                if (isMobile) {
                                                                    setIsMobileMenuOpen(false);
                                                                } else {
                                                                    if (width > 768 && width < 1280) {
                                                                        setIsCollapsed(true);
                                                                    }
                                                                }
                                                            }}
                                                            className={({ isActive }) => `
                                                                flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200
                                                                ${isActive
                                                                    ? 'bg-gray-900 text-white'
                                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                                }
                                                                ${isCollapsed ? 'justify-center' : 'justify-start'}
                                                            `}
                                                            title={isCollapsed ? subgroup : ''}
                                                        >
                                                            <span className={`
                                                                flex-shrink-0
                                                                ${isCollapsed ? '' : 'mr-2'}
                                                            `}>
                                                                {icon}
                                                            </span>
                                                            {!isCollapsed && (
                                                                <span className="text-xs">{subgroup}</span>
                                                            )}
                                                        </NavLink>
                                                    ))
                                            ))}
                                        </div>
                                    </div>
                                    {/* Pending Booked Appointment */}
                                    <div className={`
                                        overflow-hidden transition-all duration-300 ease-in-out
                                        ${clinicBookAppointmentDropDownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                                    `}>
                                        <div className="mt-1 mb-1 space-y-1">
                                            {routes
                                                .map(({ layout, pages }, index) => (
                                                    pages
                                                        .filter((page) => page.subgroup === "Pending Booked Appointment")
                                                        .map(({ icon, subgroup, path }) => (
                                                            <NavLink
                                                                key={index}
                                                                to={`${layout}${path}`}
                                                                onClick={() => {
                                                                    if (isMobile) {
                                                                        setIsMobileMenuOpen(false);
                                                                    } else {
                                                                        if (width > 768 && width < 1280) {
                                                                            setIsCollapsed(true);
                                                                        }
                                                                    }
                                                                }}
                                                                className={({ isActive }) => `
                                                                    flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200
                                                                    ${isActive
                                                                        ? 'bg-gray-900 text-white'
                                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                                    }
                                                                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                                                                `}
                                                                title={isCollapsed ? subgroup : ''}
                                                            >
                                                                <span className={`
                                                                    flex-shrink-0
                                                                    ${isCollapsed ? '' : 'mr-2'}
                                                                `}>
                                                                    {icon}
                                                                </span>
                                                                {!isCollapsed && (
                                                                    <span className="text-xs">{subgroup}</span>
                                                                )}
                                                            </NavLink>
                                                        ))
                                                ))
                                            }
                                        </div>
                                    </div>
                                    {/* Approved Booked Appointment */}
                                    <div className={`
                                        overflow-hidden transition-all duration-300 ease-in-out
                                        ${clinicBookAppointmentDropDownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                                    `}>
                                        <div className="mt-1 mb-1 space-y-1">
                                            {routes
                                                .map(({ layout, pages }, index) => (
                                                    pages
                                                        .filter((page) => page.subgroup === "Approved Booked Appointment")
                                                        .map(({ icon, subgroup, path }) => (
                                                            <NavLink
                                                                key={index}
                                                                to={`${layout}${path}`}
                                                                onClick={() => {
                                                                    if (isMobile) {
                                                                        setIsMobileMenuOpen(false);
                                                                    } else {
                                                                        if (width > 768 && width < 1280) {
                                                                            setIsCollapsed(true);
                                                                        }
                                                                    }
                                                                }}
                                                                className={({ isActive }) => `
                                                                    flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200
                                                                    ${isActive
                                                                        ? 'bg-gray-900 text-white'
                                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                                    }
                                                                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                                                                `}
                                                                title={isCollapsed ? subgroup : ''}
                                                            >
                                                                <span className={`
                                                                    flex-shrink-0
                                                                    ${isCollapsed ? '' : 'mr-2'}
                                                                `}>
                                                                    {icon}
                                                                </span>
                                                                {!isCollapsed && (
                                                                    <span className="text-xs">{subgroup}</span>
                                                                )}
                                                            </NavLink>
                                                        ))
                                                ))
                                            }
                                        </div>
                                    </div>
                                    {/* Declined Booked Appointment */}
                                    <div className={`
                                        overflow-hidden transition-all duration-300 ease-in-out
                                        ${clinicBookAppointmentDropDownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                                    `}>
                                        <div className="mb-1 mt-1 space-y-1">
                                            {routes
                                                .map(({ layout, pages }, index) => (
                                                    pages
                                                        .filter((page) => page.subgroup === "Declined Booked Appointment")
                                                        .map(({ icon, subgroup, path }) => (
                                                            <NavLink
                                                                key={index}
                                                                to={`${layout}${path}`}
                                                                onClick={() => {
                                                                    if (isMobile) {
                                                                        setIsMobileMenuOpen(false);
                                                                    } else {
                                                                        if (width > 768 && width < 1280) {
                                                                            setIsCollapsed(true);
                                                                        }
                                                                    }
                                                                }}
                                                                className={({ isActive }) => `
                                                                    flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200
                                                                    ${isActive
                                                                        ? 'bg-gray-900 text-white'
                                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                                    }
                                                                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                                                                `}
                                                                title={isCollapsed ? subgroup : ''}
                                                            >
                                                                <span className={`
                                                                    flex-shrink-0
                                                                    ${isCollapsed ? '' : 'mr-2'}
                                                                `}>
                                                                    {icon}
                                                                </span>
                                                                {!isCollapsed && (
                                                                    <span className="text-xs">{subgroup}</span>
                                                                )}
                                                            </NavLink>
                                                        ))
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Appointments */}
                            <div className="mb-2 ml-2 mr-2 mt-2 space-y-1">
                                {routes.map(({ layout, pages }, index) => (
                                    pages
                                        .filter((page) => page.name === "Appointments")
                                        .map(({ icon, name, path }) => (
                                            <NavLink
                                                key={index}
                                                to={`${layout}${path}`}
                                                onClick={() => {
                                                    if (isMobile) {
                                                        setIsMobileMenuOpen(false);
                                                    } else {
                                                        if (width > 768 && width < 1280) {
                                                            setIsCollapsed(true);
                                                        }
                                                    }
                                                }}
                                                className={({ isActive }) => `
                                                    flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-gray-900 text-white'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                    }
                                                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                                                `}
                                                title={isCollapsed ? name : ''}
                                            >
                                                <span className={`
                                                    flex-shrink-0
                                                    ${isCollapsed ? '' : 'mr-2'}
                                                `}>
                                                    {icon}
                                                </span>
                                                {!isCollapsed && (
                                                    <span className="text-xs">{name}</span>
                                                )}
                                            </NavLink>
                                        ))
                                ))}
                            </div>
                            {/* Pending Appointments */}
                            <div className="ml-2 mr-2 mb-2 mt-2 space-y-1">
                                {routes.map(({ layout, pages }, index) => (
                                    pages
                                        .filter((page) => page.name === "Pending Appointments")
                                        .map(({ icon, name, path }) => (
                                            <NavLink
                                                key={index}
                                                to={`${layout}${path}`}
                                                onClick={() => {
                                                    if (isMobile) {
                                                        setIsMobileMenuOpen(false);
                                                    } else {
                                                        if (width > 768 && width < 1280) {
                                                            setIsCollapsed(true);
                                                        }
                                                    }
                                                }}
                                                className={({ isActive }) => `
                                                    flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-gray-900 text-white'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                    }
                                                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                                                `}
                                                title={isCollapsed ? name : ''}
                                            >
                                                <span className={`
                                                    flex-shrink-0
                                                    ${isCollapsed ? '' : 'mr-2'}
                                                `}>
                                                    {icon}
                                                </span>
                                                {!isCollapsed && (
                                                    <span className="text-xs">{name}</span>
                                                )}
                                            </NavLink>
                                        ))
                                ))}
                            </div>
                            {/* Approved Appointments */}
                            <div className="ml-2 mr-2 mt-2 mb-2 space-y-1">
                                {routes.map(({ layout, pages }, index) => (
                                    pages
                                        .filter((page) => page.name === "Approved Appointments")
                                        .map(({ icon, name, path }) => (
                                            <NavLink
                                                key={index}
                                                to={`${layout}${path}`}
                                                onClick={() => {
                                                    if (isMobile) {
                                                        setIsMobileMenuOpen(false);
                                                    } else {
                                                        if (width > 768 && width < 1280) {
                                                            setIsCollapsed(true);
                                                        }
                                                    }
                                                }}
                                                className={({ isActive }) => `
                                                    flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-gray-900 text-white'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                    }
                                                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                                                `}
                                                title={isCollapsed ? name : ''}
                                            >
                                                <span className={`
                                                    flex-shrink-0
                                                    ${isCollapsed ? '' : 'mr-2'}
                                                `}>
                                                    {icon}
                                                </span>
                                                {!isCollapsed && (
                                                    <span className="text-xs">{name}</span>
                                                )}
                                            </NavLink>
                                        ))
                                ))}
                            </div>
                            {/* Declined Appointments */}
                            <div className="ml-2 mr-2 mt-2 mb-2 space-y-1">
                                {routes.map(({ layout, pages }, index) => (
                                    pages
                                        .filter((page) => page.name === "Declined Appointments")
                                        .map(({ icon, name, path }) => (
                                            <NavLink
                                                key={index}
                                                to={`${layout}${path}`}
                                                onClick={() => {
                                                    if (isMobile) {
                                                        setIsMobileMenuOpen(false);
                                                    } else {
                                                        if (width > 768 && width < 1280) {
                                                            setIsCollapsed(true);
                                                        }
                                                    }
                                                }}
                                                className={({ isActive }) => `
                                                    flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-gray-900 text-white'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                    }
                                                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                                                `}
                                                title={isCollapsed ? name : ''}
                                            >
                                                <span className={`
                                                    flex-shrink-0
                                                    ${isCollapsed ? '' : 'mr-2'}
                                                `}>
                                                    {icon}
                                                </span>
                                                {!isCollapsed && (
                                                    <span className="text-xs">{name}</span>
                                                )}
                                            </NavLink>
                                        ))
                                ))}
                            </div>
                            {/* Add Book Appointment */}
                            <div className="ml-2 mr-2 mt-2 mb-2 space-y-1">
                                {routes.map(({ layout, pages }, index) => (
                                    pages
                                        .filter((page) => page.name === "Add Book Appointment")
                                        .map(({ icon, name, path }) => (
                                            <NavLink
                                                key={index}
                                                to={`${layout}${path}`}
                                                onClick={() => {
                                                    if (isMobile) {
                                                        setIsMobileMenuOpen(false);
                                                    } else {
                                                        if (width > 768 && width < 1280) {
                                                            setIsCollapsed(true);
                                                        }
                                                    }
                                                }}
                                                className={({ isActive }) => `
                                                    flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-gray-900 text-white'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                    }
                                                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                                                `}
                                                title={isCollapsed ? name : ''}
                                            >
                                                <span className={`
                                                    flex-shrink-0
                                                    ${isCollapsed ? '' : 'mr-2'}
                                                `}>
                                                    {icon}
                                                </span>
                                                {!isCollapsed && (
                                                    <span className="text-xs">{name}</span>
                                                )}
                                            </NavLink>
                                        ))
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Appointment History Section */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
                        <button
                            onClick={handleAppointmentHistoryDropDownClick}
                            className={`
                                w-full flex items-center justify-between px-3 py-3 rounded-t-xl
                                transition-all duration-200 hover:bg-gray-50 cursor-pointer
                                ${isCollapsed ? 'justify-center' : 'justify-between'}
                            `}
                            title={isCollapsed ? 'Appointment History' : ''}
                        >
                            <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                                <span className="text-gray-700">
                                    📋
                                </span>
                                {!isCollapsed && (
                                    <span className="ml-3 font-medium text-sm text-gray-900">Appointment History</span>
                                )}
                            </div>
                            {!isCollapsed && (
                                <span className="text-gray-500">
                                    {appointmentHistoryDropDownOpen ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4" />
                                    )}
                                </span>
                            )}
                        </button>
                        {/* Appointment History Dropdown */}
                        <div className={`
                            overflow-hidden transition-all duration-300 ease-in-out
                            ${appointmentHistoryDropDownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                        `}>
                            <div className="p-2 mr-1 ml-1 mt-1 mb-1 space-y-1">
                                {routes.map(({ layout, pages }, index) => (
                                    pages
                                        .filter((page) => page.name === "Patient Side History")
                                        .map(({ icon, name, path }) => (
                                            <NavLink
                                                key={index}
                                                to={`${layout}${path}`}
                                                onClick={() => {
                                                    if (isMobile) {
                                                        setIsMobileMenuOpen(false);
                                                    } else {
                                                        if (width > 768 && width < 1280) {
                                                            setIsCollapsed(true);
                                                        }
                                                    }
                                                }}
                                                className={({ isActive }) => `
                                                    flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-gray-900 text-white'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                    }
                                                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                                                `}
                                                title={isCollapsed ? name : ''}
                                            >
                                                <span className={`
                                                    flex-shrink-0
                                                    ${isCollapsed ? '' : 'mr-2'}
                                                `}>
                                                    {icon}
                                                </span>
                                                {!isCollapsed && (
                                                    <span className="text-xs">{name}</span>
                                                )}
                                            </NavLink>
                                        ))
                                ))}
                            </div>
                            {/* Clinic Appointment History Dropdown */}
                            <div className="p-2 mr-1 ml-1 mt-1 mb-1 space-y-1">
                                {routes.map(({ layout, pages }, index) => (
                                    pages
                                        .filter((page) => page.name === "Clinic Side History")
                                        .map(({ icon, name, path }) => (
                                            <NavLink
                                                key={index}
                                                to={`${layout}${path}`}
                                                onClick={() => {
                                                    if (isMobile) {
                                                        setIsMobileMenuOpen(false);
                                                    } else {
                                                        if (width > 768 && width < 1280) {
                                                            setIsCollapsed(true);
                                                        }
                                                    }
                                                }}
                                                className={({ isActive }) => `
                                                    flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-gray-900 text-white'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                    }
                                                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                                                `}
                                                title={isCollapsed ? name : ''}
                                            >
                                                <span className={`
                                                    flex-shrink-0
                                                    ${isCollapsed ? '' : 'mr-2'}
                                                `}>
                                                    {icon}
                                                </span>
                                                {!isCollapsed && (
                                                    <span className="text-xs">{name}</span>
                                                )}
                                            </NavLink>
                                        ))
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Patient Management Section */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
                        <button
                            onClick={handlePatientManagementDropDownClick}
                            className={`
                                w-full flex items-center justify-between px-3 py-3 rounded-t-xl
                                transition-all duration-200 hover:bg-gray-50 cursor-pointer
                                ${isCollapsed ? 'justify-center' : 'justify-between'}
                            `}
                            title={isCollapsed ? 'Patient Management' : ''}
                        >
                            <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                                <span className="text-gray-700">
                                    👥
                                </span>
                                {!isCollapsed && (
                                    <span className="ml-3 font-medium text-sm text-gray-900">Patient Management</span>
                                )}
                            </div>
                            {!isCollapsed && (
                                <span className="text-gray-500">
                                    {patientManagementDropDownOpen ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4" />
                                    )}
                                </span>
                            )}
                        </button>
                        {/* Patient Management Dropdown */}
                        <div className={`
                            overflow-hidden transition-all duration-300 ease-in-out
                            ${patientManagementDropDownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                        `}>
                            <div className="p-2 mr-1 ml-1 mt-1 mb-1 space-y-1">
                                {routes.map(({ layout, pages }, index) => (
                                    pages
                                        .filter((page) => page.name === "Consult Patient")
                                        .map(({ icon, name, path }) => (
                                            <NavLink
                                                key={index}
                                                to={`${layout}${path}`}
                                                onClick={() => {
                                                    if (isMobile) {
                                                        setIsMobileMenuOpen(false);
                                                    } else {
                                                        if (width > 768 && width < 1280) {
                                                            setIsCollapsed(true);
                                                        }
                                                    }
                                                }}
                                                className={({ isActive }) => `
                                                    flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-gray-900 text-white'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                    }
                                                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                                                `}
                                                title={isCollapsed ? name : ''}
                                            >
                                                <span className={`
                                                    flex-shrink-0
                                                    ${isCollapsed ? '' : 'mr-2'}
                                                `}>
                                                    {icon}
                                                </span>
                                                {!isCollapsed && (
                                                    <span className="text-xs">{name}</span>
                                                )}
                                            </NavLink>
                                        ))
                                ))}
                            </div>
                            {/* Modify Booked Appointment */}
                            <div className="mt-1 mb-1 mr-1 ml-1 p-2 space-y-1">
                                {routes.map(({ layout, pages }, index) => (
                                    pages
                                        .filter((page) => page.name === "Modify Booked Appointment")
                                        .map(({ icon, name, path }) => (
                                            <NavLink
                                                key={index}
                                                to={`${layout}${path}`}
                                                onClick={() => {
                                                    if (isMobile) {
                                                        setIsMobileMenuOpen(false);
                                                    } else {
                                                        if (width > 768 && width < 1280) {
                                                            setIsCollapsed(true);
                                                        }
                                                    }
                                                }}
                                                className={({ isActive }) => `
                                                    flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-gray-900 text-white'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                    }
                                                    ${isCollapsed ? 'justify-center' : 'justify-start'}
                                                `}
                                                title={isCollapsed ? name : ''}
                                            >
                                                <span className={`
                                                    flex-shrink-0
                                                    ${isCollapsed ? '' : 'mr-2'}
                                                `}>
                                                    {icon}
                                                </span>
                                                {!isCollapsed && (
                                                    <span className="text-xs">{name}</span>
                                                )}
                                            </NavLink>
                                        ))
                                ))}
                            </div>
                        </div>
                    </div>
                </nav>
            </aside>
        </>
    )
}

DoctorsSideNav.propTypes = {
    brandName: PropTypes.string,
    routes: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default DoctorsSideNav;