import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuthorization } from "../../context/auth/useAuthorization.jsx";

const RestrictedRoutes = ({ children }) => {
    const auth = useAuthorization();
    const { isAuthenticated, user, loading } = auth;

    if (loading) return null;

    if (isAuthenticated() && user) {
        return <Navigate to="/patients-dashboard/Home" replace />;
    }
    return children;
}

RestrictedRoutes.propTypes = {
    children: PropTypes.node.isRequired,
}

export default RestrictedRoutes;