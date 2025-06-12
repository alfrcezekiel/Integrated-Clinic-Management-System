import { configureStore } from "@reduxjs/toolkit";
import createClinicAccountReducer from "../features/clinicForm/CreateClinicAccountSlice"

export const store = configureStore({
    reducer: {
        createClinicAccount: createClinicAccountReducer
    }
})