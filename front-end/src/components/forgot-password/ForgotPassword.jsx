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
} from "../../features/forgot-password-state/ForgotPasswordState";
import MenuItem from '@mui/material/MenuItem';
import ResetEmailDialog from "./ResetEmailDialog";

const ForgotPassword = () => {
    const forgotPasswordState = useSelector((state) => state.forgotPassword);
    const [fieldErrors, setFieldErrors] = useState({
        email: "",
        userType: ""
    })
    const [showSuccessResetEmailDialog, setShowSuccessResetEmailDialog] = useState(false);
    const dispatch = useDispatch();
    const selectType = ["Patient", "Clinic", "Admin"];

    useEffect(() => {
        document.title = "Forgot Password"
        return () => {
            dispatch(resetForm())
        }
    }, [dispatch])

    /**
     * function handles the next step in forgot password
     */
    const handleNextStep = async (e) => {
        try {
            e.preventDefault();

            setFieldErrors({
                email: "",
                userType: ""
            })

            /**
             * handles the submission of reset email if it's exists in the server
             */
            const response = await dispatch(submitResetEmail({
                email: forgotPasswordState.email,
                userType: forgotPasswordState.userType
            }));

            if (submitResetEmail.fulfilled.match(response)) {
                setShowSuccessResetEmailDialog(true);
                dispatch(resetForm())
            } else if (submitResetEmail.rejected.match(response)) {
                const error = response.payload;

                if (error && error.errors) {
                    setFieldErrors((prev) => ({
                        ...prev,
                        ...error.errors
                    }))
                } else if (error?.message) {
                    setFieldErrors((prev) => ({
                        ...prev,
                        email: error.message
                    }))
                }
            }
        } catch (error) {
            console.error(`Error in handling the next step in forgot password: ${error}`);
        }
    }

    /**
     * @function to close the success reset email dialog
     */
    const closeSuccessResetEmailDialog = () => {
        setShowSuccessResetEmailDialog(false);
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
            setFieldErrors((prev) => ({
                ...prev,
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
                                        id="email"
                                        autoComplete="off"
                                        value={forgotPasswordState.email}
                                        onChange={handleForgotPasswordChanges}
                                        error={!!fieldErrors.email}
                                        helperText={fieldErrors.email || ""}
                                        variant="outlined"
                                        fullWidth
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="mb-2 font-semibold text-black">Select User Type</label>
                                    <TextField
                                        select
                                        label="User Type"
                                        name="userType"
                                        id="userType"
                                        autoComplete="off"
                                        value={forgotPasswordState.userType}
                                        onChange={handleForgotPasswordChanges}
                                        error={!!fieldErrors.userType}
                                        helperText={fieldErrors.userType || ""}
                                        variant="outlined"
                                        fullWidth
                                    >
                                        {selectType.map((type) => (
                                            <MenuItem
                                                key={type}
                                                value={type.toLowerCase()}
                                            >
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </div>
                            </div>
                            <div className="flex item-center justify-between mt-6">
                                <div className="ml-auto">
                                    <button
                                        type="submit"
                                        className={`cursor-pointer group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
                                    >
                                        Send Reset Email
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {showSuccessResetEmailDialog && (
                <ResetEmailDialog
                    closeSuccessDialog={closeSuccessResetEmailDialog}
                />
            )}
            <div className="max-w-6/12 hidden lg:block">
                <img src="img/stethoscope.jpg" className="max-w-full max-h-full object-cover rounded-3xl ml-60" alt="Stethoscope" />
            </div>
        </div>
    )
}

export default ForgotPassword;