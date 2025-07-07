import {
    useEffect,
    useState
} from "react";
import TextField from "@mui/material/TextField";
import {
    useSelector,
    useDispatch
} from "react-redux";
import {
    updateField,
    resetForm,
    submitResetEmail,
    clearError,
} from "../../features/forgot-password-state/ForgotPasswordState";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const { email, isLoading, error } = useSelector((state) => state.forgotPassword);
    const [fieldErrors, setFieldErrors] = useState({
        email: "",
    })
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Forgot Password"

        return () => {
            dispatch(resetForm())
        }
    }, [dispatch])

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const validateStepOne = () => {
        const newErrors = {};
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        return Object.keys(newErrors).length === 0;
    };

    /**
     * function handles the next step in forgot password
     */
    const handleNextStep = async (e) => {
        try {
            e.preventDefault();
            const isValid = validateStepOne();
            if (!isValid) return;
            /**
             * handles the submission of reset email if it's exists in the server
             */
            const response = await dispatch(submitResetEmail({ email, userType: "Patient" }));

            if (submitResetEmail.fulfilled.match(response)) {
                dispatch(resetForm())
                dispatch(clearError())
                navigate("/ForgotPassword")
            }

        } catch (error) {
            console.error(`Error in handling the next step in forgot password: ${error}`);
        }
    }

    /**
     * function that handles changes in the the textfields of forgot password
     */
    const handleForgotPasswordChanges = async (e) => {
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
    return (
        <div className="p-4 flex gap-4 max-h-screen">
            <div className="flex justify-center p-4 w-full lg:w-3/5 md:w-1/2">
                <div className="flex-col mt-50">
                    <div className="p-4">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 text-center lg:text-center">
                            Forgot Password
                        </h1>
                        <p className="text-gray-600 text-sm mb-8 text-center lg:text-center p-2">
                            Don&apos;t worry! Just enter your email address and follow the steps to securely reset your password.
                        </p>
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}
                    </div>
                    <div className="space-y-4 p-4 rounded-lg">
                        <form onSubmit={handleNextStep}>
                            <div className="space-y-4">
                                <div className="flex flex-col">
                                    <label className="font-semibold text-black">Email</label>
                                    <TextField
                                        label="Enter Email"
                                        type="text"
                                        margin="dense"
                                        name="email"
                                        autoComplete="off"
                                        value={email}
                                        onChange={handleForgotPasswordChanges}
                                        error={!!fieldErrors.email}
                                        helperText={fieldErrors.email || ""}
                                        variant="outlined"
                                        fullWidth
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="flex item-center justify-between mt-6">
                                <div className="ml-auto">
                                    <button
                                        type="submit"
                                        disabled={isLoading || !email}
                                        className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                                    >
                                        {isLoading ? "Loading..." : "Send Reset Email"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="max-w-6/12 hidden lg:block">
                <img src="img/stethoscope.jpg" className="max-w-full max-h-full object-cover rounded-3xl ml-60" alt="Pattern" />
            </div>
        </div>
    )
}

export default ForgotPassword;