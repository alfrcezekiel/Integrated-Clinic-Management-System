import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuthorization } from "../../context/auth/useAuthorization";

const ProtectedRoutes = ({ children }) => {
    const { isAuthenticated, user } = useAuthorization();

    if (!isAuthenticated && !user) {
        return <Navigate to="/cms" replace />;
    }
    return children;
}

ProtectedRoutes.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ProtectedRoutes;