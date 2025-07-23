import { createSlice } from "@reduxjs/toolkit";

const createClinicAccountInitialState = {
    clinicName: "",
    clinicAddress: "",
    clinicEmail: "",
    clinicPhoneNumber: "",
    openingDays: "",
    closingDays: "",
    openingHours: null,
    closingHours: null,
    consultationFee: "",
    clinicType: "",
    password: "",
    confirmPassword: ""
}

// 
const createClinicAccountSlice = createSlice({
    name: "createClinicAccount",
    initialState: createClinicAccountInitialState,
    reducers: {
        updateField: (state, action) => {
            const { field, value} = action.payload;
            if(Object.prototype.hasOwnProperty.call(state, field)) {
                state[field] = value;
            } else {
                console.error(`Field ${field} does not exist in createClinicAccount state.`);
            }
        },
        resetForm: () => createClinicAccountInitialState
    }
})

export const { updateField, resetForm } = createClinicAccountSlice.actions;
export default createClinicAccountSlice.reducer;