import { AppBar, Toolbar, Typography, Button, IconButton, Breadcrumbs, InputBase, Menu, MenuItem, Avatar } from "@mui/material";
import { Menu as MenuIcon, Notifications, Settings, AccountCircle, AccessTime, CreditCard } from "@mui/icons-material";
import { useMaterialUIController } from "../../context/useController";
import {useLocation, Link} from "react-router-dom";
import { setOpenSidenav } from "../../context/materialUIController";
import path from "path";

const DashboardNavbar = () => {
    const [controller, dispatch] = useMaterialUIController();
    const {fixedNavbar, openSideNav} = controller;
    const location = useLocation();
    const [layout, page] = path.split("/").filter((el) => el !== "");


    return (
        <AppBar
            position={fixedNavbar ? "sticky" : "static"}
            className={`rounded-xl transition-all ${fixedNavbar ? "top-4 z-40 shadow-md shadow-blue-gray-500/5" : "px-0 py-1"}`}
            color={fixedNavbar ? "default" : "transparent"}
        >
            <Toolbar className="flex justify-between">
                <div className="flex items-center gap-2">
                    <IconButton onClick={() => setOpenSidenav(dispatch, !openSideNav)}>
                        <MenuIcon />
                    </IconButton>
                    <Breadcrumbs className="text-gray-600">
                        <Link to={`/${layout}`} className="text-blue-500 hover:underline">
                            <Typography variant="body">{layout}</Typography>
                        </Link>
                    </Breadcrumbs>
                </div>
            </Toolbar>
        </AppBar>
    )
}
export default DashboardNavbar;