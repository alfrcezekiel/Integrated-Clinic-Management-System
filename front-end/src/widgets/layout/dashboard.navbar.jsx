import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Breadcrumbs,
    InputBase,
    Menu,
    MenuItem,
    Avatar,
    Card,
    CardContent
} from "@mui/material";
import { Menu as MenuIcon, Notifications, Settings, CreditCard, Logout } from "@mui/icons-material";
import { useMaterialUIController } from "../../context/useController";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { setOpenConfigurator, setOpenSideNav } from "../../context/materialUIController";
import { useCallback, useEffect, useMemo, useState } from "react";
import CMS from "../../API/CMS";
import LogoutDialog from "../../components/loguoutConfirmation";

// this is the navbar component for the dashboard
const DashboardNavbar = () => {
    const [controller, dispatch] = useMaterialUIController();
    const { fixedNavbar, openSideNav } = controller;
    const location = useLocation();
    const pathParts = location.pathname.substring(1).split("/").filter(Boolean);
    const [layout = "home", page = "", path = "Home", name = "Patient's Dashboard"] = pathParts;
    const [anchorEl, setAnchorEl] = useState(null);
    const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
    const handleMenuOpen = (e) => {
        setAnchorEl(e.currentTarget);
    }
    const [logoutDialog, setLogoutDialog] = useState(false);
    const [filteredClinics, setFilteredClinics] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const [patientNameWithPrefix, setPatientNameWithPrefix] = useState("");

    useEffect(() => {
        const fetchClinicData = async () => {
            try {
                const response = await CMS.get("/CMS/patients-dashboard/filter_search", {
                    params: {
                        clinicName: searchQuery,
                        clinicType: searchQuery,
                        clinicAddress: searchQuery
                    }
                })

                if (response.status === 200) {
                    setFilteredClinics(response.data.clinics)
                }
            } catch (error) {
                console.error(`Code functionality error for fetching clinic data: ${error}`);
            }
        }

        if (searchQuery.length > 2) {
            fetchClinicData();
        } else {
            setFilteredClinics([])
        }

        const patientNameWithSuffix = () => {
            const first_name = localStorage.getItem("sfn");
            const prefix = localStorage.getItem("sprefix");

            const patient_full_name = `${prefix} ${first_name}`;
            setPatientNameWithPrefix(patient_full_name);
        }
        patientNameWithSuffix();
    }, [searchQuery])

    const memoizedSearchQueryValue = useMemo(() => searchQuery, [searchQuery])
    const handleSearchChange = useCallback(async (e) => {
        const { value } = e.target;
        setSearchQuery(value);
    }, [])

    const handleLogoutConfirm = async () => {
        try {
            const response = await CMS.get("/CMS/patientsDashboard/logout", {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });
            
            if (!response.data || !response.data.message) {
                throw new Error("No response data or no success message");
            } else {
                localStorage.removeItem("authToken");
                localStorage.removeItem("sid")
                localStorage.removeItem("sfn")
                localStorage.removeItem("sln")
                localStorage.removeItem("sem")
                localStorage.removeItem("sprefix")
                navigate("/cms");
            }
        } catch (error) {
            console.error(`Code functionality error for logging out: ${error}`);
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
        setSettingsAnchorEl(e.currentTarget);
    }
    const handleSettingsMenuClose = () => {
        setSettingsAnchorEl(null);
    }
    const handleMenuClose = () => {
        setAnchorEl(null);
    }

    return (
        <AppBar
            position={fixedNavbar ? "fixed" : "static"}
            className={`rounded-xl transition-all ${fixedNavbar ? "top-4 z-40 shadow-md shadow-blue-gray-500/5" : "px-0 py-1"}`}
            sx={{ backgroundColor: fixedNavbar ? "white" : "transparent" }}
        >
            <Toolbar className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <IconButton onClick={() => setOpenSideNav(dispatch, !openSideNav)}>
                        <MenuIcon />
                    </IconButton>
                    <Breadcrumbs className="text-gray-600">
                        <Link to={`/${layout}/${path}`} className="text-black">
                            <Typography variant="body1">{name}</Typography>
                        </Link>
                    </Breadcrumbs>
                    <Outlet />
                    <Typography variant="body2" className="text-black">/</Typography>
                    <Typography variant="body1" className="text-black">
                        {page}
                    </Typography>
                </div>
                <div className="flex items-center gap-4">
                    <InputBase
                        placeholder="Search your desired clinic center"
                        className="border px-2 py-1 rounded-md w-full"
                        value={memoizedSearchQueryValue}
                        name="filterSearch"
                        onChange={handleSearchChange}
                    />
                    <div className="search-results">
                        {filteredClinics.length > 0 ? (
                            filteredClinics.map((clinic, index) => (
                                <div key={index} className="clinic-item">
                                    <Card key={index} className="clinic-card mb-4" sx={{ width: 300 }}>
                                        <CardContent>
                                            <Typography variant="h6">{clinic.clinic_name}</Typography>
                                            <Typography variant="body2">{clinic.clinic_address}</Typography>
                                            <Typography variant="body2">{clinic.clinic_type}</Typography>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))
                        ) : (
                            <Typography>No results found</Typography>
                        )}
                    </div>
                    <IconButton onClick={handleMenuOpen}>
                        <Notifications />
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} keepMounted>
                        <MenuItem>
                            <Avatar src="" />
                            <Typography className="ml-2">New Message from Doctor</Typography>
                        </MenuItem>
                        <MenuItem>
                            <Avatar src="" />
                            <Typography className="ml-2">New Doctor has been added</Typography>
                        </MenuItem>
                        <MenuItem>
                            <CreditCard className="mr-2" />
                            <Typography>Payment has been made</Typography>
                        </MenuItem>
                    </Menu>
                    <IconButton onClick={handleSettingsMenuOpen}>
                        <Settings />
                    </IconButton>
                    <Menu
                        anchorEl={settingsAnchorEl}
                        open={Boolean(settingsAnchorEl)}
                        onClose={handleSettingsMenuClose}
                        keepMounted
                    >
                        <MenuItem>
                            <Typography variant="body1">{patientNameWithPrefix}</Typography>
                        </MenuItem>
                        <MenuItem onClick={() => setOpenConfigurator(dispatch, true)}>
                            <Settings className="mr-2" />
                            <Typography>Settings</Typography>
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <Logout className="mr-2" />
                            <Typography>Logout</Typography>
                        </MenuItem>
                    </Menu>
                </div>
            </Toolbar>
            <LogoutDialog
                open={logoutDialog}
                onClose={handleDialogClose}
                onConfirm={handleLogoutConfirm}
            />
        </AppBar>
    )
}
export default DashboardNavbar;