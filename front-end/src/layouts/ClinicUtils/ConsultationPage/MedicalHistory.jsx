import {
    TextField,
    FormControl,
    FormLabel,
} from "@mui/material";
import PropTypes from "prop-types";

const MedicalHistoryStepper = ({ patientFormData, handleChange, fieldErrors }) => {
    return (
        <div className="space-y-2">
            <div className="block p-4 justify-start">
                <h1 className="font-semibold text-black text-2xl">Medical History</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-col-2 gap-6">
                <FormControl component="fieldset" className="w-full pt-2">
                    <FormLabel>
                        Does the patient have any existing medical conditions?
                    </FormLabel>
                    <TextField
                        helperText={fieldErrors.medicalConditionDetails ? fieldErrors.medicalConditionDetails : ""}
                        error={!!fieldErrors.medicalConditionDetails}
                        autoComplete="off"
                        label="Enter Medical Condition Details"
                        name="medicalConditionDetails"
                        fullWidth
                        margin="dense"
                        placeholder="Enter Medical Condition Details"
                        value={patientFormData.medicalConditionDetails}
                        onChange={(e) => handleChange(e)}
                    />
                </FormControl>
                <FormControl component="fieldset" className="w-full pt-4">
                    <FormLabel>
                        Is the patient currently taking any medications?
                    </FormLabel>
                    <TextField
                        label="If yes, specify"
                        name="medicationDetails"
                        fullWidth
                        margin="dense"
                        placeholder="Enter Medication Details"
                        value={patientFormData.medicationDetails}
                        onChange={(e) => handleChange(e)}
                        error={!!fieldErrors.medicationDetails}
                        helperText={fieldErrors.medicationDetails ? fieldErrors.medicationDetails : ""}
                        autoComplete="off"
                    />
                </FormControl>
                <FormControl component="fieldset" className="w-full pt-4">
                    <FormLabel>
                        Do you have a history of high blood pressure or any other cardiovascular conditions?
                    </FormLabel>
                    <TextField
                        label="High Blood Details"
                        placeholder="Enter High Blood Details"
                        value={patientFormData.cardioVascularDetails}
                        onChange={(e) => handleChange(e)}
                        name="cardioVascularDetails"
                        fullWidth
                        autoComplete="off"
                        error={!!fieldErrors.cardioVascularDetails}
                        helperText={fieldErrors.cardioVascularDetails ? fieldErrors.cardioVascularDetails : ""}
                        margin="dense"
                    />
                </FormControl>
            </div>
        </div>
    );
};

MedicalHistoryStepper.propTypes = {
    patientFormData: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    fieldErrors: PropTypes.object.isRequired,
};

export default MedicalHistoryStepper; 