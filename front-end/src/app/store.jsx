import { configureStore } from "@reduxjs/toolkit";
import createClinicAccountReducer from "../features/clinicForm/CreateClinicAccountSlice"
import forgotPasswordReducer from "../features/forgot-password-state/ForgotPasswordState"

export const store = configureStore({
    reducer: {
        createClinicAccount: createClinicAccountReducer,
        forgotPassword: forgotPasswordReducer
    }
})