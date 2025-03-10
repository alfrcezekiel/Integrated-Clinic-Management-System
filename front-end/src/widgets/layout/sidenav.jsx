import PropTypes from "prop-types"
import "../../assets/css/main.css";
import { Drawer, Typography, useMediaQuery } from "@mui/material";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom"

// this is the sidenav component for the dashboard
const SideNav = ({ brandName, routes }) => {
    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <Drawer
            open={open}
            onClose={() => setOpen(false)}
            variant={isMobile ? "temporary" : "permanent"}
            className={`transition-all ${isMobile ? "w-2" : "w-2"}`}
            classes={{ paper: isMobile ? "bg-white w-72 shadow-md" : "w-72 bg-white shadow-md" }}
        >
            <div className="relative p-6">
                <Link to={"/patients-dashboard"}>
                    <Typography variant="h5" className="text-gray-900">
                        {brandName}
                    </Typography>
                </Link>
                <Outlet />
            </div>
            <nav className="px-4">
                {routes.map(({ title, pages }, index) => (
                    <div key={title || index} className="mb-4">
                        {title && (
                            <Typography variant="body2" className="uppercase text-gray-500 font-bold mb-2">
                                {title}
                            </Typography>
                        )}
                        {pages.map(({ icon, name, path }) => (
                            <NavLink
                                key={name}
                                to={path}
                                className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition ${isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                            >
                                {icon}
                                <Typography sx={{ml: 2}}>{name}</Typography>
                            </NavLink>
                        ))}
                    </div>
                ))}
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