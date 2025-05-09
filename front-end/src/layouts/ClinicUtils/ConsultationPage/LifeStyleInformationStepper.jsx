import {
    TextField,
    FormControl,
    FormLabel,
} from "@mui/material";
import PropTypes from "prop-types";

const LifeStyleInformationStepper = ({ patientFormData, handleChange, fieldErrors }) => {
    return (
        <div className="space-y-2">
            <div className="block p-4 justify-start">
                <h1 className="font-semibold text-black text-2xl">Lifestyle Information</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Smoking */}
                <FormControl component="fieldset" className="w-full pt-2">
                    <FormLabel>Does the patient smoke?</FormLabel>
                    <TextField
                        margin="dense"
                        label="If yes, how many per day?"
                        name="smokeFrequency"
                        fullWidth
                        placeholder="Enter Smoking Frequency Details"
                        value={patientFormData.smokeFrequency}
                        onChange={handleChange}
                        error={!!fieldErrors.smokeFrequency}
                        helperText={fieldErrors.smokeFrequency ? fieldErrors.smokeFrequency : ""}
                        autoComplete="off"
                    />
                </FormControl>

                {/* Allergies */}
                <FormControl component="fieldset" className="w-full pt-2">
                    <FormLabel>Does the patient have any allergies?</FormLabel>
                    <TextField
                        label="If yes, specify"
                        name="allergyDetails"
                        fullWidth
                        placeholder="Enter Allergies Details"
                        margin="dense"
                        value={patientFormData.allergyDetails}
                        error={!!fieldErrors.allergyDetails}
                        helperText={fieldErrors.allergyDetails ? fieldErrors.allergyDetails : ""}
                        onChange={handleChange}
                        autoComplete="off"
                    />
                </FormControl>

                {/* Alcohol */}
                <FormControl component="fieldset" className="w-full pt-2">
                    <FormLabel>Does the patient consume alcohol?</FormLabel>
                    <TextField
                        label="If yes, how many drinks per week?"
                        name="alcoholFrequency"
                        placeholder="Enter Alcohol Frequency Details"
                        fullWidth
                        value={patientFormData.alcoholFrequency}
                        margin="dense"
                        onChange={handleChange}
                        error={!!fieldErrors.alcoholFrequency}
                        helperText={fieldErrors.alcoholFrequency ? fieldErrors.alcoholFrequency : ""}
                        autoComplete="off"
                    />
                </FormControl>

                {/* {/* Exercise */}
                <FormControl component="fieldset" className="w-full pt-2">
                    <FormLabel>How often does the patient exercise?</FormLabel>
                    <TextField
                        label="Enter Exercise Frequency"
                        name="exerciseFrequency"
                        placeholder="Enter Exercise Frequency Details"
                        fullWidth
                        margin="dense"
                        value={patientFormData.exerciseFrequency}
                        onChange={handleChange}
                        error={!!fieldErrors.exerciseFrequency}
                        helperText={fieldErrors.exerciseFrequency ? fieldErrors.exerciseFrequency : ""}
                        autoComplete="off"
                    />
                </FormControl>
            </div>
        </div>
    );
};

LifeStyleInformationStepper.propTypes = {
    patientFormData: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    fieldErrors: PropTypes.object.isRequired,
};

export default LifeStyleInformationStepper;
