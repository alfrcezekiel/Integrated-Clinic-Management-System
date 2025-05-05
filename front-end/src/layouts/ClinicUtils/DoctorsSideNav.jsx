import PropTypes from "prop-types"
import "../../App.css"
import {
    Drawer,
    Typography,
    useMediaQuery,
    List,
    ListItemButton,
    ListItemText,
    Collapse,
    ListItem,
} from "@mui/material";
import {
    ExpandLess,
    ExpandMore
} from "@mui/icons-material";
import {
    useCallback,
    useState
} from "react";
import {
    Link,
    NavLink,
    Outlet
} from "react-router-dom"

// this is the sidenav component for the dashboard
const DoctorsSideNav = ({ brandName, routes }) => {
    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [appointmentDropDownOpen, setAppointmentDropDownOpen] = useState(false);
    const [appointmentHistoryDropDownOpen, setAppointmentHistoryDropDownOpen] = useState(false);

    const handleAppointmentDropDownClick = useCallback(() => {
        setAppointmentDropDownOpen(!appointmentDropDownOpen);
    }, [appointmentDropDownOpen])


    const appointmentHistoryDropDown = (dropdown) => {
        setAppointmentHistoryDropDownOpen(!dropdown);
    }

    const handleAppointmentHistoryDropDownClick = useCallback(() => {
        appointmentHistoryDropDown(appointmentHistoryDropDownOpen);
    }, [appointmentHistoryDropDownOpen])

    return (
        <Drawer
            open={open}
            onClose={() => setOpen(false)}
            variant={isMobile ? "temporary" : "permanent"}
            className={`transition-all ${isMobile ? "w-2" : "w-2"}`}
            classes={{ paper: isMobile ? "bg-white w-72 shadow-md" : "w-72 bg-white shadow-md" }}
        >
            <div className="relative p-6">
                <Link to={"/doctor-portal/dashboard/home"}>
                    <Typography variant="h5" className="text-black text-center">
                        {brandName}
                    </Typography>
                </Link>
                <Outlet />
            </div>
            <nav className="p-3">
                {routes.map(({ layout, pages }, index) => (
                    <div key={layout || index} className="mb-4">
                        {pages
                            .filter((page) => page.name !== "Appointments" && page.name !== "Pending Appointments" && page.name !== "Approved Appointments" && page.name !== "Declined Appointments" && page.name !== "Appointment History")
                            .map(({ icon, name, path }) => (
                                <NavLink
                                    key={name}
                                    to={`${layout}${path}`}
                                    className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition ${isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                                >
                                    {icon}
                                    <Typography sx={{ ml: 2 }} className="text-black">{name}</Typography>
                                </NavLink>
                            ))}
                    </div>
                ))}
                <List className="bg-white shadow-lg rounded-2xl">
                    <ListItemButton onClick={handleAppointmentDropDownClick}>
                        <ListItemText primary="Appointments Management" />
                        {appointmentDropDownOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={appointmentDropDownOpen} timeout="auto" unmountOnExit className="p-3">
                        <List component="div" disablePadding>
                            {routes.map(({ layout, pages }, index) => (
                                pages
                                    .filter((page) => page.name === "Appointments")
                                    .map(({ icon, name, path }) => (
                                        <NavLink
                                            key={index}
                                            to={`${layout}${path}`}
                                            className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition ${isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                                        >
                                            {icon}
                                            <ListItemButton>
                                                <ListItemText primary={name} className="text-black" />
                                            </ListItemButton>
                                        </NavLink>
                                    ))
                            ))}
                        </List>
                    </Collapse>
                    <Collapse in={appointmentDropDownOpen} timeout="auto" unmountOnExit className="p-3">
                        <List component="div" disablePadding>
                            {routes.map(({ layout, pages }, index) => (
                                pages
                                    .filter((page) => page.name === "Pending Appointments")
                                    .map(({ icon, name, path }) => (
                                        <NavLink
                                            key={index}
                                            to={`${layout}${path}`}
                                            className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition ${isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
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
                    <Collapse in={appointmentDropDownOpen} timeout="auto" unmountOnExit className="p-3">
                        <List component="div" disablePadding>
                            {routes.map(({ layout, pages }, index) => (
                                pages
                                    .filter((page) => page.name === "Approved Appointments")
                                    .map(({ icon, name, path }) => (
                                        <NavLink
                                            key={index}
                                            to={`${layout}${path}`}
                                            className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition ${isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
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
                    <Collapse in={appointmentDropDownOpen} timeout="auto" unmountOnExit className="p-3">
                        <List component="div" disablePadding>
                            {routes.map(({ layout, pages }, index) => (
                                pages
                                    .filter((page) => page.name === "Declined Appointments")
                                    .map(({ icon, name, path }) => (
                                        <NavLink
                                            key={index}
                                            to={`${layout}${path}`}
                                            className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition ${isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
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
                <List className="bg-white shadow-lg rounded-2xl mt-4">
                    <ListItemButton onClick={handleAppointmentHistoryDropDownClick}>
                        <ListItemText primary="Appointment History" />
                        {appointmentHistoryDropDownOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={appointmentHistoryDropDownOpen} timeout="auto" unmountOnExit className="p-3">
                        <List component="div" disablePadding>
                            {routes.map(({ layout, pages }, index) => (
                                pages
                                    .filter((page) => page.name === "Appointment History")
                                    .map(({ icon, name, path }) => (
                                        <NavLink
                                            key={index}
                                            to={`${layout}${path}`}
                                            className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition ${isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
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

DoctorsSideNav.propTypes = {
    brandName: PropTypes.string,
    routes: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default DoctorsSideNav;