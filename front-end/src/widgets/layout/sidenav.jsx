import PropTypes from "prop-types"
import "../../App.css";
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
import { useCallback, useState } from "react";
import {
    Link,
    NavLink,
    Outlet
} from "react-router-dom"
import {
    ExpandLess,
    ExpandMore
} from "@mui/icons-material";

// this is the sidenav component for the dashboard of patients
const SideNav = ({ brandName, routes }) => {
    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [clinicOpen, setClinicOpen] = useState(false);
    const [appointmentOpen, setAppointmentOpen] = useState(false);
    // this function is used to handle the click event of the appointment management button
    const handleDropdownAppointmentClick = useCallback(() => {
        setAppointmentOpen(!appointmentOpen);
    }, [appointmentOpen]);

    // this function is used to handle the click event of the clinic management button
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
                <Link to={"/patients-dashboard/Home"} className="text-black text-center">
                    <Typography variant="h5" className="text-black">
                        {brandName}
                    </Typography>
                </Link>
                <Outlet />
            </div>
            <nav className="p-4">
                {routes.map(({ layout, pages }, index) => (
                    <div key={index} className="mb-4">
                        {pages
                            .filter((page) => page.name !== "View Clinics" && page.name !== "Appointments" && page.name !== "Pending Appointments" && page.name !== "Approved Appointments" && page.name !== "Declined Appointments")
                            .map(({ icon, name, path }) => (
                                <NavLink
                                    key={index}
                                    to={`${layout}${path}`}
                                    className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition ${isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                                >
                                    {icon}
                                    <Typography sx={{ marginLeft: 1 }} className="text-black">{name}</Typography>
                                </NavLink>
                            ))}
                    </div>
                ))}
                <List className="bg-white shadow-lg rounded-2xl">
                    <ListItemButton onClick={handleClinicClick}>
                        <ListItemText primary="Clinic Management" />
                        {clinicOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={clinicOpen} timeout="auto" unmountOnExit className="p-3">
                        <List component="div" disablePadding>
                            {routes.map(({ layout, pages }, index) => (
                                pages
                                    .filter((page) => page.name === "View Clinics")
                                    .map(({ path, icon, name }) => (
                                        <NavLink
                                            key={index}
                                            to={`${layout}${path}`}
                                            className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition ${isActive ? "bg-blue-500 text-black" : "hover:bg-gray-100 p-2"}`}
                                        >
                                            {icon}
                                            <ListItem button="true">
                                                <ListItemText primary={name} className="text-black" />
                                            </ListItem>
                                        </NavLink>
                                    ))
                            ))}
                        </List>
                    </Collapse>
                </List>
                <div className="h-4"></div>
                {/* Dropdown component of appointment management */}
                <List className="bg-white shadow-lg rounded-2xl">
                    <ListItemButton onClick={handleDropdownAppointmentClick}>
                        <ListItemText primary="Appointment Management" />
                        {appointmentOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={appointmentOpen} timeout="auto" unmountOnExit className="p-2">
                        <List component="div" disablePadding>
                            {routes.map(({ layout, pages }, index) => (
                                pages
                                    .filter((page) => page.name === "Appointments")
                                    .map(({ path, name, icon }) => (
                                        <NavLink
                                            key={index}
                                            to={`${layout}${path}`}
                                            className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition ${isActive ? "bg-blue-500 text-black" : "hover:bg-gray-100 p-2"}`}
                                        >
                                            {icon}
                                            <ListItem button="true">
                                                <ListItemText primary={name} className="text-black" />
                                            </ListItem>
                                        </NavLink>
                                    ))
                            ))}
                        </List>
                    </Collapse>
                    <Collapse in={appointmentOpen} timeout="auto" unmountOnExit className="p-2">
                        <List component="div" disablePadding>
                            {routes.map(({ layout, pages }, index) => (
                                pages
                                    .filter((page) => page.name === "Pending Appointments")
                                    .map(({ path, name, icon }) => (
                                        <NavLink
                                            key={index}
                                            to={`${layout}${path}`}
                                            className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition ${isActive ? "bg-blue-500 text-black" : "hover:bg-gray-100 p-2"}`}
                                        >
                                            {icon}
                                            <ListItem button="true">
                                                <ListItemText primary={name} className="text-black" />
                                            </ListItem>
                                        </NavLink>
                                    ))
                            ))}
                        </List>
                    </Collapse>
                    <Collapse in={appointmentOpen} timeout="auto" unmountOnExit className="p-2">
                        <List component="div" disablePadding>
                            {routes.map(({ layout, pages }, index) => (
                                pages
                                    .filter((page) => page.name === "Approved Appointments")
                                    .map(({ path, icon, name }) => (
                                        <NavLink
                                            key={index}
                                            to={`${layout}${path}`}
                                            className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition ${isActive ? "bg-blue-500 text-black" : "hover:bg-gray-100 p-2"}`}
                                        >
                                            {icon}
                                            <ListItem button="true">
                                                <ListItemText primary={name} className="text-black" />
                                            </ListItem>
                                        </NavLink>
                                    ))
                            ))}
                        </List>
                    </Collapse>
                    <Collapse in={appointmentOpen} timeout="auto" unmountOnExit className="p-2">
                        <List component="div" disablePadding>
                            {routes.map(({ layout, pages }, index) => (
                                pages.filter((page) => page.name === "Declined Appointments")
                                    .map(({ path, icon, name }) => (
                                        <NavLink
                                            key={index}
                                            to={`${layout}${path}`}
                                            className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition ${isActive ? "bg-blue-500 text-black" : "hover:bg-gray-100 p-2"}`}
                                        >
                                            {icon}
                                            <ListItem button="true">
                                                <ListItemText primary={name} className="text-black" />
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