import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import "../../assets/css/main.css";
import { Link, useLocation } from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import DentistryPicture from "../../assets/img/dental clinic assets/bg4.jpg";
import { useState, useEffect } from "react";
import CMS from "../../API/CMS";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FormHelperText from "@mui/material/FormHelperText";

const PatientsRegistrationPortal = () => {

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword((show) => !show);
    }

    const handleClickShowConfirmPassword = () => {
        setShowConfirmPassword((show) => !show);
    }

    const handleMouseDownPassword = (e) => {
        e.preventDefault();
    }

    const handleMouseDownConfirmPassword = (e) => {
        e.preventDefault();
    }

    const handleMouseUpPassword = (e) => {
        e.preventDefault()
    }

    const handleMouseUpConfirmPassword = (e) => {
        e.preventDefault();
    }

    const location = useLocation();

    useEffect(() => {
        const displayTitleHeader = () => {
            document.title = "Patients Registration Portal | CMS";
        }
        displayTitleHeader();
    }, [location.pathname])

    const [fieldsErrors, setFieldsErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    });

    const [formRegistrationPatientsData, setFormRegistrationPatientsData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    });

    const handleRegistrationSubmit = async (e) => {
        try {
            e.preventDefault();

            const response = await CMS.post("/CMS/registerPatientsAccount", formRegistrationPatientsData, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 200) {
                alert(response.data.message);

                setFieldsErrors({})
                if (response.data.message === "Patient account registered successfully") {
                    window.location.href = "/patients-portal";
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setFieldsErrors(error.response.data.errors);
            } else {
                console.error(`Failed to register patient account: ${error}`);
            }
        }
    }

    return (
        <section className="m-8 flex">
            <div className="w-2/5 h-screen hidden lg:block">
                <img
                    className="h-full w-full object-cover rounded-3xl"
                    src={DentistryPicture}
                    alt="Dentistry Picture"
                />
            </div>
            <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
                <div className="text-center">
                    <Typography variant="h5" className="font-bold mb-4" color="black">Patients Registration Portal</Typography>
                </div>
                <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" onSubmit={handleRegistrationSubmit} autoComplete="off" id="register-patients-form">
                    <div className="mb-1 flex flex-col gap-6">
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">First Name</Typography>
                        <TextField
                            autoComplete="off"
                            size="lg"
                            label="Enter your First Name"
                            variant="outlined"
                            type="text"
                            value={formRegistrationPatientsData.firstName}
                            onChange={(e) => setFormRegistrationPatientsData({ ...formRegistrationPatientsData, firstName: e.target.value })}
                            helperText={fieldsErrors.firstName || ""}
                            error={Boolean(fieldsErrors.firstName)}
                        />
                    </div>
                    <div className="mb-1 flex flex-col gap-6">
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">Last Name</Typography>
                        <TextField
                            autoComplete="off"
                            size="lg"
                            label="Enter your Last Name"
                            variant="outlined"
                            type="text"
                            onChange={(e) => setFormRegistrationPatientsData({ ...formRegistrationPatientsData, lastName: e.target.value })}
                            value={formRegistrationPatientsData.lastName}
                            helperText={fieldsErrors.lastName || ""}
                            error={Boolean(fieldsErrors.lastName)}
                        />
                    </div>
                    <div className="mb-1 flex flex-col gap-6">
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">Email</Typography>
                        <TextField
                            autoComplete="off"
                            size="lg"
                            label="Enter your Email"
                            variant="outlined"
                            type="text"
                            onChange={(e) => setFormRegistrationPatientsData({ ...formRegistrationPatientsData, email: e.target.value })}
                            value={formRegistrationPatientsData.email}
                            helperText={fieldsErrors.email || ""}
                            error={Boolean(fieldsErrors.email)}
                        />
                    </div>
                    <div className="mb-1 flex flex-col gap-6">
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">Phone Number</Typography>
                        <TextField
                            autoComplete="off"
                            size="lg"
                            label="Enter your Phone Number"
                            variant="outlined"
                            type="number"
                            value={formRegistrationPatientsData.phoneNumber}
                            onChange={(e) => setFormRegistrationPatientsData({ ...formRegistrationPatientsData, phoneNumber: e.target.value })}
                            helperText={fieldsErrors.phoneNumber || ""}
                            error={Boolean(fieldsErrors.phoneNumber)}
                        />
                    </div>
                    <div className="mb-1 flex flex-col gap-6">
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">Password</Typography>
                        <FormControl variant="outlined" className="register-input-password" sx={{ width: '100%' }} error={Boolean(fieldsErrors.password)}>
                            <InputLabel htmlFor="outlined-adornment-password">Enter Password</InputLabel>
                            <OutlinedInput
                                autoComplete="off"
                                id="password"
                                type={showPassword ? "text" : "password"}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={
                                                showPassword ? "hide password" : "show password"
                                            }
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            onMouseUp={handleMouseUpPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Enter Password"
                                value={formRegistrationPatientsData.password}
                                onChange={(e) => setFormRegistrationPatientsData({ ...formRegistrationPatientsData, password: e.target.value })}
                            />
                            {fieldsErrors.password && <FormHelperText error>{fieldsErrors.password}</FormHelperText>}
                        </FormControl>
                    </div>
                    <div className="mb-1 flex flex-col gap-6">
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">Confirm Password</Typography>
                        <FormControl variant="outlined" className="register-input-confirm-password" sx={{ width: '100%' }} error={Boolean(fieldsErrors.confirmPassword)}>
                            <InputLabel htmlFor="outlined-adornment-password">Enter Confirm Password</InputLabel>
                            <OutlinedInput
                                autoComplete="off"
                                id="confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={
                                                showConfirmPassword ? "hide password" : "show password"
                                            }
                                            onClick={handleClickShowConfirmPassword}
                                            onMouseDown={handleMouseDownConfirmPassword}
                                            onMouseUp={handleMouseUpConfirmPassword}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Enter Confirm Password"
                                value={formRegistrationPatientsData.confirmPassword}
                                onChange={(e) => setFormRegistrationPatientsData({ ...formRegistrationPatientsData, confirmPassword: e.target.value })}
                            />
                            {fieldsErrors.confirmPassword && <FormHelperText error>{fieldsErrors.confirmPassword}</FormHelperText>}
                        </FormControl>
                    </div>
                    <FormControlLabel
                        control={<Checkbox />}
                        label="Remember me"
                    />
                    <div className="mt-6 flex flex-col gap-6 bg-black p-[0.30rem] rounded-[3rem] text-white">
                        <Button className="mt-9" fullWidth color="white" type="submit">
                            Register
                        </Button>
                    </div>
                    <div className="mt-[2rem] flex flex-col gap-4">
                        <Button
                            variant="contained"
                            color="inherit"
                            startIcon={
                                <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_1156_824)">
                                        <path d="M16.3442 8.18429C16.3442 7.64047 16.3001 7.09371 16.206 6.55872H8.66016V9.63937H12.9813C12.802 10.6329 12.2258 11.5119 11.3822 12.0704V14.0693H13.9602C15.4741 12.6759 16.3442 10.6182 16.3442 8.18429Z" fill="#4285F4" />
                                        <path d="M8.65974 16.0006C10.8174 16.0006 12.637 15.2922 13.9627 14.0693L11.3847 12.0704C10.6675 12.5584 9.7415 12.8347 8.66268 12.8347C6.5756 12.8347 4.80598 11.4266 4.17104 9.53357H1.51074V11.5942C2.86882 14.2956 5.63494 16.0006 8.65974 16.0006Z" fill="#34A853" />
                                        <path d="M4.16852 9.53356C3.83341 8.53999 3.83341 7.46411 4.16852 6.47054V4.40991H1.51116C0.376489 6.67043 0.376489 9.33367 1.51116 11.5942L4.16852 9.53356Z" fill="#FBBC04" />
                                        <path d="M8.65974 3.16644C9.80029 3.1488 10.9026 3.57798 11.7286 4.36578L14.0127 2.08174C12.5664 0.72367 10.6469 -0.0229773 8.65974 0.000539111C5.63494 0.000539111 2.86882 1.70548 1.51074 4.40987L4.1681 6.4705C4.8001 4.57449 6.57266 3.16644 8.65974 3.16644Z" fill="#EA4335" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_1156_824">
                                            <rect width="16" height="16" fill="white" transform="translate(0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            }
                            fullWidth
                            sx={{ boxShadow: 2, borderRadius: "2rem" }}
                        >
                            Sign in With Google
                        </Button>
                        <Button
                            variant="contained"
                            color="inherit"
                            startIcon={<img src="/img/twitter-logo.svg" height={24} width={24} alt="Twitter" />}
                            fullWidth
                            sx={{ boxShadow: 2, borderRadius: "2rem" }}
                        >
                            Sign in With Twitter
                        </Button>
                    </div>
                    <div className="text-center text-blue-gray-500 font-medium mt-3">
                        Already have an account?
                        <Link to={"/patients-login"} className="text-gray-900 ml-1">Sign in</Link>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default PatientsRegistrationPortal;