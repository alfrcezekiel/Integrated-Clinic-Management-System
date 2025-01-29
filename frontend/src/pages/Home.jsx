import { useEffect } from "react";
import '../App.css';
import { Link, Outlet} from 'react-router-dom';
import Button from '../components/Button';

function Home(){
    useEffect(() => {
        document.title = "Integrated Clinic Management System(ICMS)";
    }, [])

    return (
        <>
            <header className="header-container">
                <div className="logo-box">
                    <Link className="logo-text" to="/ICMS">ICMS</Link>
                    <Outlet/>
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
                    <Outlet/>
                </div>
            </header>   
            <section className="main-content-container" id="home">
                <div className="home-content">
                    <div className="side-content">
                        <div className="icms-title">
                            <h1>Integrated Clinic Management System</h1>
                        </div>
                        <div className="icms-description">
                            <p>ICMS streamlines medical health records, appointment scheduling, billing, invoicement, and inventory of clinical products.</p>
                        </div>
                        <div className="button-container">
                            <Button />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
export default Home;