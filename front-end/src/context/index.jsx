import {useReducer, useMemo } from "react"
import PropTypes from "prop-types"
import { MaterialUIContext } from "./useController";

const reducer = (state, action) => {
    switch (action.type) {
        case "OPEN_SIDENAV":
            return { ...state, openSideNav: action.value };
        case "SIDENAV_TYPE":
            return { ...state, sideNavType: action.value };
        case "SIDENAV_COLOR":
            return { ...state, sideNavColor: action.value };
        case "TRANSPARENT_NAVBAR":
            return { ...state, transparentNavbar: action.value };
        case "FIXED_NAVBAR":
            return { ...state, fixedNavbar: action.value };
        case "OPEN_CONFIGURATOR":
            return { ...state, openConfigurator: action.value };
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}

export const MaterialUIProvider = ({ children }) => {
    const initialState = {
        openSideNav: false,
        sideNavType: "primary",
        sideNavColor: "default",
        transparentNavbar: true,
        fixedNavbar: false,
        openConfigurator: false,
    }

    const [state, dispatch] = useReducer(reducer, initialState);
    const value = useMemo(() => [state, dispatch], [state, dispatch]);

    return (
        <MaterialUIContext.Provider value={value}>{children}</MaterialUIContext.Provider>
    )
}

MaterialUIProvider.propTypes = {
    children: PropTypes.node.isRequired,
}
