import PropTypes from 'prop-types';
import { Typography, Link } from '@mui/material';

const Footer = ({brandName, brandLink}) => {
    const year = new Date().getFullYear();

    return (
        <footer className='p-2 relative'>
            <div className='flex w-full flex-wrap items-center justify-center gap-6 px-2 md:justify-center'>
                <Typography variant="paragraph" className="text-inherit text-center">
                    {brandName || "Clinic Management System"} &copy; {year} |   All rights reserved
                    <Link
                        href={brandLink || "https://clinic-management-system.com"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-500 font-bold"
                    >
                    {brandName}
                    </Link>
                </Typography>
            </div>
        </footer>
    )
}   

Footer.defaultProps = {
    brandName: "Clinic Management System",
    brandLink: "https://clinic-management-system.com"
}

Footer.propTypes = {
    brandName: PropTypes.string,
    brandLink: PropTypes.string
}

export default Footer;