import TextField from "@mui/material/TextField";
import {
    useState,
    useCallback
} from "react";
import CMS from "../../../API/CMS";
import { useAuthorization } from "../../../context/auth/useAuthorization";
import {
    IconButton,
    InputAdornment,
    OutlinedInput,
    FormControl,
    InputLabel,
    FormHelperText
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";

const AdminRegisterationAccount = () => {
    // state to manage the admin registration form data
    const [adminRegistrationFormData, setAdminRegistrationFormData] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    })
    // state to manage field errors for the admin registration form
    const [fieldErrors, setFieldErrors] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const handleClickShowPassword = () => {
        setShowPassword((show) => !show);
    }
    const handleMouseDownPassword = (e) => {
        e.preventDefault();
    }
    const handleMouseUpPassword = (e) => {
        e.preventDefault();
    }

    const handleClickShowConfirmPassword = () => {
        setShowConfirmPassword((show) => !show);
    }
    const handleMouseDownConfirmPassword = (e) => {
        e.preventDefault();
    }
    const handleMouseUpConfirmPassword = (e) => {
        e.preventDefault();
    }

    const navigate = useNavigate();
    const { token } = useAuthorization();
    const tokenContext = token;

    // function to handle changes in the text fields 
    const adminTextFieldChangeHandler = useCallback(async (e) => {
        const { name, value } = e.target;
        setAdminRegistrationFormData((prevState) => ({
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
     * handles the submission of the admin registration form.
     * It sends a POST request to the CMS API to create a new admin account.
     */
    const handleAdminRegistrationSubmit = useCallback(async (e) => {
        try {
            e.preventDefault();

            const payload = {
                email: adminRegistrationFormData.email,
                password: adminRegistrationFormData.password,
                confirmPassword: adminRegistrationFormData.confirmPassword
            }

            const response = await CMS.post("/CMS/adminDashboard/createAdminAccount", payload, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`,
                }
            })

            if (response.status === 201) {
                setAdminRegistrationFormData({
                    email: "",
                    password: "",
                    confirmPassword: ""
                });
                setFieldErrors({
                    email: "",
                    password: "",
                    confirmPassword: ""
                });
                alert("Admin account created successfully!");
                navigate("/admin-dashboard/AdminAccountRegistration");
            } else {
                throw new Error(`Failed to create admin account: ${response.statusText}`);
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const errors = error.response.data.errors;
                setFieldErrors(errors);
            }
            console.error(`Error during admin registration: ${error}`);
        }
    }, [adminRegistrationFormData, tokenContext, navigate])

    return (
        <div className="p-6 min-h-[90dvh]">
            <div className="flex items-center justify-center h-full translate-y-50">
                <div className="w-full max-w-3/6 bg-white rounded-2xl shadow-lg p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Admin Registration</h2>
                        <p className="text-gray-600 mt-2">Create a new admin account</p>
                    </div>
                    <div className="flex flex-col space-y-4">
                        <form className="space-y-4 flex flex-col" onSubmit={handleAdminRegistrationSubmit}>
                            <div className="flex flex-col">
                                <label className="font-medium text-md mb-2">Email Address</label>
                                <TextField
                                    label="Email Address"
                                    name="email"
                                    variant="outlined"
                                    placeholder="Enter email address"
                                    type="text"
                                    onChange={adminTextFieldChangeHandler}
                                    fullWidth
                                    autoComplete="off"
                                    value={adminRegistrationFormData.email}
                                    error={!!fieldErrors.email}
                                    helperText={fieldErrors.email || ""}
                                    autoFocus
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="font-medium text-md mb-2">Password</label>
                                <FormControl variant="outlined" sx={{ width: "100%"}} error={!!fieldErrors.password}>
                                    <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                                    <OutlinedInput
                                        placeholder="Enter password"
                                        name="password"
                                        onChange={adminTextFieldChangeHandler}
                                        value={adminRegistrationFormData.password}
                                        autoComplete="off"
                                        type={showPassword ? 'text' : 'password'}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label={
                                                        showPassword ? 'hide the password' : 'display the password'
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
                                        fullWidth
                                        label="Password"
                                    />
                                    {fieldErrors.password && <FormHelperText error>{fieldErrors.password}</FormHelperText>}
                                </FormControl>
                            </div>
                            <div className="flex flex-col">
                                <label className="font-medium text-md mb-2">Confirm Password</label>
                                <FormControl variant="outlined" sx={{ width: "100%"}} error={!!fieldErrors.confirmPassword}>
                                    <InputLabel htmlFor="outlined-adornment-password">Confirm Password</InputLabel>
                                    <OutlinedInput
                                        placeholder="Enter confirm password"
                                        name="confirmPassword"
                                        onChange={adminTextFieldChangeHandler}
                                        value={adminRegistrationFormData.confirmPassword}
                                        autoComplete="off"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label={
                                                        showConfirmPassword ? 'hide the password' : 'display the password'
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
                                        fullWidth
                                        label="Confirm Password"
                                    />
                                    {fieldErrors.confirmPassword && <FormHelperText error>{fieldErrors.confirmPassword}</FormHelperText>}
                                </FormControl>
                            </div>
                            <div className="items-center justify-center flex">
                                <button
                                    type="submit"
                                    className="min-w-[15dvw] bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                                >
                                    Register Admin Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminRegisterationAccount;