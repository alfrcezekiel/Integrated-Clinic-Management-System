import TextField from "@mui/material/TextField";
import {
    useSelector,
    useDispatch
} from "react-redux";
import {
    updateField,
    resetForm,
    resetPassword,
    clearError
} from "../../features/forgot-password-state/ForgotPasswordState";
import { useNavigate } from "react-router-dom";
import {
    useState,
    useEffect
} from "react";

const ResetPassword = () => {
    const { newPassword, confirmPassword, isLoading, error } = useSelector((state) => state.forgotPassword);
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

    const submitResetPassword = async (e) => {
        try {
            e.preventDefault();
            const response = await dispatch(resetPassword({
                token: new URLSearchParams(window.location.search).get("token"),
                newPassword,
                confirmPassword,
                userType: "Patient"
            }))

            if (resetPassword.fulfilled.match(response)) {
                dispatch(resetForm())
                navigate("/cms");
            } else {
                dispatch(clearError())
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
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4 p-4 rounded-lg">
                        <form onSubmit={submitResetPassword}>
                            <div className="space-y-4">
                                <div className="flex flex-col">
                                    <label className="font-semibold text-black">New Password</label>
                                    <TextField
                                        label="Enter New Password"
                                        type="password"
                                        margin="dense"
                                        name="newPassword"
                                        autoComplete="off"
                                        value={newPassword}
                                        onChange={handleResetPasswordChanges}
                                        error={!!fieldErrors.newPassword}
                                        helperText={fieldErrors.newPassword || ""}
                                        variant="outlined"
                                        fullWidth
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="font-semibold text-black">Confirm Password</label>
                                    <TextField
                                        label="Confirm New Password"
                                        type="password"
                                        margin="dense"
                                        name="confirmPassword"
                                        autoComplete="off"
                                        value={confirmPassword}
                                        onChange={handleResetPasswordChanges}
                                        error={!!fieldErrors.confirmPassword}
                                        helperText={fieldErrors.confirmPassword || ""}
                                        variant="outlined"
                                        disabled={isLoading}
                                        fullWidth
                                    />
                                </div>
                            </div>

                            <div className="flex item-center justify-between mt-6">
                                <div className="ml-auto">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                                    >
                                        {isLoading ? "Loading..." : "Reset Password"}
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