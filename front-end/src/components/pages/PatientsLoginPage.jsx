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
    const [openModal, setOpenModal] = useState(false);
    const [accountStatus, setAccountStatus] = useState("");

    const handleAccountStatus = useCallback(async (response) => {
        if (response.data.messageStatus === "Account is still pending for wait for the admin approval!") {
            setAccountStatus("Your account is pending approval. Please wait for the admin to approve your account.");
            setOpenModal(true)
        } else if (response.data.messageStatus === "Your account has been declined"){
            setAccountStatus("Your account has been declined by the admin! Please provide valid credentials!")
            setOpenModal(true)
        }
    }, [])

    const location = useLocation();

    useEffect(() => {
        const titleElement = () => {
            document.title = "Patients Login Portal - CMS";
        }
        titleElement();
    }, [location.pathname])

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
            const response = await CMS.post("/CMS/loginPatientsAccount", patientsLoginFormData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                },
                withCredentials: true,
            });

            if (response.data && response.status === 200) {
                setFieldErrors({})

                if (response.data.messageStatus === "Account is still pending for wait for the admin approval!") {
                    handleAccountStatus(response);
                } 

                if (response.data.token && response.data.sid) {
                    localStorage.setItem("authToken", response.data.token);
                    localStorage.setItem("sid", response.data.sid.patientID);
                    localStorage.setItem("sfn", response.data.sid.sfn);
                    localStorage.setItem("sln", response.data.sid.sln);
                    localStorage.setItem("sem", response.data.sid.sem);
                    navigate("/patients-dashboard/Home");
                } else {
                    console.error("No token found in response data");
                }
            } else {
                console.error(`Error in logging in patient: ${response.status}`);
                alert("Error in logging in patient")
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setFieldErrors(error.response.data.errors);
            } else if (error.response && error.response.status === 401) {
                setFieldErrors({
                    email: error.response.data.emailMessage,
                    password: error.response.data.passwordMessage
                });
            } else if (error.response && error.response.status === 404){
                if(error.response.data.messageStatus === "Your account has been declined"){
                    handleAccountStatus(error.response)
                }
            } else {
                console.error(`Error in logging in patient: ${error}`);
            }
        }
    }

    return (
        <>
            <section className="m-3 flex gap-4">
                <div className="w-full lg:w-3/5 mt-24">
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
                                helperText={fieldErrors.email ? fieldErrors.email : ""}
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
                            control={<Checkbox />}
                            label={
                                <>
                                    <Typography variant="body2" color="textSecondary" className="text-black">
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
                            <Typography variant="body2" className="text-black">
                                <a href="#" className="no-underline text-black">Forgot Password</a>
                            </Typography>
                        </div>
                        <div className="text-center text-gray-500 font-medium mt-4">
                            Not registered?
                            <Link to="/patients-portal" className="text-black ml-1">Create account</Link>
                        </div>
                    </form>
                </div>
                <div className="w-2/5 h-screen hidden lg:block">
                    <img src="img/pattern.png" className="h-full w-full object-cover rounded-3xl" alt="Pattern" />
                </div>
            </section>
            <Dialog open={openModal} onClose={handleCloseModal} className="flex items-center justify-center">
                <DialogTitle className="text-center">Account Status</DialogTitle>
                <DialogContent className="flex flex-col items-center justify-center">
                    <Typography variant="body2" color="textSecondary">
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