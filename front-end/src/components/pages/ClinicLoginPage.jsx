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
import { useAuthorization } from "../../context/auth/useAuthorization";
import {
    setLocalStorage,
    getLocalStorage,
    removeLocalStorage
} from "../../utils/storage/localStorage"
import { Link } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";

function ClinicLoginPortal() {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [doctorsLoginFormData, setDoctorsLoginFormData] = useState({
        email: "",
        password: ""
    })
    const [fieldErrors, setFieldErrors] = useState({
        email: "",
        password: ""
    })
    const [submitting, setSubmitting] = useState(false);

    const location = useLocation();
    const { login, userData } = useAuthorization();

    useEffect(() => {
        const titleElement = () => {
            document.title = "Clinic's Login Portal - CMS";
        }
        titleElement();

        const rememberClinicCredentials = async () => {
            const rembemberClinicCredentials = getLocalStorage("rememberClinicCredentials") === true;
            const storedEmail = getLocalStorage("rememberEmail");

            if (storedEmail) {
                setDoctorsLoginFormData((prev) => ({
                    ...prev,
                    email: storedEmail
                }))
            }
            setRememberMe(rembemberClinicCredentials)
        }
        rememberClinicCredentials();
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

    /**
     * @function to track the changes in remember me checkbox
     */
    const handleRememberMeChange = async (e) => {
        setRememberMe(e.target.checked);
    }

    const navigate = useNavigate();

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setDoctorsLoginFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));

        if (fieldErrors[name]) {
            setFieldErrors((prevState) => ({
                ...prevState,
                [name]: "",
            }));
        }
    }, [fieldErrors])

    /**
     * @function to memoize the clinic login form data
     */
    const memoizedClinicLoginFormData = useMemo(() => {
        return doctorsLoginFormData;
    }, [doctorsLoginFormData])

    /**
     * function handles the clinic login to navigate in clinic dashboard
     */
    const handleLoggedInPatient = async (e) => {
        try {
            e.preventDefault();

            if (submitting) return;
            setSubmitting(true);

            removeLocalStorage("authToken");
            removeLocalStorage("userData");

            const response = await CMS.post("/clinicLoggedInAccount", doctorsLoginFormData, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true
            });

            if (response.data && response.status === 200) {
                setFieldErrors({})
                if (rememberMe) {
                    setLocalStorage("rememberClinicCredentials", true);
                    setLocalStorage("rememberEmail", memoizedClinicLoginFormData.email);
                } else {
                    removeLocalStorage("rememberClinicCredentials");
                    removeLocalStorage("rememberEmail");
                }

                if (response.data.accessToken && response.data.sid) {
                    login(response.data.accessToken)
                    userData({
                        sid: response.data.sid.id,
                        scn: response.data.sid.scn,
                        sem: response.data.sid.sem,
                        stype: response.data.sid.stype
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
            /**
             * clear the remember me credentials if the login fails
             */
            removeLocalStorage("rememberClinicCredentials");
            removeLocalStorage("rememberEmail");

            if (error.response && error.response.status === 400) {
                setFieldErrors(error.response.data.errors);
            } else {
                console.error(`Error in logging in patient: ${error}`);
            }
        } finally {
            setInterval(() => {
                setSubmitting(false);
            }, 1000);
        }
    }

    return (
        <section className="m-3 flex gap-4">
            <div className="w-full lg:w-3/5 py-65">
                <Link
                    to="/cms"
                    className="absolute py-6 px-6 top-0 left-0 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowBack className="mr-1" />
                    <span>Back</span>
                </Link>
                <div className="text-center">
                    <Typography variant="h5" className="font-bold mb-4" color="black">Clinic  Login Portal</Typography>
                </div>
                <div className="py-4">
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
                            control={
                                <Checkbox
                                    checked={rememberMe}
                                    onChange={handleRememberMeChange}
                                />
                            }
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
                                <a href="/ForgotPassword" className="text-black no-underline">Forgot Password</a>
                            </Typography>
                        </div>
                        <div className="mt-6 flex flex-col gap-6 bg-black p-[0.30rem] rounded-[3rem] text-white">
                            <Button className="mt-9" fullWidth color="white" type="submit">
                                <span className="text-white">
                                    {submitting ? "Loading..." : "Login"}
                                </span>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="py-10 px-4 hidden w-2/5 lg:block">
                <img
                    src="/img/clinic-bg-2.jpg"
                    className="max-h-[90dvh] w-full object-cover rounded-3xl"
                    alt="Doctor"
                />
            </div>
        </section>
    );
}
export default ClinicLoginPortal;