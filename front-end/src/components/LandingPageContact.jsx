import "../assets/js/main.js";
import "../assets/vendor/bootstrap/js/bootstrap.bundle.min.js";
import "../assets/vendor/glightbox/js/glightbox.min.js"
import "../assets/vendor/imagesloaded/imagesloaded.pkgd.min.js"
import "../assets/vendor/isotope-layout/isotope.pkgd.min.js"
import "../assets/css/main.css"
import "../assets/vendor/bootstrap/css/bootstrap.min.css"
import "../assets/vendor/bootstrap-icons/bootstrap-icons.css"
import "../assets/vendor/aos/aos.css"
import "../assets/vendor/glightbox/css/glightbox.min.css"
import "../assets/vendor/swiper/swiper-bundle.min.css"
import AOS from "aos"
import { useEffect, useState } from "react"
import CMS from "../API/CMS.jsx"

const LandingPageContact = () => {
    const [contactFormData, setContactFormData] = useState({
        contactName: "",
        contactEmailAddress: "",
        contactSubject: "",
        contactMessage: ""
    })

    const [fieldErrors, setFieldErrors] = useState({
        contactName: "",
        contactEmail: "",
        contactSubject: "",
        contactMessage: ""
    })

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

    const handleContactMessage = async (e) => {
        try {
            e.preventDefault();
                
            const response = await CMS.post("/CMS/contactUs", contactFormData, {
                headers: {
                    "Content-Type" : "application/json"
                }
            })

            if(response.status === 200){
                alert(response.data.contactMessage)
                setContactFormData(response.data.contactMessage)
                setFieldErrors({});
            }   
        } catch (error) {
            if(error.response && error.response.status === 400){
                setFieldErrors(error.response.data.errors)
            } else {
                console.error(`Error at contacting the admin ${error}`)
            }
        }
    }

    return (
        <>
            {/* <!-- Contact Section --> */}
            <section id="contact" className="contact section">
                {/* <!-- Section Title --> */}
                <div className="container section-title" data-aos="fade-up">
                    <h2>Contact</h2>
                    <p>Reach out to us for expert dental care. Call, email, or visit our clinic!</p>
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
                                        <p>Brgy. Mohon Arevalo</p>
                                        <p>Iloilo City, Philippines 5000</p>
                                    </div>
                                </div>
                                {/* <!-- End Info Item --> */}
                                <div className="col-md-6">
                                    <div className="info-item" data-aos="fade" data-aos-delay="300">
                                        <i className="bi bi-telephone"></i>
                                        <h3>Call Us</h3>
                                        <p>+63 6678 254445 41</p>
                                    </div>
                                </div>
                                {/* <!-- End Info Item --> */}
                                <div className="col-md-6">
                                    <div className="info-item" data-aos="fade" data-aos-delay="400">
                                        <i className="bi bi-envelope"></i>
                                        <h3>Email Us</h3>
                                        <p>sample@gmail.com</p>
                                        <p>sample@gmail.com</p>
                                    </div>
                                </div>
                                {/* <!-- End Info Item --> */}
                                <div className="col-md-6">
                                    <div className="info-item" data-aos="fade" data-aos-delay="500">
                                        <i className="bi bi-clock"></i>
                                        <h3>Open Hours</h3>
                                        <p>Monday - Saturday</p>
                                        <p>9:00AM - 05:00PM</p>
                                    </div>
                                </div>
                                {/* <!-- End Info Item --> */}
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <form onSubmit={handleContactMessage} method="post" className="php-email-form" data-aos="fade-up" data-aos-delay="200">
                                <div className="row gy-4">
                                    <div className="col-md-6">
                                        <input type="text" id="name" className="form-control" placeholder="Your Name" value={contactFormData.contactName} onChange={(e) => setContactFormData({...contactFormData, contactName: e.target.value})}/>
                                        {fieldErrors.contactName && <p className="text-red-500">{fieldErrors.contactName}</p>}
                                    </div>
                                    <div className="col-md-6 ">
                                        <input type="text" className="form-control" id="email" placeholder="Your Email" value={contactFormData.contactEmailAddress} onChange={(e) => setContactFormData({...contactFormData, contactEmailAddress: e.target.value})}/>
                                        {fieldErrors.contactEmail && <p className="text-red-500">{fieldErrors.contactEmail}</p>}
                                    </div>
                                    <div className="col-12">
                                        <input type="text" className="form-control" id="subject"  placeholder="Subject" value={contactFormData.contactSubject} onChange={(e) => setContactFormData({...contactFormData, contactSubject: e.target.value})}/>
                                        {fieldErrors.contactSubject && <p className="text-red-500">{fieldErrors.contactSubject}</p>}
                                    </div>
                                    <div className="col-12">
                                        <textarea className="form-control" id="message" rows="6" placeholder="Message" value={contactFormData.contactMessage} onChange={(e) => setContactFormData({...contactFormData, contactMessage: e.target.value})}></textarea>
                                        {fieldErrors.contactMessage && <p className="text-red-500">{fieldErrors.contactMessage}</p>}
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