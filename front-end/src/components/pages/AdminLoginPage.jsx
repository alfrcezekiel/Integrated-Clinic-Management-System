import "../../App.css"
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
    useMemo,
    useCallback
} from "react"
import CMS from "../../API/CMS";
import FormHelperText from "@mui/material/FormHelperText"
import TextField from "@mui/material/TextField"
import Checkbox from "@mui/material/Checkbox"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import FormControlLabel from "@mui/material/FormControlLabel"
import { useNavigate, useLocation } from "react-router-dom";
import pattern from "../../assets/img/hero-bg.jpg"
import {
    useAuthorization
} from "../../context/auth/useAuthorization";
import {
    getLocalStorage,
    setLocalStorage,
    removeLocalStorage
} from "../../utils/storage/localStorage";
import { Link } from "react-router-dom"
import ArrowBack from "@mui/icons-material/ArrowBack";

function AdminLoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [adminLoginFormData, setAdminLoginFormData] = useState({
        email: "",
        password: ""
    })
    const [rememberMe, setRememberMe] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        email: "",
        password: ""
    })
    const [submitting, setSubmitting] = useState(false);

    const location = useLocation();
    const { login, userData } = useAuthorization();

    useEffect(() => {
        const titleElement = () => {
            document.title = "Admin Login Portal | CMS";
        }
        titleElement();

        /**
         * Remember the admin account credentials
         */
        const rememberAdminCredentials = async () => {
            const rememberAdminDetails = getLocalStorage("rememberAdminDetails") === true;
            const storedEmail = getLocalStorage("rememberAdminEmail");
            if (storedEmail) {
                setAdminLoginFormData((prev) => ({
                    ...prev,
                    email: storedEmail
                }))
            }
            setRememberMe(rememberAdminDetails)
        }
        rememberAdminCredentials()
    }, [location.pathname])

    /**
     * @function to handle changes in remember me checkbox
     */
    const handleRememberMeChanges = async (e) => {
        setRememberMe(e.target.checked);
    }

    /**
     * @function to handle show password
     */
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
        setAdminLoginFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        if (fieldErrors[name]) {
            setFieldErrors((prevErrors) => ({
                ...prevErrors,
                [name]: "",
            }));
        }
    }, [fieldErrors]);

    const memoizedClinicLoginDataValues = useMemo(() => {
        return adminLoginFormData
    }, [adminLoginFormData])

    const handleLoggedInAdmin = async (e) => {
        try {
            e.preventDefault();
            if (submitting) return;
            setSubmitting(true);

            removeLocalStorage("authToken");
            removeLocalStorage("userData");

            const response = await CMS.post("/adminAccount", adminLoginFormData, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            if (response.data && response.status === 200) {
                setFieldErrors({})
                if (rememberMe) {
                    setLocalStorage("rememberAdminDetails", true);
                    setLocalStorage("rememberAdminEmail", adminLoginFormData.email);
                } else {
                    removeLocalStorage("rememberAdminDetails");
                    removeLocalStorage("rememberAdminEmail");
                }

                if (response.data.token && response.data.sid) {
                    login(response.data.token);
                    userData({
                        sid: response.data.sid.id,
                        email: response.data.sid.email,
                    })
                    navigate("/admin-dashboard/home");
                } else {
                    console.error("No token found in response data and session data");
                    alert("No token found in response data and session data")
                }
            } else {
                throw new Error("No response data found");
            }

        } catch (error) {
            /**
             * clear the remember me credentials if the login fails
             */
            removeLocalStorage("rememberAdminDetails");
            removeLocalStorage("rememberAdminEmail");

            if (error.response && error.response.status === 400) {
                setFieldErrors(error.response.data.errors);
            } else if (error.response && error.response.status === 401) {
                setFieldErrors({
                    email: error.response.data.emailMessage,
                    password: error.response.data.passwordMessage
                })
            } else {
                console.error(`Error in logging in admin: ${error}`);
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
                    <Typography variant="h5" className="font-bold mb-4" color="black">Admin Login Portal</Typography>
                </div>
                <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" autoComplete="off" onSubmit={handleLoggedInAdmin} id="admin-login-form">
                    <div className="mb-4 flex flex-col gap-6">
                        <label className="-mb-3 font-medium">Email</label>
                        <TextField
                            label="Enter your email"
                            variant="outlined"
                            fullWidth
                            autoComplete="off"
                            helperText={fieldErrors.email ? fieldErrors.email : ""}
                            value={memoizedClinicLoginDataValues.email}
                            error={Boolean(fieldErrors.email)}
                            name="email"
                            type="text"
                            onChange={handleInputChange}
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
                                value={memoizedClinicLoginDataValues.password}
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
                                onChange={handleRememberMeChanges}
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
                    <div className="mt-6 flex flex-col gap-6 bg-black p-[0.30rem] rounded-[3rem] text-white">
                        <Button
                            className="mt-9"
                            fullWidth
                            color="white"
                            type="submit"
                        >
                            <span className="text-white">
                                {submitting ? "Loading..." : "Login"}
                            </span>
                        </Button>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-6">
                        <Typography variant="body2" className="text-black">
                            <a href="/ForgotPassword" className="text-black">Forgot Password</a>
                        </Typography>
                    </div>
                </form>
            </div>
            <div className="w-2/5 hidden lg:block py-10 px-4">
                <img src={pattern} className="h-[90dvh] w-full object-cover rounded-3xl" alt="Pattern" />
            </div>
        </section>
    );
}

export default AdminLoginPage;