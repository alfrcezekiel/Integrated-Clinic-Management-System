import '../App.css';
import {useState, useEffect} from "react";
import EndpointURI from '../API/Endpoint';
import RegisterTextFieldFirstName from '../components/RegisterTextFieldFirstName';
import RegisterTextFieldLastName from '../components/RegisterTextFieldLastName';
import RegisterTextFieldEmail from '../components/RegisterTextFieldEmail';
import RegisterTextFieldPhoneNumber from '../components/RegisterTextFieldPhoneNumber';
import RegisterDateOfBirth from '../components/RegisterDateOfBirth';
import RegisterTextFieldPassword from '../components/RegisterTextFieldPassword';
import RegisterTextFieldConfirmPassword from '../components/RegisterTextFieldConfirmPassword';

function RegisterAccount(){
    const [registerTitle, setRegisterTile] = useState("");

    useEffect(() => {
        const registerTitleHeader = () => {
            document.title = "Register | ICMS";
        }
        registerTitleHeader();

        const retrieveRegisterTitle = async () => {
            try {
                const res = await EndpointURI.get("/icms/register");
                if(!res.data || !res.data.registerTitle){
                    throw new Error("Failed to retrieve register title in server");
                } else {
                    if(!res.data.registerTitle === "" || res.data.registerTitle === null){
                        throw new Error("Empty register title");
                    } else {
                        setRegisterTile(res.data.registerTitle);
                    }
                }
            } catch (error) {
                console.error(`Error in functionality code for retrieving register title: ${error}`);   
            }
        }
        retrieveRegisterTitle();
    }, []);

    return (
        <div className="register-container">  
            <div className='register-wrapper-box'>
                <div className='register-title'>
                    <h1>{registerTitle}</h1>
                </div>
                <div className="register-form-box">
                    <form className='register-form' id='register-form-action'>
                        <div className='register-form-groups'>
                            <div className='register-group-firstname'>
                                <RegisterTextFieldFirstName/>
                            </div>
                            <div className='register-group-lastname'>
                                <RegisterTextFieldLastName/>
                            </div>
                            <div className='register-group-email'>
                                <RegisterTextFieldEmail/>
                            </div>
                            <div className='register-group-phonenumber'>
                                <RegisterTextFieldPhoneNumber/>
                            </div>
                            <div className='register-group-dateofbirth'>
                                <RegisterDateOfBirth/>
                            </div>
                            <div className='register-group-password'>
                                <RegisterTextFieldPassword label="Enter Password"/>
                            </div>
                            <div className='register-group-confirmpassword'>
                                <RegisterTextFieldConfirmPassword label="Confirm Password"/>
                            </div>
                            <div className='register-group-button'>
                                <button className='register-button'>Register</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegisterAccount;