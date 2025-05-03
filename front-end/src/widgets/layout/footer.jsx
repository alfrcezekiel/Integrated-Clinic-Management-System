import PropTypes from 'prop-types';
import { Typography, Link } from '@mui/material';

const Footer = ({ brandName, brandLink }) => {
    const year = new Date().getFullYear();

    return (
        <footer className='p-2 relative'>
            <div className='flex w-full flex-wrap items-center justify-center gap-6 px-2 md:justify-center'>
                <Typography variant="paragraph" className="text-inherit text-center">
                    <Link
                        href={brandLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-500 font-bold text-center"
                    >
                        {brandName} &copy;  <span className="text-black"> {year} | All Rights Reserved</span>
                    </Link>
                </Typography>
            </div>
        </footer>
    )
}

Footer.propTypes = {
    brandName: PropTypes.string,
    brandLink: PropTypes.string
}

export default Footer;