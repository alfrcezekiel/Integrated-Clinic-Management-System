import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import PropTypes from "prop-types";

const ScrollLink = ({ to, children, targetId, className, onClick }) => {
    const location = useLocation();

    useEffect(() => {
        if (location.hash === `#${targetId}`) {
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" })
            }
        }
    }, [location, targetId])

    return (
        <>
            <Link to={`${to}#${targetId}`} className={className} onClick={onClick}>
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