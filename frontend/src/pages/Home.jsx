import { useEffect } from "react";
import '../App.css';
import { Link } from 'react-router-dom';

function Home(){
    useEffect(() => {
        document.title = "Integrated Clinic Management System(ICMS)";
    }, [])

    return (
        <>
            <header className="header-container">
                <div className="logo-box">
                    <Link className="logo-text" to="/ICMS">ICMS</Link>
                </div>
                <div className="navigation-box">
                    <nav className="navigation-links">
                        <ul>
                            <li>
                                <Link className="link-text" to="/ICMS">Home</Link>
                            </li>
                            <li>
                                <Link className="link-text" to="/about">About</Link>
                            </li>
                            <li>
                                <Link className="link-text" to="#home">Services</Link>
                            </li>
                            <li id="login">
                                <Link className="link-text" to="/login">Login</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>   
            <section className="main-content-container" id="home">
                <div className="icms-title">
                    <h1>Integrated Clinic Management System <span>(ICMS)</span></h1>
                </div>
                <div>
                    <h3>Start your day with ruining your day</h3>
                </div>
            </section>
        </>
    );
}
export default Home;