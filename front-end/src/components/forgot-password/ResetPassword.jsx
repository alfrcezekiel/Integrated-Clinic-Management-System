import {
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    IconButton,
    FormHelperText
} from "@mui/material";
import {
    Visibility,
    VisibilityOff
} from "@mui/icons-material";
import {
    useSelector,
    useDispatch
} from "react-redux";
import {
    updateField,
    resetForm,
    resetPassword,
} from "../../features/forgot-password-state/ForgotPasswordState";
import { useNavigate } from "react-router-dom";
import {
    useState,
    useEffect
} from "react";

const ResetPassword = () => {
    const resetPasswordState = useSelector((state) => state.forgotPassword);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [fieldErrors, setFieldErrors] = useState({
        newPassword: "",
        confirmPassword: ""
    })

    useEffect(() => {
        document.title = "Reset Password"

        return () => {
            dispatch(resetForm())
        }
    }, [dispatch])

    /**
    * function that handles changes in the the textfields of forgot password
    */
    const handleResetPasswordChanges = async (e) => {
        const { name, value } = e.target;
        dispatch(updateField({
            field: name,
            value: value
        }))

        if (fieldErrors[name]) {
            setFieldErrors((prevErrors) => ({
                ...prevErrors,
                [name]: ""
            }))
        }
    }
    /**
     * function handles to toggle the visibility of the new password
     */
    const handleClickShowNewPassword = async () => {
        setShowNewPassword((show) => !show);
    }

    /**
     * function handles to toggle the visibility of the confirm password
     */
    const handleClickShowConfirmPassword = async () => {
        setShowConfirmPassword((show) => !show);
    }
    /**
     * function that handles the submission of the reset password form
     */
    const submitResetPassword = async (e) => {
        try {
            e.preventDefault();
            const response = await dispatch(resetPassword({
                token: new URLSearchParams(window.location.search).get("token"),
                newPassword: resetPasswordState.newPassword,
                confirmPassword: resetPasswordState.confirmPassword,
                userType: new URLSearchParams(window.location.search).get("type")
            }))

            if (resetPassword.fulfilled.match(response)) {
                dispatch(resetForm())
                navigate("/cms");
            } else if (resetPassword.rejected.match(response)) {
                const error = response.payload;

                if (error && error.errors) {
                    setFieldErrors((prev) => ({
                        ...prev,
                        ...error.errors
                    }))
                }
            }
        } catch (error) {
            console.error(`Failed to reset password: ${error}`);
        }
    }
    return (
        <div className="p-4 flex gap-4 max-h-screen">
            <div className="flex justify-center p-4 w-full lg:w-3/5 md:w-1/2">
                <div className="flex-col mt-50">
                    <div className="p-4">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 text-center lg:text-center">
                            Enter New Password
                        </h1>
                        <p className="text-gray-600 text-sm mb-8 text-center lg:text-center p-2">
                            Enter your new password and confirm it to complete the password reset process.
                        </p>
                    </div>
                    <div className="space-y-4 p-4 rounded-lg">
                        <form onSubmit={submitResetPassword}>
                            <div className="space-y-4">
                                <div className="flex flex-col">
                                    <label className="mb-2 font-semibold text-black">New Password</label>
                                    <FormControl variant="outlined" sx={{ width: "100%" }} error={!!fieldErrors.newPassword}>
                                        <InputLabel htmlFor="new-password">New Password</InputLabel>
                                        <OutlinedInput
                                            id="new-password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            name="newPassword"
                                            autoComplete="off"
                                            value={resetPasswordState.newPassword}
                                            onChange={handleResetPasswordChanges}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label={
                                                            showNewPassword ? 'hide the password' : 'display the password'
                                                        }
                                                        onClick={handleClickShowNewPassword}
                                                        edge="end"
                                                    >
                                                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            label="New Password"
                                        />
                                    </FormControl>
                                    {fieldErrors.newPassword && (
                                        <FormHelperText error>
                                            {fieldErrors.newPassword}
                                        </FormHelperText>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label className="mb-2 font-semibold text-black">Confirm Password</label>
                                    <FormControl variant="outlined" sx={{ width: "100%" }} error={!!fieldErrors.confirmPassword}>
                                        <InputLabel htmlFor="confirm-password">Confirm Password</InputLabel>
                                        <OutlinedInput
                                            id="confirm-password"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            autoComplete="off"
                                            value={resetPasswordState.confirmPassword}
                                            onChange={handleResetPasswordChanges}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label={
                                                            showConfirmPassword ? 'hide the password' : 'display the password'
                                                        }
                                                        onClick={handleClickShowConfirmPassword}
                                                        edge="end"
                                                    >
                                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            label="Confirm Password"
                                        />
                                    </FormControl>
                                    {fieldErrors.confirmPassword && (
                                        <FormHelperText error>
                                            {fieldErrors.confirmPassword}
                                        </FormHelperText>
                                    )}
                                </div>
                            </div>

                            <div className="flex item-center justify-between mt-6">
                                <div className="ml-auto">
                                    <button
                                        type="submit"
                                        className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
                                    >
                                        Reset Password
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="max-w-6/12 hidden lg:block">
                <img src="img/stethoscope.jpg" className="max-w-full max-h-full object-cover rounded-3xl ml-60" alt="Stethoscope" />
            </div>
        </div>
    )
}

export default ResetPassword;