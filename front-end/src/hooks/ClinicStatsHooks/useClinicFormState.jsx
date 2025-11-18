import { useState, useCallback } from "react";
import { CLINIC_TYPES, getInitialFormState, getInitialFieldErrors } from "../../constants/clinicTypes";

export const useClinicFormState = (initialClinicType) => {
    const [clinicType, setClinicType] = useState(initialClinicType);
    const [formState, setFormState] = useState(getInitialFormState(clinicType));
    const [fieldErrors, setFieldErrors] = useState(getInitialFieldErrors(clinicType));

    /**
     * Updates the form state with the provided updates.
     * @param {Object} updates - The updates to apply to the form state.
     */
    const updateFormState = useCallback((updates) => {
        setFormState((prev) => ({
            ...prev,
            ...updates
        }));
    }, []);

    /**
     * Updates the error message for a specific field.
     * @param {string} field - The name of the field to update.
     * @param {string} error - The error message to set.
     */
    const updateFieldErrors = useCallback((field, error) => {
        setFieldErrors((prev) => ({
            ...prev,
            [field]: error
        }));
    }, []);

    const clearFieldErrors = useCallback(() => {
        setFieldErrors(getInitialFieldErrors(clinicType));
    }, [clinicType]);

    /**
     * Updates the clinic type and resets the form state and field errors.
     * @param {string} newClinicType - The new clinic type to set.
     */
    const updateClinicType = useCallback((newClinicType) => {
        if (newClinicType !== clinicType && CLINIC_TYPES[newClinicType.toLowerCase()]) {
            setClinicType(newClinicType);
            setFormState((prev) => ({
                ...getInitialFormState(newClinicType),
                firstName: prev.firstName,
                lastName: prev.lastName,
                email: prev.email,
                phoneNumber: prev.phoneNumber,
                appointmentDate: prev.appointmentDate,
                preferredTime: prev.preferredTime,
                appointmentID: prev.appointmentID,
                clinic_name: prev.clinic_name,
                admin_id: prev.admin_id,
                type: prev.type,
                clinicType: prev.clinicType
            }));
            setFieldErrors(getInitialFieldErrors(newClinicType));
        }
    }, [clinicType]);

    const resetForm = useCallback(() => {
        setFormState(getInitialFormState(clinicType));
        setFieldErrors(getInitialFieldErrors(clinicType));
    }, [clinicType]);

    return {
        formState,
        fieldErrors,
        clinicType,
        setFieldErrors,
        clearFieldErrors,
        updateFieldErrors,
        updateFormState,
        updateClinicType,
        setClinicType,
        resetForm
    }
}