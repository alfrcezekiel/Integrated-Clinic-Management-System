import {
    TextField,
    FormControl,
    FormLabel,
} from "@mui/material";
import PropTypes from "prop-types";

const LifeStyleInformationStepper = ({ patientFormData, handleChange, fieldErrors }) => {
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Smoking */}
                <FormControl component="fieldset" className="w-full pt-2">
                    <FormLabel>Do you smoke or use tobacco products?</FormLabel>
                    <TextField
                        margin="dense"
                        label="Smoking Frequency"
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
                    <FormLabel>Do you have any allergies (medications, food, etc.)?</FormLabel>
                    <TextField
                        label="Allergy Details"
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
                    <FormLabel>Do you drink alcohol? How often?</FormLabel>
                    <TextField
                        label="Alchohol Frequency"
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
                    <FormLabel>Do you regularly exercise?</FormLabel>
                    <TextField
                        label="Exercise Frequency"
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
                {/* Sleep hours */}
                <FormControl component="fieldset" className="w-full pt-2">
                    <FormLabel>How many hours of sleep do you get per night?</FormLabel>
                    <TextField
                        label="Sleep Hours"
                        name="sleepHours"
                        placeholder="Enter Sleep Hours Details"
                        fullWidth
                        margin="dense"
                        value={patientFormData.sleepHours}
                        onChange={handleChange}
                        error={!!fieldErrors.sleepHours}
                        helperText={fieldErrors.sleepHours ? fieldErrors.sleepHours : ""}
                        autoComplete="off"
                    />
                </FormControl>
                {/* Stress Level */}
                <FormControl component="fieldset" className="w-full pt-2">
                    <FormLabel>How often do you feel stressed?</FormLabel>
                    <TextField
                        label="Stress Frequency"
                        name="stressFrequency"
                        placeholder="Enter Stress Frequency Details"
                        fullWidth
                        margin="dense"
                        value={patientFormData.stressFrequency}
                        onChange={handleChange}
                        error={!!fieldErrors.stressFrequency}
                        helperText={fieldErrors.stressFrequency ? fieldErrors.stressFrequency : ""}
                        autoComplete="off"
                    />
                </FormControl>
                {/* Dietary supplements or vitamins intake */}
                <FormControl component="fieldset" className="w-full pt-2">
                    <FormLabel>Do you take any dietary supplements or vitamins?</FormLabel>
                    <TextField
                        label="Dietary Supplements"
                        name="dietarySupplements"
                        placeholder="Enter Dietary Supplements Details"
                        fullWidth
                        margin="dense"
                        value={patientFormData.dietarySupplements}
                        onChange={handleChange}
                        error={!!fieldErrors.dietarySupplements}
                        helperText={fieldErrors.dietarySupplements ? fieldErrors.dietarySupplements : ""}
                        autoComplete="off"
                    />
                </FormControl>
                {/* Water intake */}
                <FormControl component="fieldset" className="w-full pt-2">
                    <FormLabel>How much water do you drink daily?</FormLabel>
                    <TextField
                        label="Water Intake"
                        name="waterIntake"
                        placeholder="Enter Water Intake Details"
                        fullWidth
                        margin="dense"
                        value={patientFormData.waterIntake}
                        onChange={handleChange}
                        error={!!fieldErrors.waterIntake}
                        helperText={fieldErrors.waterIntake ? fieldErrors.waterIntake : ""}
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
