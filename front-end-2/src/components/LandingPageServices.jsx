import "../assets/vendor/bootstrap/css/bootstrap.min.css"
import "../assets/vendor/bootstrap-icons/bootstrap-icons.css"
import "../assets/vendor/aos/aos.css"   
import "../assets/vendor/swiper/swiper-bundle.min.css" 
import "../assets/css/main.css"
import "../assets/vendor/glightbox/css/glightbox.min.css"

const LandingPageServices = () => {
    return (
        <>
            {/* <!-- Services Section --> */}
            <section id="services" className="services section">

                {/* <!-- Section Title --> */}
                <div className="container section-title" data-aos="fade-up">
                    <h2>Services</h2>
                    <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p>
                </div>
                {/* <!-- End Section Title --> */}

                <div className="container">

                    <div className="row gy-4">

                        <div className="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="100">
                            <div className="service-item d-flex">
                                <div className="icon flex-shrink-0"><i className="bi bi-briefcase"></i></div>
                                <div>
                                    <h4 className="title"><a href="#" className="stretched-link">Lorem Ipsum</a></h4>
                                    <p className="description">Voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi</p>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Service Item --> */}

                        <div className="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="200">
                            <div className="service-item d-flex">
                                <div className="icon flex-shrink-0"><i className="bi bi-card-checklist"></i></div>
                                <div>
                                    <h4 className="title"><a href="#" className="stretched-link">Dolor Sitema</a></h4>
                                    <p className="description">Minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip exa</p>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Service Item --> */}

                        <div className="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="300">
                            <div className="service-item d-flex">
                                <div className="icon flex-shrink-0"><i className="bi bi-bar-chart"></i></div>
                                <div>
                                    <h4 className="title"><a href="#" className="stretched-link">Sed ut perspiciatis</a></h4>
                                    <p className="description">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum</p>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Service Item --> */}

                        <div className="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="400">
                            <div className="service-item d-flex">
                                <div className="icon flex-shrink-0"><i className="bi bi-binoculars"></i></div>
                                <div>
                                    <h4 className="title"><a href="#" className="stretched-link">Magni Dolores</a></h4>
                                    <p className="description">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt</p>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Service Item --> */}

                        <div className="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="500">
                            <div className="service-item d-flex">
                                <div className="icon flex-shrink-0"><i className="bi bi-brightness-high"></i></div>
                                <div>
                                    <h4 className="title"><a href="#" className="stretched-link">Nemo Enim</a></h4>
                                    <p className="description">At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praese</p>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Service Item --> */}

                        <div className="col-xl-4 col-lg-6" data-aos="fade-up" data-aos-delay="600">
                            <div className="service-item d-flex">
                                <div className="icon flex-shrink-0"><i className="bi bi-calendar4-week"></i></div>
                                <div>
                                    <h4 className="title"><a href="#" className="stretched-link">Eiusmod Tempor</a></h4>
                                    <p className="description">Et harum quidem rerum facilis est et expedita distinctio dasa fermo lind saca</p>
                                </div>
                            </div>
                        </div>
                        {/* <!-- End Service Item --> */}

                    </div>

                </div>

            </section>
            {/* <!-- /Services Section --> */}
        </>
    )
}

export default LandingPageServices;