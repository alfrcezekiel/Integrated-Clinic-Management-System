import {
    TextField,
    FormControl,
    FormLabel,
} from "@mui/material";
import PropTypes from "prop-types";

const MedicalHistoryStepper = ({ patientFormData, handleChange, fieldErrors }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormControl className="w-full">
                    <FormLabel className="mb-2 text-sm text-gray-700">
                        What brings you here today?
                    </FormLabel>
                    <TextField
                        name="whatBringsYouHereDetails"
                        label="What brings you here today?"
                        placeholder="What brings you here today?"
                        value={patientFormData.whatBringsYouHereDetails}
                        onChange={handleChange}
                        error={!!fieldErrors.whatBringsYouHereDetails}
                        helperText={fieldErrors.whatBringsYouHereDetails || ""}
                        fullWidth
                        margin="dense"
                        autoComplete="off"
                    />
                </FormControl>
                <FormControl className="w-full">
                    <FormLabel className="mb-2 text-sm text-gray-700">
                        What are your symptoms?
                    </FormLabel>
                    <TextField
                        label="Enter Symptoms Details"
                        name="symptomsDetails"
                        value={patientFormData.symptomsDetails}
                        onChange={handleChange}
                        error={!!fieldErrors.symptomsDetails}
                        helperText={fieldErrors.symptomsDetails || ""}
                        fullWidth
                        margin="dense"
                        autoComplete="off"
                    />
                </FormControl>
                <FormControl className="w-full">
                    <FormLabel className="mb-2 text-sm text-gray-700">
                        Have you ever diagnosed with any chronic illnessess ?
                    </FormLabel>
                    <TextField
                        label="Recent Illness Details"
                        placeholder="Enter Recent Illness Details"
                        name="medicalConditionDetails"
                        value={patientFormData.medicalConditionDetails}
                        onChange={handleChange}
                        error={!!fieldErrors.medicalConditionDetails}
                        helperText={fieldErrors.medicalConditionDetails || ""}
                        fullWidth
                        margin="dense"
                        autoComplete="off"
                    />
                </FormControl>
                <FormControl className="w-full">
                    <FormLabel className="mb-2 text-sm text-gray-700">
                        When did your symptoms start?
                    </FormLabel>
                    <TextField
                        label="When Symptoms Started"
                        placeholder="Enter When Symptoms Started"
                        name="symptomsStartDetails"
                        value={patientFormData.symptomsStartDetails}
                        onChange={handleChange}
                        error={!!fieldErrors.symptomsStartDetails}
                        helperText={fieldErrors.symptomsStartDetails || ""}
                        fullWidth
                        margin="dense"
                        autoComplete="off"
                    />
                </FormControl>

                <FormControl className="w-full">
                    <FormLabel className="mb-2 text-sm text-gray-700">
                        Are you currently taking any medications?
                    </FormLabel>
                    <TextField
                        label="Currently Taking Medications"
                        placeholder="Enter Currently Taking Medications"
                        name="medicationDetails"
                        value={patientFormData.medicationDetails}
                        onChange={handleChange}
                        error={!!fieldErrors.medicationDetails}
                        helperText={fieldErrors.medicationDetails || ""}
                        fullWidth
                        margin="dense"
                        autoComplete="off"
                    />
                </FormControl>

                <FormControl className="w-full">
                    <FormLabel className="mb-2 text-sm text-gray-700">
                        Have you had any surgeries?
                    </FormLabel>
                    <TextField
                        label="Surgery Details"
                        placeholder="Enter Surgery Details"
                        name="surgeryDetails"
                        value={patientFormData.surgeryDetails}
                        onChange={handleChange}
                        error={!!fieldErrors.surgeryDetails}
                        helperText={fieldErrors.surgeryDetails || ""}
                        fullWidth
                        margin="dense"
                        autoComplete="off"
                    />
                </FormControl>
                <FormControl className="w-full">
                    <FormLabel className="mb-2 text-sm text-gray-700">
                        Have you experienced the issue before?
                    </FormLabel>
                    <TextField
                        label="Experience Issue details"
                        placeholder="Enter Experience Issue Details"
                        name="experienceIssueDetails"
                        value={patientFormData.experienceIssueDetails}
                        onChange={handleChange}
                        error={!!fieldErrors.experienceIssueDetails}
                        helperText={fieldErrors.experienceIssueDetails || ""}
                        fullWidth
                        margin="dense"
                        autoComplete="off"
                    />
                </FormControl>
                <FormControl className="w-full">
                    <FormLabel className="mb-2 text-sm text-gray-700">
                        Are your vaccinations up to date?
                    </FormLabel>
                    <TextField
                        label="Vaccination Details"
                        placeholder="Enter Vaccination Details"
                        name="vaccinationDetails"
                        value={patientFormData.vaccinationDetails}
                        onChange={handleChange}
                        error={!!fieldErrors.vaccinationDetails}
                        helperText={fieldErrors.vaccinationDetails || ""}
                        fullWidth
                        margin="dense"
                        autoComplete="off"
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
