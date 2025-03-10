import { AppBar, Toolbar, Typography, IconButton, Breadcrumbs, InputBase, Menu, MenuItem, Avatar } from "@mui/material";
import { Menu as MenuIcon, Notifications, Settings, CreditCard } from "@mui/icons-material";
import { useMaterialUIController } from "../../context/useController";
import { Link, useLocation, Outlet } from "react-router-dom";
import { setOpenConfigurator, setOpenSideNav } from "../../context/materialUIController";
import { useState } from "react";

// this is the navbar component for the dashboard
const DashboardNavbar = () => {
    const [controller, dispatch] = useMaterialUIController();
    const { fixedNavbar, openSideNav } = controller;
    const location = useLocation();
    const pathParts  = location.pathname.substring(1).split("/").filter(Boolean);
    const [layout = "home", page = ""] = pathParts;
    const [anchorEl, setAnchorEl] = useState(null);
    const handleMenuOpen = (e) => {
        setAnchorEl(e.currentTarget);
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
                        <Link to={`/${layout}`} className="text-blue-500">
                            <Typography variant="body1">{layout}</Typography>
                        </Link>
                    </Breadcrumbs>
                    <Outlet />
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
                    <IconButton onClick={() => setOpenConfigurator(dispatch, true)}>
                        <Settings />
                    </IconButton>
                </div>
            </Toolbar>
        </AppBar>
    )
}
export default DashboardNavbar;