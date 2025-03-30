import PropTypes from "prop-types"
import "../../assets/css/main.css";
import {
    Drawer,
    Typography,
    useMediaQuery,
    Collapse,
    List,
    ListItem,
    ListItemButton,
    ListItemText
} from "@mui/material";
import { useState } from "react";
import {
    Link,
    NavLink,
    Outlet
} from "react-router-dom"
import {
    ExpandLess,
    ExpandMore
} from "@mui/icons-material";

// this is the sidenav component for the dashboard
const SideNav = ({ brandName, routes }) => {
    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [clinicOpen, setClinicOpen] = useState(false);

    const handleClinicClick = () => {
        setClinicOpen(!clinicOpen);
    }

    return (
        <Drawer
            open={open}
            onClose={() => setOpen(false)}
            variant={isMobile ? "temporary" : "permanent"}
            className={`transition-all ${isMobile ? "w-2" : "w-2"}`}
            classes={{ paper: isMobile ? "bg-white w-72 shadow-md" : "w-72 bg-white shadow-md" }}
        >
            <div className="relative p-6">
                <Link to={"/patients-dashboard/home"}>
                    <Typography variant="h5" className="text-gray-900">
                        {brandName}
                    </Typography>
                </Link>
                <Outlet />
            </div>
            <nav className="p-4">
                {routes.map(({ layout, pages }, index) => (
                    <div key={index} className="mb-4">
                        {pages.filter((page) => page.name !== "Clinics" ).map(({ icon, name, path }) => (
                            <NavLink
                                key={index}
                                to={`${layout}${path}`}
                                className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition ${isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                            >
                                {icon}
                                <Typography sx={{ml: 2}} className="text-black">{name}</Typography>
                            </NavLink>
                        ))}
                    </div>
                ))}
                <List className="bg-white shadow-lg rounded-2xl">
                    <ListItemButton onClick={handleClinicClick}>
                        <ListItemText primary="Clinic Management"/>
                        {clinicOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={clinicOpen} timeout="auto" unmountOnExit className="p-3">
                        <List component="div" disablePadding>
                            {routes.map(({ layout, pages }, index) => (
                                pages.filter((page) => page.name === "Clinics").map(({ path }) => (
                                    <NavLink
                                        key={index}
                                        to={`${layout}${path}`}
                                        className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition ${isActive ? "bg-blue-500 text-black" : "hover:bg-gray-100 p-2"}`}
                                    >
                                        <ListItem button="true">
                                            <ListItemText primary="View Clinics" className="text-black"/>
                                        </ListItem>
                                    </NavLink>
                                ))
                            ))}
                        </List>
                    </Collapse>
                </List>
            </nav>
        </Drawer>
    )
}

SideNav.propTypes = {
    brandName: PropTypes.string,
    routes: PropTypes.arrayOf(PropTypes.object).isRequired
}
SideNav.defaultProps = {
    brandName: "Patients Dashboard"
}

export default SideNav;