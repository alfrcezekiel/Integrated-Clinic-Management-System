import { useEffect, useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useMaterialUIController } from "../../context/useController";
import { setOpenConfigurator, setOpenSideNav } from "../../context/materialUIController";
import CMS from "../../API/CMS";
import LogoutDialog from "../../components/loguoutConfirmation";
import { useAuthorization } from "../../context/auth/useAuthorization";
import { FiMenu, FiBell, FiSettings, FiCreditCard, FiLogOut, FiChevronRight } from "react-icons/fi";

const DashboardNavbar = () => {
    const [controller, dispatch] = useMaterialUIController();
    const { fixedNavbar, openSideNav } = controller;
    const location = useLocation();
    const pathParts = location.pathname.substring(1).split("/").filter(Boolean);
    const [layout = "home", page = "", path = "Home", name = "Patient's Dashboard"] = pathParts;
    const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
    const [logoutDialog, setLogoutDialog] = useState(false);
    const navigate = useNavigate();
    const [patientNameWithPrefix, setPatientNameWithPrefix] = useState("");
    const { logout, user, token } = useAuthorization();

    useEffect(() => {
        const handleClickOutside = e => {
            if (settingsAnchorEl && !e.target.closest('.user-menu-container')) {
                setSettingsAnchorEl(null);
            }
        }

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        }
    }, [settingsAnchorEl])

    useEffect(() => {
        const patientNameWithSuffix = () => {
            const first_name = user?.sfn || "";
            const prefix = user?.sprefix || "";

            const patient_full_name = `${prefix} ${first_name}`;
            setPatientNameWithPrefix(patient_full_name);
        }
        patientNameWithSuffix();
    }, [user?.sfn, user?.sprefix])

    const handleLogoutConfirm = async () => {
        const tokenContext = token || localStorage.getItem("authToken");

        if (!tokenContext) {
            console.error("No token found in context or localStorage");
        }

        try {
            const response = await CMS.get("/patientsDashboard/logout", {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`,
                }
            });

            if (!response.data || !response.data.message) {
                throw new Error("No response data or no success message");
            } else {
                logout();
                navigate("/cms");
            }
        } catch (error) {
            console.error(`Code functionality error for logging out: ${error}`);
            logout();
            navigate("/cms");
        } finally {
            setLogoutDialog(false);
        }
    }

    const handleLogout = () => {
        setLogoutDialog(true);
    }

    const handleLogoutDialogClose = () => {
        setLogoutDialog(false);
    }

    const handleSettingsMenuOpen = (e) => {
        e.stopPropagation();
        setSettingsAnchorEl(settingsAnchorEl ? null : e.currentTarget);
    }

    return (
        <nav className={`fixed top-0 left-0 right-0 z-40 transition-all ${fixedNavbar ? 'bg-white shadow-md' : 'bg-white shadow-md'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Left side - Menu and Breadcrumbs */}
                    <div className="flex items-center">
                        <button
                            onClick={() => setOpenSideNav(dispatch, !openSideNav)}
                            className="xl:hidden lg:hidden md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                        >
                            <FiMenu className="h-6 w-6" />
                        </button>

                        <div className="hidden md:ml-10 md:flex md:items-center space-x-2 lg:ml-8 xl:flex">
                            <nav className="flex" aria-label="Breadcrumb">
                                <ol className="flex items-center space-x-2">
                                    <li>
                                        <Link
                                            to={`/${layout}/${path}`}
                                            className="text-gray-600 hover:text-blue-600 text-sm font-medium"
                                        >
                                            {name}
                                        </Link>
                                    </li>
                                    {page && (
                                        <>
                                            <li className="flex items-center">
                                                <FiChevronRight className="h-4 w-4 text-gray-400" />
                                            </li>
                                            <li>
                                                <span className="text-gray-700 text-sm font-medium">
                                                    {page}
                                                </span>
                                            </li>
                                        </>
                                    )}
                                </ol>
                            </nav>
                        </div>
                    </div>

                    {/* Right side - Search and User Menu */}
                    <div className="flex items-center space-x-4">
                        {/* Notification Bell */}
                        <button
                            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none"
                        >
                            <FiBell className="h-5 w-5" />
                        </button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                className="flex items-center text-sm rounded-full focus:outline-none cursor-pointer"
                                onClick={handleSettingsMenuOpen}
                            >
                                <span className="sr-only">Open user menu</span>
                                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                    {patientNameWithPrefix ? patientNameWithPrefix.charAt(5) : 'U'}
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {settingsAnchorEl && (
                                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                    <div className="py-1" role="menu" aria-orientation="vertical">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">{patientNameWithPrefix || 'User'}</p>
                                            <p className="text-xs text-gray-500">Patient</p>
                                        </div>
                                        <a
                                            href="#"
                                            onClick={() => setOpenConfigurator(dispatch, true)}
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            role="menuitem"
                                        >
                                            <FiSettings className="mr-3 h-5 w-5 text-gray-400" />
                                            Settings
                                        </a>
                                        <a
                                            href="#"
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            role="menuitem"
                                        >
                                            <FiCreditCard className="mr-3 h-5 w-5 text-gray-400" />
                                            Billing
                                        </a>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            role="menuitem"
                                        >
                                            <FiLogOut className="mr-3 h-5 w-5 text-red-400" />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <LogoutDialog
                open={logoutDialog}
                onClose={handleLogoutDialogClose}
                onConfirm={handleLogoutConfirm}
            />
            <Outlet />
        </nav>
    );
};

export default DashboardNavbar;