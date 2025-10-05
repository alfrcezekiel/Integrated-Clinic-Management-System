import { useLocation, Link } from "react-router-dom";
import { useEffect, useCallback } from "react";
import PropTypes from "prop-types";

const ScrollLink = ({ to, children, targetId, className, onClick }) => {
    const location = useLocation();

    const handleClick = useCallback(async (e) => {
        if (onClick) {
            onClick();
        }

        if (targetId === "home" && (location.pathname === "/" || location.pathname === "")) {
            e.preventDefault();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            })
            window.history.pushState(null, "", "/");
        }
    }, [location.pathname, onClick, targetId]);

    useEffect(() => {
        if (location.hash === `#${targetId}` || (targetId === "home" && !location.hash)) {
            const element = targetId === "home" ? document.documentElement : document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" })
            }
        }
    }, [location, targetId])

    return (
        <>
            <Link
                to={targetId === "home" && (location.pathname === "/" || location.pathname === "") ? "#" : `${to}#${targetId}`}
                className={className}
                onClick={handleClick}
            >
                {children}
            </Link>
        </>
    )
}

ScrollLink.propTypes = {
    to: PropTypes.string.isRequired,
    targetId: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    onClick: PropTypes.func
}

export default ScrollLink;