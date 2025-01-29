import { useEffect } from "react";
import '../App.css';
import InputEmail from '../components/InputEmail';
import InputPassword from "../components/InputPassword";

function Login(){
    useEffect(() => {
        document.title = "Login Account";
    }, []);

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-icon">
                    <h1>Login Account</h1>
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
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login;