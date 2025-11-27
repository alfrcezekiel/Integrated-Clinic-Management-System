import TextField from "@mui/material/TextField"
import Checkbox from "@mui/material/Checkbox"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import FormControlLabel from "@mui/material/FormControlLabel"
import {
    Link,
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
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import { useAuthorization } from "../../context/auth/useAuthorization"
import {
    getLocalStorage,
    setLocalStorage,
    removeLocalStorage
} from "../../utils/storage/localStorage";
import ArrowBack from "@mui/icons-material/ArrowBack";

function PatientsLoginPortal() {
    const [showPassword, setShowPassword] = useState(false);
    const [patientsLoginFormData, setPatientsLoginFormData] = useState({
        email: "",
        password: ""
    })
    const [fieldErrors, setFieldErrors] = useState({
        email: "",
        password: ""
    })
    const [rememberMe, setRememberMe] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [accountStatus, setAccountStatus] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleAccountStatus = useCallback(async (response) => {
        if (response.data.messageStatus === "Account is still pending for wait for the admin approval!") {
            setAccountStatus("Your account is pending approval. Please wait for the admin to approve your account.");
            setOpenModal(true)
        } else if (response.data.accountStatus === "Your account has been declined") {
            setAccountStatus("Your account has been declined by the admin! Please provide valid credentials!")
            setOpenModal(true)
        }
    }, [])

    const location = useLocation();
    const { login, userData } = useAuthorization();

    useEffect(() => {
        const titleElement = () => {
            document.title = "Patients Login Portal - CMS";
        }
        titleElement();

        const loadRememberMe = async () => {
            const rememberPatientCredentials = getLocalStorage("rememberPatientCredentials") === true;
            const storedEmail = getLocalStorage("rememberPatientEmail");
            if (storedEmail) {
                setPatientsLoginFormData((prev) => ({
                    ...prev,
                    email: storedEmail
                }))
            }
            setRememberMe(rememberPatientCredentials)
        }
        loadRememberMe();

    }, [location.pathname])

    /**
    * @function to track the changes in remember me checkbox
    */
    const handleRememberMeChange = async (e) => {
        setRememberMe(e.target.checked);
    }

    const handleClickShowPassword = () => {
        setShowPassword((show) => !show);
    }

    const handleCloseModal = useCallback(async () => {
        setOpenModal(false);
    }, [])

    const handleMouseDownPassword = (e) => {
        e.preventDefault();
    }

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setPatientsLoginFormData((prevState) => ({
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

    const memoizedPatientsLoginDataValue = useMemo(() => {
        return patientsLoginFormData;
    }, [patientsLoginFormData])

    const handleMouseUpPassword = (e) => {
        e.preventDefault();
    }

    const navigate = useNavigate();

    // handles the patient login portal going to the patients dashboard
    const handleLoggedInPatient = async (e) => {
        try {
            e.preventDefault();

            if (submitting) return;
            setSubmitting(true);

            removeLocalStorage("authToken");
            removeLocalStorage("userData");

            const response = await CMS.post("/loginPatientsAccount", patientsLoginFormData, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            if (response.data && response.status === 200) {
                setFieldErrors({})

                if (response.data.messageStatus === "Account is still pending for wait for the admin approval!") {
                    handleAccountStatus(response);
                }

                if (rememberMe) {
                    setLocalStorage("rememberPatientCredentials", true);
                    setLocalStorage("rememberPatientEmail", memoizedPatientsLoginDataValue.email);
                } else {
                    removeLocalStorage("rememberPatientCredentials");
                    removeLocalStorage("rememberPatientEmail");
                }

                if (response.data.token && response.data.sid) {
                    login(response.data.token);
                    userData({
                        sid: response.data.sid.patientID,
                        sfn: response.data.sid.sfn,
                        sln: response.data.sid.sln,
                        sem: response.data.sid.sem,
                        sprefix: response.data.sid.sprefix
                    })
                    navigate("/patients-dashboard/Home");
                } else {
                    console.error("No token found in response data");
                }
            } else {
                throw new Error(`No response data or no success message: ${response.data}`);
            }
        } catch (error) {
            /**
             * clear the remember me credentials if the login fails
             */
            removeLocalStorage("rememberPatientCredentials");
            removeLocalStorage("rememberPatientEmail");

            removeLocalStorage("authToken");
            removeLocalStorage("userData");

            if (error.response && error.response.status === 400) {
                setFieldErrors(error.response.data.errors);
            } else if (error.response && error.response.status === 401) {
                /**
                 * set the account status if the response data contains account status of declined
                 */
                if (error.response.data.accountStatus === "Your account has been declined") {
                    handleAccountStatus(error.response)
                }

                /**
                 * set the field errors if the response data contains errors of invalid password
                 */
                if (error.response.data.errors) {
                    setFieldErrors(error.response.data.errors);
                }
            } else {
                console.error(`Error in logging in patient: ${error}`);
            }
            console.error("Error in logging in patient:", error);
        } finally {
            setInterval(() => {
                setSubmitting(false);
            }, 1000);
        }
    }

    return (
        <>
            <section className="m-3 flex gap-4">
                <div className="w-full lg:w-3/5 py-54 xl:py-65">
                    <Link
                        to="/cms"
                        className="absolute py-6 px-6 top-0 left-0 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowBack className="mr-1" />
                        <span>Back</span>
                    </Link>
                    <div className="text-center">
                        <Typography variant="h5" className="font-bold mb-4" color="black">Patients Login Portal</Typography>
                    </div>
                    <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2" autoComplete="off" onSubmit={handleLoggedInPatient} id="patients-login-form">
                        <div className="mb-4 flex flex-col gap-6">
                            <label className="-mb-3 font-medium">Email</label>
                            <TextField
                                label="Enter your email"
                                variant="outlined"
                                fullWidth
                                autoComplete="off"
                                name="email"
                                helperText={fieldErrors.email || ""}
                                value={memoizedPatientsLoginDataValue.email}
                                error={Boolean(fieldErrors.email)}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mb-4 flex flex-col gap-6">
                            <label className="-mb-3 font-medium">Password</label>
                            <FormControl variant="outlined" className="register-input-password" sx={{ width: '100%' }} error={Boolean(fieldErrors.password)}>
                                <InputLabel htmlFor="outlined-adornment-password">Enter your password</InputLabel>
                                <OutlinedInput
                                    fullWidth
                                    value={memoizedPatientsLoginDataValue.password}
                                    autoComplete="off"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    onChange={handleInputChange}
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
                                    <Typography variant="body2" color="textSecondary" className="text-black">
                                        Remember me
                                    </Typography>
                                </>
                            }
                        />
                        <div className="flex items-center justify-end">
                            <Typography variant="body2" className="text-black">
                                <a href="/ForgotPassword" className="no-underline text-black">Forgot Password</a>
                            </Typography>
                        </div>
                        <div className="mt-6 flex flex-col gap-6 bg-black p-[0.30rem] rounded-[3rem] text-white">
                            <Button className="mt-9" fullWidth color="white" type="submit">
                                <span className="text-white">{submitting ? "Loading..." : "Login"}</span>
                            </Button>
                        </div>
                        <div className="text-center text-gray-500 font-medium mt-4">
                            Not registered?
                            <Link to="/PatientRegistration" className="text-black ml-1">Create account</Link>
                        </div>
                    </form>
                </div>
                <div className="py-10 px-4 w-2/5 hidden lg:block">
                    <img src="img/stethoscope.jpg" className="w-full max-h-[90dvh] object-cover rounded-3xl" alt="Stethoscope" />
                </div>
            </section>
            <Dialog open={openModal} onClose={handleCloseModal} className="flex items-center justify-center">
                <DialogTitle className="text-center">Account Status</DialogTitle>
                <DialogContent className="flex flex-col items-center justify-center">
                    <Typography variant="body2" className="text-gray-600">
                        {accountStatus}
                    </Typography>
                </DialogContent>
                <DialogActions className="flex justify-center">
                    <div className="flex justify-center w-full">
                        <Button onClick={handleCloseModal} color="primary" variant="contained" className="w-1/5">
                            OK
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default PatientsLoginPortal;