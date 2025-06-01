import { useContext } from "react";
import { AuthContext } from "./AuthContext";

// This hook provides access to the authorization context, allowing components to use authentication methods and state.
export const useAuthorization = () => {
    const context = useContext(AuthContext); // Access the AuthContext created in AuthContext.jsx
    if (!context) {
        throw new Error("useAuthorization must be used within an AuthorizationProvider");
    }
    return context;
}
