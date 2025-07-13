import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import CMS from "../../API/CMS";

/**
 * initial state of forgot password
 */
const forgotPasswordInitialState = {
    email: "",
    userType: "",
    newPassword: "",
    confirmPassword: "",
    error: null,
    success: false
}

/**
 * function to submit the email to reset the password
 */
export const submitResetEmail = createAsyncThunk(
    'forgotPassword/sendResetEmail',
    async ({ email, userType }, { rejectWithValue }) => {
        try {
            const response = await CMS.post(`/CMS/cms.api.com/sendResetEmail`, { email, userType }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 200) {
                return response.data.message;
            } else {
                throw new Error(`Failed to send reset password email`)
            }
        } catch (error) {
            if (error.response) {
                if (error.response && error.response.status === 400) {
                    const errors = error.response.data.errors;
                    return rejectWithValue(errors);
                }

                return rejectWithValue({
                    message: error.response.data?.message || 'No account found with this email address'
                });
            }
            return rejectWithValue(`Failed to send reset password email`);
        }
    }
);

/**
 * function to reset the password
 */
export const resetPassword = createAsyncThunk(
    'forgotPassword/resetPassword',
    async ({ token, newPassword, confirmPassword, userType }, { rejectWithValue }) => {
        try {
            const response = await CMS.post(`/CMS/cms.api.com/resetPassword`, {
                newPassword,
                confirmPassword,
                userType
            }, {
                params: {
                    token: token,
                    type: userType
                }
            });

            if (response.status === 200) {
                return response.data.message;
            } else {
                throw new Error(`Failed to reset password`)
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
        }
    }
);

/**
 *  forgot password slice    
 */
const forgotPaswordSlice = createSlice({
    name: "forgotPassword",
    initialState: forgotPasswordInitialState,
    reducers: {
        updateField: (state, action) => {
            const { field, value } = action.payload;
            if (Object.prototype.hasOwnProperty.call(state, field)) {
                state[field] = value;
                if (state.error) state.error = null;
            } else {
                console.error(`Field ${field} does not exist in forgotPassword state.`);
            }
        },
        resetForm: () => forgotPasswordInitialState,
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            /**
             * reducer function for submitting the reset email
             */
            .addCase(submitResetEmail.pending, (state) => {
                state.error = null;
                state.success = false;
            })
            .addCase(submitResetEmail.fulfilled, (state) => {
                state.success = true;
                state.error = null;
            })
            .addCase(submitResetEmail.rejected, (state, action) => {
                state.error = action.payload?.message || action.error?.message;
                state.success = false;
            })

            /**
             * reducer function for resetting the password
             */
            .addCase(resetPassword.pending, (state) => {
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.success = true;
                state.error = null;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.error = action.payload;
            })
    }
})

export const { updateField, resetForm, clearError } = forgotPaswordSlice.actions;
export default forgotPaswordSlice.reducer;