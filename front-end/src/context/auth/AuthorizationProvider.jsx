import {
    useState,
    useEffect
} from "react";
import PropTypes from "prop-types";
import { AuthContext } from "./AuthContext.jsx";
import {
    removeLocalStorage,
    getLocalStorage
} from "../../utils/storage/localStorage";
import CMS from "../../API/CMS.jsx";

export const AuthorizationProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load the token and user data from localStorage when the component mounts
    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("userData");
        if (storedToken) {
            setToken(storedToken);
        }

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Error parsing user data from localStorage:", error);
                setUser(null);
            }
        }

        setLoading(false);
    }, [])

    /**
     * functions to manage authentication state
     */
    const login = (authToken) => {
        localStorage.setItem("authToken", authToken);
        setToken(authToken);
    }

    /**
     * function to removed the authrization token and user data from localStorage
     */
    const logout = async () => {
        try {
            await CMS.post(`/cms.api.com/logoutRefreshToken`, {}, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getLocalStorage("authToken")}`,
                },
            })
        } catch (error) {
            console.error(`Error in clearing the refresh token during logout: ${error}`)
        } finally {
            removeLocalStorage("authToken");
            removeLocalStorage("userData");
            setToken(null);
            setUser(null);

            window.location.href = "/cms"
        }
    }

    /**
     * function to check if the user is authenticated
     */
    const isAuthenticated = () => {
        return token !== null;
    }

    /**
     * function to set user data in localStorage and state
     */
    const userData = (userObj) => {
        localStorage.setItem("userData", JSON.stringify(userObj));
        setUser(userObj);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                userData,
                token,
                login,
                logout,
                isAuthenticated,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

AuthorizationProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
