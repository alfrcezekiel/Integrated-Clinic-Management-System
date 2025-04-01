import { AppBar, Toolbar, Typography, IconButton, Breadcrumbs, InputBase, Menu, MenuItem, Avatar } from "@mui/material";
import { Menu as MenuIcon, Notifications, Settings, CreditCard, Logout } from "@mui/icons-material";
import { useMaterialUIController } from "../../context/useController";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { setOpenConfigurator, setOpenSideNav } from "../../context/materialUIController";
import { useState } from "react";
import CMS from "../../API/CMS";
import LogoutDialog from "../../components/loguoutConfirmation";

// this is the navbar component for the dashboard
const DashboardNavbar = () => {
    const [controller, dispatch] = useMaterialUIController();
    const { fixedNavbar, openSideNav } = controller;
    const location = useLocation();
    const pathParts = location.pathname.substring(1).split("/").filter(Boolean);
    const [layout = "home", page = "", path = "Home", name="Patient's Dashboard"] = pathParts;
    const [anchorEl, setAnchorEl] = useState(null);
    const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
    const handleMenuOpen = (e) => {
        setAnchorEl(e.currentTarget);
    }
    const [logoutDialog, setLogoutDialog] = useState(false);

    const navigate = useNavigate();

    const handleLogoutConfirm = async () => {
        try {
            const response = await CMS.get("/CMS/patientsDashboard/logout");
            if (!response.data || !response.data.message) {
                throw new Error("No response data or no success message");
            } else {
                localStorage.removeItem("authToken");
                localStorage.removeItem("sid")
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
                        <Link to={`/${layout}/${path}`} className="text-blue-500">
                            <Typography variant="body1">{name}</Typography>
                        </Link>
                    </Breadcrumbs>
                    <Outlet />
                    <Typography variant="body2" className="text-gray-600">/</Typography>
                    <Typography variant="body1" className="text-gray-600">
                        {page}
                    </Typography>
                </div>
                <div className="flex items-center gap-4">
                    <InputBase placeholder="Search your desired clinic center" className="border px-2 py-1 rounded-md w-full" />
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