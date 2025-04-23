import TextField from "@mui/material/TextField"
import Checkbox from "@mui/material/Checkbox"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import FormControlLabel from "@mui/material/FormControlLabel"
import {
    useNavigate,
    useLocation
} from "react-router-dom";
import "../../App.css";
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import OutlinedInput from "@mui/material/OutlinedInput"
import InputAdornment from "@mui/material/InputAdornment"
import IconButton from "@mui/material/IconButton"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import {
    useState,
    useEffect,
    useCallback,
    useMemo
} from "react"
import CMS from "../../API/CMS";
import FormHelperText from "@mui/material/FormHelperText"
import doctor from "../../assets/img/page-title-bg.jpg";

function DoctorLoginPortal() {
    const [showPassword, setShowPassword] = useState(false);
    const [doctorsLoginFormData, setDoctorsLoginFormData] = useState({
        email: "",
        password: ""
    })
    const [fieldErrors, setFieldErrors] = useState({
        email: "",
        password: ""
    })

    const location = useLocation();

    useEffect(() => {
        const titleElement = () => {
            document.title = "Clinic's Login Portal - CMS";
        }
        titleElement();
    }, [location.pathname])

    const handleClickShowPassword = () => {
        setShowPassword((show) => !show);
    }

    const handleMouseDownPassword = (e) => {
        e.preventDefault();
    }

    const handleMouseUpPassword = (e) => {
        e.preventDefault();
    }

    const navigate = useNavigate();

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setDoctorsLoginFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));

        if(fieldErrors[name]) {
            setFieldErrors((prevState) => ({
                ...prevState,
                [name]: "",
            }));
        }
    }, [fieldErrors])

    const memoizedClinicLoginFormData = useMemo(() => {
        return doctorsLoginFormData;
    }, [doctorsLoginFormData])

    const handleLoggedInPatient = async (e) => {
        try {
            e.preventDefault();
            const response = await CMS.post("/CMS/clinicLoggedInAccount", doctorsLoginFormData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                },
            });

            if (response.data && response.status === 200) {
                setFieldErrors({})
                if (response.data.token && response.data.sid) {
                    localStorage.setItem("authToken", response.data.token);
                    localStorage.setItem("sid", response.data.sid.id);
                    localStorage.setItem("scn", response.data.sid.scn);
                    localStorage.setItem("sem", response.data.sid.sem);
                    navigate("/doctor-portal/dashboard/home");
                } else {
                    console.error("No token found in response data and session data");
                    alert("No token found in response data and session data");
                }
            } else if (response.data && response.data.errors) {
                setFieldErrors(response.data.errors);
            }

        } catch (error) {
            if (error.response && error.response.status === 400) {
                setFieldErrors(error.response.data.errors);
            } else if (error.response && error.response.status === 401) {
                setFieldErrors({
                    email: error.response.data.messageEmail,
                    password: error.response.data.messagePassword
                });
            } else {
                console.error(`Error in logging in patient: ${error}`);
            }
        }
    }

    return (
        <section className="m-3 flex gap-4">
            <div className="w-full lg:w-3/5 mt-24">
                <div className="text-center">
                    <Typography variant="h5" className="font-bold mb-4" color="black">Clinic&apos;s Login Portal</Typography>
                </div>
                <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" autoComplete="off" onSubmit={handleLoggedInPatient} id="patients-login-form">
                    <div className="mb-4 flex flex-col gap-6">
                        <label className="-mb-3 font-medium">Email</label>
                        <TextField
                            label="Enter your email"
                            variant="outlined"
                            fullWidth
                            autoComplete="off"
                            helperText={fieldErrors.email ? fieldErrors.email : ""}
                            value={memoizedClinicLoginFormData.email}
                            name="email"
                            type="text"
                            onChange={handleInputChange}
                            error={Boolean(fieldErrors.email)}
                        />
                    </div>
                    <div className="mb-4 flex flex-col gap-6">
                        <label className="-mb-3 font-medium">Password</label>
                        <FormControl variant="outlined" className="register-input-password" sx={{ width: '100%' }} error={Boolean(fieldErrors.password)}>
                            <InputLabel htmlFor="outlined-adornment-password">Enter your password</InputLabel>
                            <OutlinedInput
                                fullWidth
                                name="password"
                                onChange={handleInputChange}
                                value={memoizedClinicLoginFormData.password}
                                autoComplete="off"
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
                                label="Enter your password"
                            />
                            {fieldErrors.password && <FormHelperText>{fieldErrors.password}</FormHelperText>}
                        </FormControl>
                    </div>
                    <FormControlLabel
                        control={<Checkbox />}
                        label={
                            <>
                                <Typography variant="body2" color="textSecondary">
                                    Remember me
                                </Typography>
                            </>
                        }
                    />
                    <div className="mt-6 flex flex-col gap-6 bg-black p-[0.30rem] rounded-[3rem] text-white">
                        <Button className="mt-9" fullWidth color="white" type="submit">
                            Login
                        </Button>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-6">
                        <Typography variant="body2" className="text-gray-900">
                            <a href="#">Forgot Password</a>
                        </Typography>
                    </div>
                    <div className="mt-[1rem] flex flex-col gap-4">
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
                    </div>
                </form>
            </div>
            <div className="w-2/5 h-screen hidden lg:block">
                <img src={doctor} className="h-full w-full object-cover rounded-3xl" alt="Doctor" />
            </div>
        </section>
    );
}
export default DoctorLoginPortal;