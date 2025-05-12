import {
    TextField,
    FormControl,
    FormLabel,
} from "@mui/material";
import PropTypes from "prop-types";

const ClinicAssessmentStepper = ({ patientFormData, handleChange, fieldErrors }) => {
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormControl component="fieldset" className="w-full pt-2">
                    <FormLabel>Diagnosis</FormLabel>
                    <TextField
                        label="Enter Diagnosis Details"
                        name="diagnosis"
                        placeholder="Enter Diagnosis Details"
                        fullWidth
                        margin="dense"
                        value={patientFormData.diagnosis}
                        onChange={handleChange}
                        error={!!fieldErrors.diagnosis}
                        helperText={fieldErrors.diagnosis ? fieldErrors.diagnosis : ""}
                        autoComplete="off"
                    />
                </FormControl>

                <FormControl component="fieldset" className="w-full pt-2">
                    <FormLabel>Symptoms</FormLabel>
                    <TextField
                        label="Enter Symptoms Details"
                        name="symptoms"
                        placeholder="Enter Symptoms Details"
                        fullWidth
                        margin="dense"
                        value={patientFormData.symptoms}
                        onChange={handleChange}
                        error={!!fieldErrors.symptoms}
                        helperText={fieldErrors.symptoms ? fieldErrors.symptoms : ""}
                        autoComplete="off"
                    />
                </FormControl>

                <FormControl component="fieldset" className="w-full pt-2">
                    <FormLabel>Prescription</FormLabel>
                    <TextField
                        label="Enter Prescription Details"
                        name="prescription"
                        placeholder="Enter Prescription Details"
                        fullWidth
                        margin="dense"
                        value={patientFormData.prescription}
                        onChange={handleChange}
                        error={!!fieldErrors.prescription}
                        helperText={fieldErrors.prescription ? fieldErrors.prescription : ""}
                        autoComplete="off"
                    />
                </FormControl>

                <FormControl component="fieldset" className="w-full pt-2">
                    <FormLabel>Treatment Plan</FormLabel>
                    <TextField
                        label="Enter Treatment Plan"
                        name="treatmentPlan"
                        placeholder="Enter Treatment Plan Details"
                        fullWidth
                        margin="dense"
                        value={patientFormData.treatmentPlan}
                        onChange={handleChange}
                        error={!!fieldErrors.treatmentPlan}
                        helperText={fieldErrors.treatmentPlan ? fieldErrors.treatmentPlan : ""}
                        autoComplete="off"
                    />
                </FormControl>
                <FormControl component="fieldset" className="w-full pt-2">
                    <FormLabel>Blood Pressure</FormLabel>
                    <TextField
                        label="Blood Pressure Details"
                        name="bloodPressure"
                        placeholder="Enter Blood Pressure Details"
                        fullWidth
                        margin="dense"
                        value={patientFormData.bloodPressure}
                        onChange={handleChange}
                        error={!!fieldErrors.bloodPressure}
                        helperText={fieldErrors.bloodPressure ? fieldErrors.bloodPressure : ""}
                        autoComplete="off"
                    />
                </FormControl>
                <FormControl component="fieldset" className="w-full pt-2">
                    <FormLabel>Heart Rate</FormLabel>
                    <TextField
                        label="Heart Rate Details"
                        name="heartRate"
                        placeholder="Enter Heart Rate Details"
                        fullWidth
                        margin="dense"
                        value={patientFormData.heartRate}
                        onChange={handleChange}
                        error={!!fieldErrors.heartRate}
                        helperText={fieldErrors.heartRate ? fieldErrors.heartRate : ""}
                        autoComplete="off"
                    />
                </FormControl>
            </div>
        </div>
    );
};

ClinicAssessmentStepper.propTypes = {
    patientFormData: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    fieldErrors: PropTypes.object.isRequired,
};

export default ClinicAssessmentStepper;