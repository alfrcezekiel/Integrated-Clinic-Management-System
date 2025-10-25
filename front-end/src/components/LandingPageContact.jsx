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
        contactEmailAddress: "",
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
        e.preventDefault();
        try {
            const response = await CMS.post("/contactUs", contactFormData, {
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (response.status === 200) {
                alert(response.data.contactMessage)
                setContactFormData({
                    contactName: "",
                    contactEmailAddress: "",
                    contactSubject: "",
                    contactMessage: ""
                });
                setFieldErrors({});
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setFieldErrors(error.response.data.errors)
            } else {
                console.error(`Error at contacting the admin ${error}`)
            }
        }
    }

    const inputClasses = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white text-gray-800 placeholder-gray-400"
    const errorClasses = "text-red-500 text-sm mt-1"
    const infoItemClasses = "p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow duration-300 h-full"
    const iconClasses = "text-3xl text-blue-600 mb-3"

    return (
        <section id="contact" className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16" data-aos="fade-up">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Contact Us</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Reach out to us for expert dental care. Call, email, or visit our clinic!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12" data-aos="fade-up" data-aos-delay="100">
                    {/* Contact Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className={infoItemClasses} data-aos="fade" data-aos-delay="200">
                            <div className={iconClasses}>
                                <i className="bi bi-geo-alt"></i>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Address</h3>
                            <p className="text-gray-600">Iloilo City, Philippines 5000</p>
                        </div>

                        <div className={infoItemClasses} data-aos="fade" data-aos-delay="300">
                            <div className={iconClasses}>
                                <i className="bi bi-telephone"></i>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Call Us</h3>
                            <p className="text-gray-600">+63 6678 254445 41</p>
                        </div>

                        <div className={infoItemClasses} data-aos="fade" data-aos-delay="400">
                            <div className={iconClasses}>
                                <i className="bi bi-envelope"></i>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Email Us</h3>
                            <p className="text-gray-600">clinicmanagementteam@gmail.com</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md" data-aos="fade-up" data-aos-delay="200">
                        <form onSubmit={handleContactMessage} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <input
                                        name="contactName"
                                        type="text"
                                        className={inputClasses}
                                        placeholder="Your Name"
                                        value={contactFormData.contactName}
                                        onChange={(e) => setContactFormData({ ...contactFormData, contactName: e.target.value })}
                                    />
                                    {fieldErrors.contactName && <p className={errorClasses}>{fieldErrors.contactName}</p>}
                                </div>
                                <div>
                                    <input
                                        name="contactEmailAddress"
                                        type="text"
                                        className={inputClasses}
                                        placeholder="Your Email"
                                        value={contactFormData.contactEmailAddress}
                                        onChange={(e) => setContactFormData({ ...contactFormData, contactEmailAddress: e.target.value })}
                                    />
                                    {fieldErrors.contactEmailAddress && <p className={errorClasses}>{fieldErrors.contactEmailAddress}</p>}
                                </div>
                            </div>
                            <div>
                                <input
                                    name="contactSubject"
                                    type="text"
                                    className={inputClasses}
                                    placeholder="Subject"
                                    value={contactFormData.contactSubject}
                                    onChange={(e) => setContactFormData({ ...contactFormData, contactSubject: e.target.value })}
                                />
                                {fieldErrors.contactSubject && <p className={errorClasses}>{fieldErrors.contactSubject}</p>}
                            </div>
                            <div>
                                <textarea
                                    name="contactMessage"
                                    className={`${inputClasses} min-h-[150px]`}
                                    placeholder="Your Message"
                                    value={contactFormData.contactMessage}
                                    onChange={(e) => setContactFormData({ ...contactFormData, contactMessage: e.target.value })}
                                ></textarea>
                                {fieldErrors.contactMessage && <p className={errorClasses}>{fieldErrors.contactMessage}</p>}
                            </div>
                            <div className="text-center">
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-black/100 text-white font-bold rounded-4xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-colors duration-200"
                                >
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default LandingPageContact;