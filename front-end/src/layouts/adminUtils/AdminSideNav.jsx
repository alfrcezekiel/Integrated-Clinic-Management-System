import PropTypes from "prop-types"
import "../../assets/css/main.css";
import { Drawer, Typography, useMediaQuery } from "@mui/material";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom"

// this is the sidenav component for the dashboard
const AdminSideNav = ({ brandName, routes }) => {
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
                <Link to={"/admin-dashboard/home"}>
                    <Typography variant="h6" className="text-gray-500">
                        {brandName}
                    </Typography>
                </Link>
                <Outlet />
            </div>
            <nav className="p-3">
                {routes.map(({ layout, pages }, index) => (
                    <div key={layout || index} className="mb-4">
                        {pages.map(({ icon, name, path }) => (
                            <NavLink
                                key={name}
                                to={`${layout}${path}`}
                                className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition ${isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                            >
                                {icon}
                                <Typography sx={{ ml: 2 }}>{name}</Typography>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>
        </Drawer>
    )
}

AdminSideNav.propTypes = {
    brandName: PropTypes.string,
    routes: PropTypes.arrayOf(PropTypes.object).isRequired
}
AdminSideNav.defaultProps = {
    brandName: "Admin Dashboard | CMS"
}

export default AdminSideNav;