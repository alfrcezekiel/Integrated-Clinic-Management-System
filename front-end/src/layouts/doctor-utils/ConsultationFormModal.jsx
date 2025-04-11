import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
} from "@mui/material";
import PropTypes from "prop-types";

const ConsultationFormModal = ({ open, onClose, onSubmit, consultationFormData, setConsultationFormData }) => {
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConsultationFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleFormSubmit = (e) => {
        try {
            e.preventDefault();
            if (consultationFormData && consultationFormData.consent) {
                onSubmit(consultationFormData);
            } else {
                alert("Please accept the consent and agreement.");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle className="text-xl font-bold">Consultation Form</DialogTitle>
            <DialogContent dividers className="space-y-6">
                <form className="space-y-4" onSubmit={handleFormSubmit} autoComplete="off">
                    {/* Patient Information */}
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">Patient Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextField label="First Name" name="firstName" fullWidth value={consultationFormData.firstName} onChange={handleChange} />
                            <TextField label="Last Name" name="lastName" fullWidth value={consultationFormData.lastName} onChange={handleChange} />
                            <TextField label="Email" name="email" fullWidth type="email" value={consultationFormData.email} onChange={handleChange} />
                            <TextField label="Phone Number" name="phoneNumber" fullWidth value={consultationFormData.phoneNumber} onChange={handleChange} />
                            <TextField label="Appointment Date" name="appointmentDate" type="date" slotProps={{ inputLabel: { shrink: true } }} value={consultationFormData.appointmentDate} onChange={handleChange} fullWidth />
                            <TextField label="Appointment Time" name="appointmentTime" type="time" slotProps={{ inputLabel: { shrink: true } }} value={consultationFormData.appointmentTime} onChange={handleChange} fullWidth />
                        </div>
                    </div>

                    {/* Medical History */}
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">Medical History</h2>
                        <FormControl component="fieldset">
                            <FormLabel>Does the patient have any existing medical conditions?</FormLabel>
                            <RadioGroup row name="hasMedicalConditions" value={consultationFormData.hasMedicalConditions} onChange={handleChange}>
                                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                                <FormControlLabel value="No" control={<Radio />} label="No" />
                            </RadioGroup>
                            {consultationFormData.hasMedicalConditions === "Yes" && (
                                <TextField label="If yes, specify" name="medicalConditionDetails" fullWidth multiline rows={2} value={consultationFormData.medicalConditionDetails} onChange={handleChange} />
                            )}
                        </FormControl>

                        <FormControl component="fieldset">
                            <FormLabel>Is the patient currently taking any medications?</FormLabel>
                            <RadioGroup row name="takingMedications" value={consultationFormData.takingMedications} onChange={handleChange}>
                                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                                <FormControlLabel value="No" control={<Radio />} label="No" />
                            </RadioGroup>
                            {consultationFormData.takingMedications === "Yes" && (
                                <TextField label="If yes, specify" name="medicationDetails" fullWidth multiline rows={2} value={consultationFormData.medicationDetails} onChange={handleChange} />
                            )}
                        </FormControl>
                    </div>

                    {/* Lifestyle Information */}
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">Lifestyle Information</h2>
                        {/* Smoking */}
                        <FormControl component="fieldset" className="w-full">
                            <FormLabel>Does the patient smoke?</FormLabel>
                            <RadioGroup row name="smokes" value={consultationFormData.smokes} onChange={handleChange}>
                                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                                <FormControlLabel value="No" control={<Radio />} label="No" />
                            </RadioGroup>
                            {consultationFormData.smokes === "Yes" && (
                                <TextField
                                    label="If yes, how many per day?"
                                    name="smokeFrequency"
                                    fullWidth
                                    value={consultationFormData.smokeFrequency}
                                    onChange={handleChange}
                                />
                            )}
                        </FormControl>


                        {/* Allergies */}
                        <FormControl component="fieldset" className="w-full pt-2">
                            <FormLabel>Does the patient have any allergies?</FormLabel>
                            <RadioGroup row name="hasAllergies" value={consultationFormData.hasAllergies} onChange={handleChange}>
                                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                                <FormControlLabel value="No" control={<Radio />} label="No" />
                            </RadioGroup>
                            {consultationFormData.hasAllergies === "Yes" && (
                                <TextField
                                    label="If yes, specify"
                                    name="allergyDetails"
                                    fullWidth
                                    value={consultationFormData.allergyDetails}
                                    onChange={handleChange}
                                />
                            )}
                        </FormControl>

                        {/* Alcohol */}
                        <FormControl component="fieldset" className="w-full pt-2">
                            <FormLabel>Does the patient consume alcohol?</FormLabel>
                            <RadioGroup row name="drinksAlcohol" value={consultationFormData.drinksAlcohol} onChange={handleChange}>
                                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                                <FormControlLabel value="No" control={<Radio />} label="No" />
                            </RadioGroup>
                            {consultationFormData.drinksAlcohol === "Yes" && (  
                                <TextField
                                    label="If yes, how many drinks per week?"
                                    name="alcoholFrequency"
                                    fullWidth
                                    value={consultationFormData.alcoholFrequency}
                                    onChange={handleChange}
                                />
                            )}
                        </FormControl>
                    </div>

                    {/* Clinic Assessments */}
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">Clinic Assessments</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextField label="Diagnosis" name="diagnosis" fullWidth value={consultationFormData.diagnosis} onChange={handleChange} />
                            <TextField label="Symptoms" name="symptoms" fullWidth value={consultationFormData.symptoms} onChange={handleChange} />
                            <TextField label="Prescription" name="prescription" fullWidth value={consultationFormData.prescription} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Consent and Agreement */}
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">Consent and Agreement</h2>
                        <FormControlLabel control={<Checkbox checked={consultationFormData.consent} onChange={handleChange} name="consent" />} label="I consent to the consultation and agree to the terms and privacy policy." />
                    </div>
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" variant="outlined">Cancel</Button>
                <Button onClick={handleFormSubmit} color="primary" variant="contained" type="submit">Consult Patient</Button>
            </DialogActions>
        </Dialog>
    )
}
ConsultationFormModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    consultationFormData: PropTypes.object.isRequired,
    setConsultationFormData: PropTypes.func.isRequired,
}

export default ConsultationFormModal;