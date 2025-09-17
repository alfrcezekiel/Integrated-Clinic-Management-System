import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Footer = ({ brandName, brandLink }) => {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-white mt-8">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0">
                        <Link to={brandLink} className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-300">
                            {brandName}
                        </Link>
                        <p className="mt-2 text-gray-600">Providing quality healthcare services</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Quick Links</h3>
                            <div className="mt-4 space-y-2">
                                <Link to="/about" className="block text-gray-600 hover:text-blue-600 transition-colors duration-300">About Us</Link>
                                <Link to="/services" className="block text-gray-600 hover:text-blue-600 transition-colors duration-300">Services</Link>
                                <Link to="/doctors" className="block text-gray-600 hover:text-blue-600 transition-colors duration-300">Our Doctors</Link>
                                <Link to="/contact" className="block text-gray-600 hover:text-blue-600 transition-colors duration-300">Contact</Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Legal</h3>
                            <div className="mt-4 space-y-2">
                                <Link to="/privacy" className="block text-gray-600 hover:text-blue-600 transition-colors duration-300">Privacy Policy</Link>
                                <Link to="/terms" className="block text-gray-600 hover:text-blue-600 transition-colors duration-300">Terms of Service</Link>
                                <Link to="/cookies" className="block text-gray-600 hover:text-blue-600 transition-colors duration-300">Cookie Policy</Link>
                            </div>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Contact Us</h3>
                            <div className="mt-4 space-y-2">
                                <p className="text-gray-600">123 Clinic St.</p>
                                <p className="text-gray-600">City, State 12345</p>
                                <p className="text-gray-600">Phone: (123) 456-7890</p>
                                <p className="text-gray-600">Email: clinicmanagementteam@gmail.com</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-500 text-sm text-center md:text-left">
                            &copy; {year} {brandName}. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors duration-300">
                                <span className="sr-only">Facebook</span>
                                <i className="fab fa-facebook"></i>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors duration-300">
                                <span className="sr-only">Twitter</span>
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors duration-300">
                                <span className="sr-only">Instagram</span>
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors duration-300">
                                <span className="sr-only">LinkedIn</span>
                                <i className="fab fa-linkedin"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

Footer.propTypes = {
    brandName: PropTypes.string.isRequired,
    brandLink: PropTypes.string.isRequired,
};

export default Footer;