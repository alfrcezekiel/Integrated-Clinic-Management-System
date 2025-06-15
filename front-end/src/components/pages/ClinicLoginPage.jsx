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
import { useAuthorization } from "../../context/auth/useAuthorization";

function ClinicLoginPortal() {
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
    const { login, userData } = useAuthorization(); 

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
                withCredentials: true
            });

            if (response.data && response.status === 200) {
                setFieldErrors({})
                if (response.data.accessToken && response.data.sid) {
                    login(response.data.accessToken)
                    userData({
                        sid: response.data.sid.id,
                        scn: response.data.sid.scn,
                        sem: response.data.sid.sem
                    })
                    navigate("/doctor-portal/dashboard/home");
                } else {
                    console.error("No token found in response data and session data");
                    alert("No token found in response data and session data");
                }
            } else {
                throw new Error(`No response data found: ${response.status}`);
            }

        } catch (error) {
            if (error.response && error.response.status === 400) {
                setFieldErrors(error.response.data.errors);
            } else if (error.response && error.response.status === 401) {
                setFieldErrors({
                    email: error.response.data.emailMessage,
                    password: error.response.data.passwordMessage
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
                    <Typography variant="h5" className="font-bold mb-4" color="black">Clinic  Login Portal</Typography>
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
                                <Typography variant="body2" className="text-black">
                                    Remember me
                                </Typography>
                            </>
                        }
                    />
                    <div className="flex justify-end items-center">
                        <Typography variant="body2" className="text-black">
                            <a href="#">Forgot Password</a>
                        </Typography>
                    </div>
                    <div className="mt-6 flex flex-col gap-6 bg-black p-[0.30rem] rounded-[3rem] text-white">
                        <Button className="mt-9" fullWidth color="white" type="submit">
                            Login
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
export default ClinicLoginPortal;