import { useEffect, useState } from "react";
import {
    Menu as MenuIcon,
    Notifications,
    Settings,
    CreditCard,
    Logout
} from "@mui/icons-material";
import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";
import CMS from "../../API/CMS";
import LogoutDialog from "../../components/loguoutConfirmation";
import { useAuthorization } from "../../context/auth/useAuthorization";
import { removeLocalStorage } from "../../utils/storage/localStorage";

// this is the navbar component for the dashboard
const DoctorsDashboardNavbar = () => {
    const location = useLocation();
    const pathParts = location.pathname.substring(1).split("/").filter(Boolean);
    const [layout = "/dashboard/home", page = "", path = "/dashboard/home", name = "Clinic Dashboard"] = pathParts;
    const [anchorEl, setAnchorEl] = useState(null);
    const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);

    const handleMenuOpen = (e) => {
        setAnchorEl(anchorEl ? null : e.currentTarget);
    }
    const [logoutDialog, setLogoutDialog] = useState(false);
    const { token } = useAuthorization();
    const navigate = useNavigate();

    const tokenContext = token;
    if (!tokenContext) {
        console.error("No token found in context or localStorage");
    }

    const handleLogoutConfirm = async () => {
        try {
            const response = await CMS.get("/doctors-dashboard/logout", {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                }
            });

            if (!response.data || !response.data.message) {
                throw new Error("No response for logging out the doctors details");
            } 

            if (response.status === 200) {
                removeLocalStorage("authToken");
                removeLocalStorage("userData");
                navigate("/cms");
            }
            
        } catch (error) {
            console.error(`Code functionality error for logging out: ${error}`);
            navigate("/cms");
        } finally {
            setLogoutDialog(false);
        }
    }

    const handleLogout = () => {
        setLogoutDialog(true);
    }

    const handleDialogClose = () => {
        setLogoutDialog(false);
    }

    const handleSettingsMenuOpen = (e) => {
        setSettingsAnchorEl(settingsAnchorEl ? null : e.currentTarget);
    }
    const handleSettingsMenuClose = () => {
        setSettingsAnchorEl(null);
    }

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (anchorEl && !event.target.closest('.notification-dropdown')) {
                setAnchorEl(null);
            }
            if (settingsAnchorEl && !event.target.closest('.settings-dropdown')) {
                setSettingsAnchorEl(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [anchorEl, settingsAnchorEl]);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200">
                <div className="max-w-full px-2 sm:px-4 lg:px-6 xl:px-8">
                    <div className="flex justify-between items-center h-16 sm:h-16">
                        {/* Left side - Menu and breadcrumbs */}
                        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                            <button
                                onClick={() => {
                                    const width = window.innerWidth;
                                    if (width > 768 && width < 1280) {
                                        window.dispatchEvent(new CustomEvent('toggleSideBar'));
                                    } else {
                                        window.dispatchEvent(new CustomEvent('toggleMobileMenu'));
                                    }
                                }}
                                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex-shrink-0 cursor-pointer"
                            >
                                <MenuIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                            </button>

                            {/* Breadcrumbs - Responsive */}
                            <div className="hidden sm:flex items-center text-xs sm:text-sm text-gray-600 min-w-0">
                                <Link
                                    to={`/${layout}/dashboard/${path}`}
                                    className="hover:text-blue-600 transition-colors duration-200 font-medium truncate max-w-[100px] sm:max-w-none"
                                >
                                    {name}
                                </Link>
                                {page && (
                                    <>
                                        <span className="mx-1.5 sm:mx-2 text-gray-400 flex-shrink-0">&gt;</span>
                                        <span className="text-gray-900 font-medium truncate max-w-[80px] sm:max-w-none">{page}</span>
                                    </>
                                )}
                                {path && (
                                    <>
                                        <span className="mx-1.5 sm:mx-2 text-gray-400 flex-shrink-0">&gt;</span>
                                        <span className="text-gray-500 truncate max-w-[60px] sm:max-w-none hidden sm:inline">{path}</span>
                                    </>
                                )}
                            </div>

                            {/* Mobile breadcrumb - simplified */}
                            <div className="sm:hidden flex items-center text-xs text-gray-600 min-w-0">
                                <span className="max-sm:hidden truncate max-w-[120px] font-medium">{page || name}</span>
                            </div>
                        </div>

                        {/* Right side - Search, notifications, settings */}
                        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
                            {/* Search - Responsive */}
                            <div className="hidden sm:block relative">
                                <input
                                    type="text"
                                    placeholder="Search clinic center"
                                    className="w-32 lg:w-48 xl:w-64 px-3 py-1.5 lg:px-4 lg:py-2 pl-8 lg:pl-10 text-xs lg:text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                                <svg className="absolute left-2 lg:left-3 top-1.5 lg:top-2.5 w-3 h-3 lg:w-4 lg:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            {/* Mobile search button */}
                            <button className="sm:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>

                            {/* Notifications dropdown - Responsive */}
                            <div className="relative notification-dropdown">
                                <button
                                    onClick={handleMenuOpen}
                                    className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                                >
                                    <Notifications className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                                    <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>

                                {anchorEl && (
                                    <div className="absolute right-0 mt-1 sm:mt-2 w-72 sm:w-80 lg:w-96 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50" onClick={(e) => e.stopPropagation()}>
                                        <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                                            <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Notifications</h3>
                                        </div>
                                        <div className="max-h-64 sm:max-h-96 overflow-y-auto">
                                            <div className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                                                <div className="flex items-start gap-2 sm:gap-3">
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs sm:text-xs text-blue-600 font-medium">DR</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">New Message from Doctor</p>
                                                        <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">2 minutes ago</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                                                <div className="flex items-start gap-2 sm:gap-3">
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs sm:text-xs text-green-600 font-medium">+</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">New Doctor has been added</p>
                                                        <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">1 hour ago</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                                                <div className="flex items-start gap-2 sm:gap-3">
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">Payment has been made</p>
                                                        <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">3 hours ago</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-3 sm:px-4 py-2 border-t border-gray-100">
                                            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all notifications</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Settings dropdown - Responsive */}
                            <div className="relative settings-dropdown">
                                <button
                                    onClick={handleSettingsMenuOpen}
                                    className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                                >
                                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                                </button>

                                {settingsAnchorEl && (
                                    <div className="absolute right-0 mt-1 sm:mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => {
                                                window.dispatchEvent(new CustomEvent('openConfigurator'));
                                                handleSettingsMenuClose();
                                            }}
                                            className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm cursor-pointer text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 sm:gap-3"
                                        >
                                            <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                            <span>Settings</span>
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="cursor-pointer w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 sm:gap-3"
                                        >
                                            <Logout className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Add padding to prevent content from being hidden behind fixed navbar */}
            <div className="h-14 sm:h-16"></div>

            <LogoutDialog
                open={logoutDialog}
                onClose={handleDialogClose}
                onConfirm={handleLogoutConfirm}
            />
        </>
    )
}
export default DoctorsDashboardNavbar;