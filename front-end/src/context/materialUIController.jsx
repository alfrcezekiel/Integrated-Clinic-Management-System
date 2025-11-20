export const setOpenSideNav = (dispatch, value) => {
    if (typeof dispatch === "function") {
        if (typeof value === "function") {
            dispatch((state) => ({type: "OPEN_SIDENAV", value: value(state)}));
        } else {
            dispatch({type: "OPEN_SIDENAV", value: value});    
        }
    } else {
        console.error("Dispatch is not a function");
    }
}

export const setSidenavType = (dispatch, value) => dispatch({ type: "SIDENAV_TYPE", value });
export const setSidenavColor = (dispatch, value) => dispatch({ type: "SIDENAV_COLOR", value });
export const setTransparentNavbar = (dispatch, value) => dispatch({ type: "TRANSPARENT_NAVBAR", value });
export const setFixedNavbar = (dispatch, value) => dispatch({ type: "FIXED_NAVBAR", value });
export const setOpenConfigurator = (dispatch, value) => dispatch({ type: "OPEN_CONFIGURATOR", value });