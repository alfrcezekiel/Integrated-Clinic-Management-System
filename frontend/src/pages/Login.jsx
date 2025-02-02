import { useState, useEffect } from "react";
import '../App.css';
import InputEmail from '../components/InputEmail';
import InputPassword from "../components/InputPassword";
import LoginButton from "../components/LoginButton";
import EndpointURI from "../API/Endpoint";
import {Link} from "react-router-dom";

function Login(){
    useEffect(() => {
        const loginTitleHeader = () => {
            document.title = "Login Account";
        }
        loginTitleHeader();
    }, []);

    const [loginTitle, setLoginTitle] = useState("");
    
    useEffect(() => {
        const retrieveLoginTitle = async () => {
            try {
                const response = await EndpointURI.get("/icms/login");
                if (!response.data || !response.data.loginTitle) {
                    throw new Error("Incomplete data received");
                }
                setLoginTitle(response.data.loginTitle);
            } catch (error) {
                console.error(`Functionality code error for retrieving login title: ${error}`);
            }
        }
        retrieveLoginTitle();
    }, []);

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-icon">
                    <h1>{loginTitle}</h1>
                </div>
                <div className="login-form-box">
                    <form className="login-form">
                        <div className="login-form-groups">
                            <div className="login-group-email">
                                <InputEmail/>
                            </div>
                            <div className="login-group-password">
                                <InputPassword/>
                            </div>
                            <div className="button-login">
                                <LoginButton name="Login"/>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="create-account-wrapper">
                    <p>Don&apos;t have an account? <Link to="/register">Create Account</Link></p>
                </div>
            </div>
        </div>
    )
}

export default Login;