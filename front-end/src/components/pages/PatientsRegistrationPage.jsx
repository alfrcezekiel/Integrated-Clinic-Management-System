import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import "../../App.css";
import {
    Link,
    useLocation
} from "react-router-dom";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import DentistryPicture from "../../assets/img/dental clinic assets/bg4.jpg";
import {
    useState,
    useEffect,
    useCallback,
    useMemo
} from "react";
import CMS from "../../API/CMS";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FormHelperText from "@mui/material/FormHelperText";
import MenuItem from "@mui/material/MenuItem";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import PatientAccountStatusDialogBox from "../PatientAccountStatus/PatientAccountStatusDialogBox";

const PatientsRegistrationPortal = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [openPatientStatusDialog, setOpenPatientStatusDialog] = useState(false);
    const [accountMessage, setAccountMessage] = useState("");

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

    const civilStatus = ["Single", "Married", "Divorced", "Widowed"];

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
        address: "",
        civilStatus: "",
        dateOfBirth: "",
        password: "",
        confirmPassword: ""
    });

    const [formRegistrationPatientsData, setFormRegistrationPatientsData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        civilStatus: "",
        dateOfBirth: null,
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    });

    const navigate = useNavigate();

    const handleInputChange = useCallback(async (e) => {
        const { name, value } = e.target;

        setFormRegistrationPatientsData({
            ...formRegistrationPatientsData,
            [name]: value
        })

        if (fieldsErrors[name]) {
            setFieldsErrors({
                ...fieldsErrors,
                [name]: ""
            })
        }
    }, [fieldsErrors, formRegistrationPatientsData])


    const handleDateChange = useCallback(async (newValue) => {
        setFormRegistrationPatientsData({
            ...formRegistrationPatientsData,
            dateOfBirth: newValue && dayjs(newValue).isValid() ? dayjs(newValue.toISOString().split('T')[0]) : null
        });

        if (fieldsErrors.dateOfBirth) {
            setFieldsErrors({
                ...fieldsErrors,
                dateOfBirth: ""
            });
        }
    }, [fieldsErrors, formRegistrationPatientsData]);

    const memoizedFormRegistrationPatientsData = useMemo(() => {
        return formRegistrationPatientsData;
    }, [formRegistrationPatientsData]);

    // function for handling the registration of patients account
    const handleRegistrationSubmit = async (e) => {
        try {
            e.preventDefault();

            const response = await CMS.post("/CMS/registerPatientsAccount", formRegistrationPatientsData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.data.token && response.status === 200) {
                setFieldsErrors({})
                if (response.data.message === "Patient account registered successfully. Your Account is Pending. Please wait for the admin approval") {
                    setAccountMessage(response.data.message);
                    setOpenPatientStatusDialog(true);
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

    const handleClosePatientStatusDialog = () => {
        setOpenPatientStatusDialog(false);
    }

    const handleConfirmPatientStatusDialog = () => {
        setOpenPatientStatusDialog(false);
        navigate("/cms");
    }

    return (
        <>
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
                                name="firstName"
                                value={memoizedFormRegistrationPatientsData.firstName}
                                onChange={handleInputChange}
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
                                name="lastName"
                                onChange={handleInputChange}
                                value={memoizedFormRegistrationPatientsData.lastName}
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
                                name="email"
                                onChange={handleInputChange}
                                value={memoizedFormRegistrationPatientsData.email}
                                helperText={fieldsErrors.email || ""}
                                error={Boolean(fieldsErrors.email)}
                            />
                        </div>
                        <div className="mb-1 flex flex-col gap-6">
                            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">Address</Typography>
                            <TextField
                                autoComplete="off"
                                size="lg"
                                label="Enter your Address"
                                variant="outlined"
                                type="text"
                                name="address"
                                onChange={handleInputChange}
                                value={memoizedFormRegistrationPatientsData.address}
                                helperText={fieldsErrors.address || ""}
                                error={Boolean(fieldsErrors.address)}
                            />
                        </div>
                        <div className="mb-1 flex flex-col gap-6">
                            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">Civil Status</Typography>
                            <TextField
                                autoComplete="off"
                                size="lg"
                                select
                                label="Select Civil status"
                                variant="outlined"
                                name="civilStatus"
                                type="text"
                                onChange={handleInputChange}
                                value={memoizedFormRegistrationPatientsData.civilStatus}
                                helperText={fieldsErrors.civilStatus || ""}
                                error={Boolean(fieldsErrors.civilStatus)}
                            >
                                {civilStatus.map((status, index) => (
                                    <MenuItem key={index} value={status}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>
                        <div className="mb-1 flex flex-col gap-6">
                            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">Date of Birth</Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['DatePicker']}>
                                    <DatePicker
                                        className="w-full"
                                        margin="dense"
                                        id="date-of-birth"
                                        name="dateOfBirth"
                                        value={memoizedFormRegistrationPatientsData.dateOfBirth}
                                        onChange={handleDateChange}
                                        label="Date of Birth"
                                        slotProps={{
                                            textField: {
                                                className: "w-full",
                                                variant: "outlined",
                                                fullWidth: true,
                                                error: Boolean(fieldsErrors.dateOfBirth),
                                                helperText: fieldsErrors.dateOfBirth || "",
                                            },
                                        }}
                                    />
                                </DemoContainer>
                            </LocalizationProvider>
                        </div>
                        <div className="mb-1 flex flex-col gap-6">
                            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">Phone Number</Typography>
                            <TextField
                                autoComplete="off"
                                size="lg"
                                label="Enter your Phone Number"
                                variant="outlined"
                                type="number"
                                value={memoizedFormRegistrationPatientsData.phoneNumber}
                                name="phoneNumber"
                                onChange={handleInputChange}
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
                                    value={memoizedFormRegistrationPatientsData.password}
                                    name="password"
                                    onChange={handleInputChange}
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
                                    value={memoizedFormRegistrationPatientsData.confirmPassword}
                                    name="confirmPassword"
                                    onChange={handleInputChange}
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
                        <div className="text-center text-blue-gray-500 font-medium mt-3">
                            Already have an account?
                            <Link to={"/patients-login"} className="text-black ml-1">Sign in</Link>
                        </div>
                    </form>
                </div>
            </section>
            <PatientAccountStatusDialogBox
                open={openPatientStatusDialog}
                onClose={handleClosePatientStatusDialog}
                onConfirm={handleConfirmPatientStatusDialog}
                accountMessage={accountMessage}
            />
        </>
    );
}

export default PatientsRegistrationPortal;