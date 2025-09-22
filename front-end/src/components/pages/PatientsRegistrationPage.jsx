import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import "../../App.css";
import {
    Link,
    useLocation
} from "react-router-dom";
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
import ArrowBack from "@mui/icons-material/ArrowBack";
import PatientAccountStatusDialogBox from "../PatientAccountStatus/PatientAccountStatusDialogBox";

const PatientsRegistrationPortal = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [openPatientStatusDialog, setOpenPatientStatusDialog] = useState(false);

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
    const gender = ["Male", "Female"];

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
        gender: "",
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
        gender: "",
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
        if (newValue) {
            const selectedDateOfBirth = dayjs(newValue).format("YYYY-MM-DD")
            setFormRegistrationPatientsData({
                ...formRegistrationPatientsData,
                dateOfBirth: dayjs(selectedDateOfBirth)
            });
        } else {
            setFormRegistrationPatientsData((prev) => ({
                ...prev,
                dateOfBirth: null
            }))
        }

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

            const payload = {
                ...formRegistrationPatientsData,
                dateOfBirth: formRegistrationPatientsData.dateOfBirth ? dayjs(formRegistrationPatientsData.dateOfBirth).format("YYYY-MM-DD") : null,
            }
            const response = await CMS.post("/CMS/registerPatientsAccount", payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.data.token && response.status === 200) {
                setFieldsErrors({})
                if (response.data.message === "Patient account registered successfully. Your Account is Pending. Please wait for the admin approval") {
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
            <section className="px-10 py-12 flex justify-center items-center translate-y-20">
                <div className="w-full lg:w-full flex flex-col items-center justify-center">
                    <Link
                        to="/cms"
                        className="absolute py-6 px-6 top-0 left-0 -translate-y-20 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowBack className="mr-1" />
                        <span>Back</span>
                    </Link>
                    <div className="text-center">
                        <h3 className="font-bold text-2xl mb-8">Patient Registration Portal</h3>
                    </div>
                    <form className="mx-auto w-11/12 xl:w-10/12 max-w-screen-lg lg:w-1/2 px-10 " onSubmit={handleRegistrationSubmit} autoComplete="off" id="register-patients-form">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="font-medium">First Name</label>
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
                            <div className="flex flex-col gap-2">
                                <label className="font-medium">Last Name</label>
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
                            <div className="flex flex-col gap-2">
                                <label className="font-medium">Email</label>
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
                            <div className="flex flex-col gap-2">
                                <label className="font-medium">Address</label>
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
                            <div className="flex flex-col gap-2">
                                <label className="font-medium">Gender</label>
                                <TextField
                                    autoComplete="off"
                                    size="lg"
                                    select
                                    label="Select Gender"
                                    variant="outlined"
                                    name="gender"
                                    type="text"
                                    onChange={handleInputChange}
                                    value={memoizedFormRegistrationPatientsData.gender}
                                    helperText={fieldsErrors.gender || ""}
                                    error={Boolean(fieldsErrors.gender)}
                                >
                                    {gender.map((gender, index) => (
                                        <MenuItem key={index} value={gender}>
                                            {gender}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-medium">Civil Status</label>
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
                            <div className="flex flex-col gap-2">
                                <label className="font-medium">Date of Birth</label>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DatePicker']}>
                                        <DatePicker
                                            className="w-full"
                                            margin="dense"
                                            id="date-of-birth"
                                            name="dateOfBirth"
                                            value={memoizedFormRegistrationPatientsData.dateOfBirth !== null ? dayjs(memoizedFormRegistrationPatientsData.dateOfBirth) : null}
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
                            <div className="flex flex-col gap-4">
                                <label className="font-medium">Phone Number</label>
                                <TextField
                                    autoComplete="off"
                                    size="lg"
                                    label="Enter your Phone Number"
                                    variant="outlined"
                                    type="tel"
                                    value={memoizedFormRegistrationPatientsData.phoneNumber}
                                    name="phoneNumber"
                                    onChange={handleInputChange}
                                    helperText={fieldsErrors.phoneNumber || ""}
                                    error={Boolean(fieldsErrors.phoneNumber)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-medium">Password</label>
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
                            <div className="flex flex-col gap-2">
                                <label className="font-medium">Confirm Password</label>
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
                        </div>
                        <div className="mt-8 flex justify-center items-center gap-6 bg-black p-1 rounded-4xl text-white">
                            <Button
                                className="md:w-1/2 w-full"
                                color="white"
                                type="submit"
                            >
                                Register
                            </Button>
                        </div>
                        <div className="text-center text-blue-gray-500 font-medium mt-3">
                            Already have an account?
                            <Link to={"/PatientLogin"} className="text-black ml-1">Sign in</Link>
                        </div>
                    </form>
                </div>
            </section>
            <PatientAccountStatusDialogBox
                open={openPatientStatusDialog}
                onClose={handleClosePatientStatusDialog}
                onConfirm={handleConfirmPatientStatusDialog}
            />
        </>
    );
}

export default PatientsRegistrationPortal;