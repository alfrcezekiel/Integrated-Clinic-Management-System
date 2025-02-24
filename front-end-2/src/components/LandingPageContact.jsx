import "../assets/js/main.js";
import "../assets/vendor/bootstrap/js/bootstrap.bundle.min.js";
import "../assets/vendor/glightbox/js/glightbox.min.js"
// import "../assets/vendor/purecounter/purecounter_vanilla.js"
import "../assets/vendor/imagesloaded/imagesloaded.pkgd.min.js"
import "../assets/vendor/isotope-layout/isotope.pkgd.min.js"
import "../assets/css/main.css"
import "../assets/vendor/bootstrap/css/bootstrap.min.css"
import "../assets/vendor/bootstrap-icons/bootstrap-icons.css"
import "../assets/vendor/aos/aos.css"
import "../assets/vendor/glightbox/css/glightbox.min.css"
import "../assets/vendor/swiper/swiper-bundle.min.css"
import AOS from "aos"
import {useEffect} from "react"

const LandingPageContact = () => {
    useEffect(() => {
        const aos = () => {
            AOS.init({
                duration: 600,
                once: true
            })
        }
        aos();
        return () => {
            AOS.refresh();
        }
    }, [])

    return (
        <>
            {/* <!-- Contact Section --> */}
            <section id="contact" className="contact section">
                {/* <!-- Section Title --> */}
                <div className="container section-title" data-aos="fade-up">
                    <h2>Contact</h2>
                    <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p>
                </div>
                {/* <!-- End Section Title --> */}
                <div className="container" data-aos="fade-up" data-aos-delay="100">
                    <div className="row gy-4">
                        <div className="col-lg-6">
                            <div className="row gy-4">
                                <div className="col-md-6">
                                    <div className="info-item" data-aos="fade" data-aos-delay="200">
                                        <i className="bi bi-geo-alt"></i>
                                        <h3>Address</h3>
                                        <p>A108 Adam Street</p>
                                        <p>New York, NY 535022</p>
                                    </div>
                                </div>
                                {/* <!-- End Info Item --> */}
                                <div className="col-md-6">
                                    <div className="info-item" data-aos="fade" data-aos-delay="300">
                                        <i className="bi bi-telephone"></i>
                                        <h3>Call Us</h3>
                                        <p>+1 5589 55488 55</p>
                                        <p>+1 6678 254445 41</p>
                                    </div>
                                </div>
                                {/* <!-- End Info Item --> */}
                                <div className="col-md-6">
                                    <div className="info-item" data-aos="fade" data-aos-delay="400">
                                        <i className="bi bi-envelope"></i>
                                        <h3>Email Us</h3>
                                        <p>info@example.com</p>
                                        <p>contact@example.com</p>
                                    </div>
                                </div>
                                {/* <!-- End Info Item --> */}
                                <div className="col-md-6">
                                    <div className="info-item" data-aos="fade" data-aos-delay="500">
                                        <i className="bi bi-clock"></i>
                                        <h3>Open Hours</h3>
                                        <p>Monday - Friday</p>
                                        <p>9:00AM - 05:00PM</p>
                                    </div>
                                </div>
                                {/* <!-- End Info Item --> */}
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <form action="" method="post" className="php-email-form" data-aos="fade-up" data-aos-delay="200">
                                <div className="row gy-4">
                                    <div className="col-md-6">
                                        <input type="text" name="name" id="name" className="form-control" placeholder="Your Name" required=""/>
                                    </div>
                                    <div className="col-md-6 ">
                                        <input type="email" className="form-control" id="email" name="email" placeholder="Your Email" required=""/>
                                    </div>
                                    <div className="col-12">
                                        <input type="text" className="form-control" id="subject" name="subject" placeholder="Subject" required=""/>
                                    </div>
                                    <div className="col-12">
                                        <textarea className="form-control" name="message" id="message" rows="6" placeholder="Message" required=""></textarea>
                                    </div>
                                    <div className="col-12 text-center">
                                        <div className="loading">Loading</div>
                                        <div className="error-message"></div>
                                        <div className="sent-message">Your message has been sent. Thank you!</div>
                                        <button type="submit">Send Message</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        {/* <!-- End Contact Form --> */}
                    </div>
                </div>
            </section>
            {/* <!-- /Contact Section --> */}
        </>
    )
}

export default LandingPageContact;