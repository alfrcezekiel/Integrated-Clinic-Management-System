import "../assets/css/main.css"
import "../assets/vendor/bootstrap/css/bootstrap.min.css"
import "../assets/vendor/bootstrap-icons/bootstrap-icons.css"
import "../assets/vendor/aos/aos.css"
import "../assets/vendor/glightbox/css/glightbox.min.css"
import "../assets/vendor/swiper/swiper-bundle.min.css"
import "../assets/js/main.js";
import "../assets/vendor/bootstrap/js/bootstrap.bundle.min.js";
import "../assets/vendor/glightbox/js/glightbox.min.js"
// import "../assets/vendor/purecounter/purecounter_vanilla.js"
import "../assets/vendor/imagesloaded/imagesloaded.pkgd.min.js"
import "../assets/vendor/isotope-layout/isotope.pkgd.min.js"

const LandingPageFooter = () => {
    return (
        <>
            <footer id="footer" className="footer accent-background">
                <div className="container footer-top">
                    <div className="row gy-4">
                        <div className="col-lg-5 col-md-12 footer-about">
                            <a href="/" className="logo d-flex align-items-center">
                                <span className="sitename">Clinic Management System</span>
                            </a>
                            <p>Cras fermentum odio eu feugiat lide par naso tierra. Justo eget nada terra videa magna derita valies darta donna mare fermentum iaculis eu non diam phasellus.</p>
                            <div className="social-links d-flex mt-4">
                                <a href=""><i className="bi bi-twitter-x"></i></a>
                                <a href=""><i className="bi bi-facebook"></i></a>
                                <a href=""><i className="bi bi-instagram"></i></a>
                                <a href=""><i className="bi bi-linkedin"></i></a>
                            </div>
                        </div>
                        <div className="col-lg-2 col-6 footer-links">
                            <h4>Useful Links</h4>
                            <ul>
                                <li><a href="/">Home</a></li>
                                <li><a href="#">About us</a></li>
                                <li><a href="#">Services</a></li>
                                <li><a href="#">Terms of service</a></li>
                                <li><a href="#">Privacy policy</a></li>
                            </ul>
                        </div>
                        <div className="col-lg-2 col-6 footer-links">
                            <h4>Our Services</h4>
                            <ul>
                                <li><a href="#">Electronic Health Records</a></li>
                                <li><a href="#">Billing and Invoicing</a></li>
                                <li><a href="#">Appointment Scheduling</a></li>
                                <li><a href="#">Payment Integration</a></li>
                                <li><a href="#">Storing of Medical Products</a></li>
                            </ul>
                        </div>
                        <div className="col-lg-3 col-md-12 footer-contact text-center text-md-start">
                            <h4>Contact Us</h4>
                            <p>A108 Adam Street</p>
                            <p>New York, NY 535022</p>
                            <p>United States</p>
                            <p className="mt-4"><strong>Phone:</strong> <span>+1 5589 55488 55</span></p>
                            <p><strong>Email:</strong> <span>info@example.com</span></p>
                        </div>
                    </div>
                </div>
                <div className="container copyright text-center mt-4">
                    <p>© <span>Copyright</span> <strong className="px-1 sitename">CMS</strong> <span>All Rights Reserved | 2025</span></p>
                    {/* <div class="credits"> */}
                        {/* {/* <!-- All the links in the footer should remain intact. --> */}
                        {/* <!-- You can delete the links only if you've purchased the pro version. --> */}
                        {/* <!-- Licensing information: https://bootstrapmade.com/license/ --> */}
                        {/* <!-- Purchase the pro version with working PHP/AJAX contact form: [buy-url] --> */} 
                        {/* Designed by <a href="https://bootstrapmade.com/">BootstrapMade</a> */}
                    {/* </div> */}
                </div>
            </footer>
        </>
    )
}

export default LandingPageFooter;