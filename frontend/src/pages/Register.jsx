import '../App.css';
import { useState, useEffect } from "react";
import EndpointURI from '../API/Endpoint';
import RegisterTextFieldFirstName from '../components/RegisterTextFieldFirstName';
import RegisterTextFieldLastName from '../components/RegisterTextFieldLastName';
import RegisterTextFieldEmail from '../components/RegisterTextFieldEmail';
import RegisterTextFieldPhoneNumber from '../components/RegisterTextFieldPhoneNumber';
// import RegisterDateOfBirth from '../components/RegisterDateOfBirth';
import RegisterTextFieldPassword from '../components/RegisterTextFieldPassword';
import RegisterTextFieldConfirmPassword from '../components/RegisterTextFieldConfirmPassword';
import { Link, Outlet } from "react-router-dom";

function RegisterAccount() {
    const [registerTitle, setRegisterTile] = useState("");
    const [registrationMessage, setRegistrationMessage] = useState("");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const registerTitleHeader = async () => {
            document.title = "Register | ICMS";
        }
        registerTitleHeader();

        const retrieveRegisterTitle = async () => {
            try {
                const res = await EndpointURI.get("/icms/register");
                if (!res.data || !res.data.registerTitle) {
                    throw new Error("Failed to retrieve register title in server");
                } else {
                    if (!res.data.registerTitle === "" || res.data.registerTitle === null) {
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

    const registerAccount = async (e) => {
        try {
            e.preventDefault();
            const res = await EndpointURI.post("/icms/registerAccount", formData, {
                headers: {
                    "Content-Type": "application/json",
                }
            })
            
            if(!res.data || res.data.successfullRegistration === "" || res.data.successfullRegistration === null){
                throw new Error("Failed to register account");
            }

            if(res.status === 200){
                setRegistrationMessage(res.data.successfullRegistration);
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phoneNumber: "",
                    password: "",
                    confirmPassword: ""
                })
            }
        } catch (error) {
            console.error(`Error in functionality code for registering account: ${error}`);
        }
    }

    const handleFirstNameData = (e) => {
        setFormData({ ...formData, firstName: e.target.value });
    }

    const handleLastNameData = (e) => {
        setFormData({ ...formData, lastName: e.target.value });
    }

    const handleEmailData = (e) => {
        setFormData({ ...formData, email: e.target.value });
    }

    const handlePhoneNumberData = (e) => {
        setFormData({ ...formData, phoneNumber: e.target.value });
    }

    // const handleDateOfBirthData = (e) => {
    //     setFormData({...formData, dateOfBirth: e.target.value});
    // }

    const handlePasswordData = (e) => {
        setFormData({ ...formData, password: e.target.value });
    }

    const handleConfirmPasswordData = (e) => {
        setFormData({ ...formData, confirmPassword: e.target.value });
    }

    return (
        <div className="register-container">
            <div className='register-wrapper-box'>
                <div className='register-title'>
                    <h1>{registerTitle}</h1>
                </div>
                <div className="register-form-box">
                    <form className='register-form' id='register-form-action' onSubmit={registerAccount}>
                        <div className='register-form-groups'>
                            <div className='register-group-firstname'>
                                <RegisterTextFieldFirstName value={formData.firstName} onChange={handleFirstNameData} />
                            </div>
                            <div className='register-group-lastname'>
                                <RegisterTextFieldLastName value={formData.lastName} onChange={handleLastNameData} />
                            </div>
                            <div className='register-group-email'>
                                <RegisterTextFieldEmail value={formData.email} onChange={handleEmailData} />
                            </div>
                            <div className='register-group-phonenumber'>
                                <RegisterTextFieldPhoneNumber value={formData.phoneNumber} onChange={handlePhoneNumberData} />
                            </div>
                            {/* <div className='register-group-dateofbirth'>
                                <RegisterDateOfBirth value={formData.dateOfBirth} onChange={handleDateOfBirthData}/>
                            </div> */}
                            <div className='register-group-password'>
                                <RegisterTextFieldPassword label="Enter Password" value={formData.password} onChange={handlePasswordData} />
                            </div>
                            <div className='register-group-confirmpassword'>
                                <RegisterTextFieldConfirmPassword label="Confirm Password" value={formData.confirmPassword} onChange={handleConfirmPasswordData} />
                            </div>
                            <div className='register-group-button'>
                                <button className='register-button'>Register</button>
                            </div>
                        </div>
                    </form>
                </div>
                <div>
                    <Link to="/login">Login</Link>
                    <Outlet />
                </div>
                <div>
                    <p>{registrationMessage}</p>
                </div>
            </div>
        </div>
    );
}

export default RegisterAccount;