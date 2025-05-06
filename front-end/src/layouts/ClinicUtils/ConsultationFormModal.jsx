import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormHelperText
} from "@mui/material";
import PropTypes from "prop-types";

const ConsultationFormModal = ({
  open,
  onClose,
  onSubmit,
  consultationFormData,
  setConsultationFormData,
  fieldsError,
  setFieldsError
}) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConsultationFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Clear conditional fields when "No" is selected
      if (name === "hasMedicalConditions" && value === "No") {
        updatedData.medicalConditionDetails = "";
      }

      if (name === "takingMedications" && value === "No") {
        updatedData.medicationDetails = "";
      }

      if (name === "smokes" && value === "No") {
        updatedData.smokeFrequency = "";
      }

      if (name === "hasAllergies" && value === "No") {
        updatedData.allergyDetails = "";
      }

      if (name === "drinksAlcohol" && value === "No") {
        updatedData.alcoholFrequency = "";
      }

      return updatedData;
    });

    if (fieldsError && fieldsError[name]) {
      setFieldsError((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    try {
      setFieldsError((prev) => ({
        ...prev,
        consent: ""
      }))

      if (consultationFormData?.consent) {
        onSubmit(consultationFormData);
      } else {
        setFieldsError((prev) => ({
          ...prev,
          consent: "You must agree to the terms and privacy policy.",
        }));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="text-xl font-bold">Consultation Form</DialogTitle>
      <DialogContent dividers className="space-y-6">
        <form
          className="space-y-4"
          onSubmit={handleFormSubmit}
        >
          {/* Patient Information */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Patient Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="First Name"
                name="firstName"
                fullWidth
                value={consultationFormData.firstName}
                onChange={handleChange}
                autoComplete="off"
                margin="dense"
                error={!!fieldsError.firstName}
                helperText={fieldsError.firstName ? fieldsError.firstName : ""}
              />
              <TextField
                label="Last Name"
                name="lastName"
                fullWidth
                margin="dense"
                value={consultationFormData.lastName}
                onChange={handleChange}
                autoComplete="off"
                error={!!fieldsError.lastName}
                helperText={fieldsError.lastName ? fieldsError.lastName : ""}
              />
              <TextField
                label="Email"
                name="email"
                autoComplete="off"
                margin="dense"
                error={!!fieldsError.email}
                helperText={fieldsError.email ? fieldsError.email : ""}
                fullWidth
                type="text"
                value={consultationFormData.email}
                onChange={handleChange}
              />
              <TextField
                label="Phone Number"
                name="phoneNumber"
                margin="dense"
                fullWidth
                value={consultationFormData.phoneNumber}
                onChange={handleChange}
                autoComplete="off"
                error={!!fieldsError.phoneNumber}
                helperText={fieldsError.phoneNumber ? fieldsError.phoneNumber : ""}
              />
              <TextField
                label="Appointment Date"
                margin="dense"
                name="appointmentDate"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={consultationFormData.appointmentDate}
                onChange={handleChange}
                autoComplete="off"
                error={!!fieldsError.appointmentDate}
                helperText={fieldsError.appointmentDate ? fieldsError.appointmentDate : ""}
                fullWidth
              />
              <TextField
                label="Appointment Time"
                name="appointmentTime"
                type="time"
                margin="dense"
                slotProps={{ inputLabel: { shrink: true } }}
                value={consultationFormData.appointmentTime}
                onChange={handleChange}
                autoComplete="off"
                error={!!fieldsError.appointmentTime}
                helperText={fieldsError.appointmentTime ? fieldsError.appointmentTime : ""}
                fullWidth
              />
            </div>
          </div>

          {/* Medical History */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Medical History</h2>
            <FormControl component="fieldset" className="w-full pt-2">
              <FormLabel>
                Does the patient have any existing medical conditions?
              </FormLabel>
              <RadioGroup
                row
                name="hasMedicalConditions"
                value={consultationFormData.hasMedicalConditions}
                onChange={handleChange}
              >
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="No" control={<Radio />} label="No" />
              </RadioGroup>
              <FormHelperText error sx={{ textAlign: "left", marginLeft: 0 }}>
                {fieldsError.hasMedicalConditions}
              </FormHelperText>
              {consultationFormData.hasMedicalConditions === "Yes" && (
                <TextField
                  helperText={fieldsError.medicalConditionDetails ? fieldsError.medicalConditionDetails : ""}
                  error={!!fieldsError.medicalConditionDetails}
                  autoComplete="off"
                  label="If yes, specify"
                  name="medicalConditionDetails"
                  fullWidth
                  margin="dense"
                  value={consultationFormData.medicalConditionDetails}
                  onChange={handleChange}
                />
              )}
            </FormControl>
            <FormControl component="fieldset" className="w-full pt-4">
              <FormLabel>
                Is the patient currently taking any medications?
              </FormLabel>
              <RadioGroup
                row
                name="takingMedications"
                value={consultationFormData.takingMedications}
                onChange={handleChange}
              >
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="No" control={<Radio />} label="No" />
              </RadioGroup>
              <FormHelperText error sx={{ textAlign: "left", marginLeft: 0 }}>
                {fieldsError.takingMedications}
              </FormHelperText>
              {consultationFormData.takingMedications === "Yes" && (
                <TextField
                  label="If yes, specify"
                  name="medicationDetails"
                  fullWidth
                  margin="dense"
                  value={consultationFormData.medicationDetails}
                  onChange={handleChange}
                  error={!!fieldsError.medicationDetails}
                  helperText={fieldsError.medicationDetails ? fieldsError.medicationDetails : ""}
                  autoComplete="off"
                />
              )}
            </FormControl>
          </div>

          {/* Lifestyle Information */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Lifestyle Information</h2>
            {/* Smoking */}
            <FormControl component="fieldset" className="w-full pt-2">
              <FormLabel>Does the patient smoke?</FormLabel>
              <RadioGroup
                row
                name="smokes"
                value={consultationFormData.smokes}
                onChange={handleChange}
              >
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="No" control={<Radio />} label="No" />
              </RadioGroup>
              <FormHelperText error sx={{ textAlign: "left", marginLeft: 0 }}>
                {fieldsError.smokes}
              </FormHelperText>
              {consultationFormData.smokes === "Yes" && (
                <TextField
                  margin="dense"
                  label="If yes, how many per day?"
                  name="smokeFrequency"
                  fullWidth
                  value={consultationFormData.smokesFrequency}
                  onChange={handleChange}
                  error={!!fieldsError.smokesFrequency}
                  helperText={fieldsError.smokesFrequency ? fieldsError.smokesFrequency : ""}
                  autoComplete="off"
                />
              )}
            </FormControl>

            {/* Allergies */}
            <FormControl component="fieldset" className="w-full pt-2">
              <FormLabel>Does the patient have any allergies?</FormLabel>
              <RadioGroup
                row
                name="hasAllergies"
                value={consultationFormData.hasAllergies}
                onChange={handleChange}
              >
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="No" control={<Radio />} label="No" />
              </RadioGroup>
              <FormHelperText error sx={{ textAlign: "left", marginLeft: 0 }}>
                {fieldsError.hasAllergies}
              </FormHelperText>
              {consultationFormData.hasAllergies === "Yes" && (
                <TextField
                  label="If yes, specify"
                  name="allergyDetails"
                  fullWidth
                  margin="dense"
                  value={consultationFormData.allergyDetails}
                  error={!!fieldsError.allergyDetails}
                  helperText={fieldsError.allergyDetails ? fieldsError.allergyDetails : ""}
                  onChange={handleChange}
                  autoComplete="off"
                />
              )}
            </FormControl>

            {/* Alcohol */}
            <FormControl component="fieldset" className="w-full pt-2">
              <FormLabel>Does the patient consume alcohol?</FormLabel>
              <RadioGroup
                row
                name="drinksAlcohol"
                value={consultationFormData.drinksAlcohol}
                onChange={handleChange}
              >
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="No" control={<Radio />} label="No" />
              </RadioGroup>
              <FormHelperText error sx={{ textAlign: "left", marginLeft: 0 }}>
                {fieldsError.drinksAlcohol}
              </FormHelperText>
              {consultationFormData.drinksAlcohol === "Yes" && (
                <TextField
                  label="If yes, how many drinks per week?"
                  name="alcoholFrequency"
                  fullWidth
                  value={consultationFormData.alcoholFrequency}
                  margin="dense"
                  onChange={handleChange}
                  error={!!fieldsError.alcoholFrequency}
                  helperText={fieldsError.alcoholFrequency ? fieldsError.alcoholFrequency : ""}
                  autoComplete="off"
                /> 
              )}
            </FormControl>
          </div>

          {/* Clinic Assessments */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Clinic Assessments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Diagnosis"
                name="diagnosis"
                fullWidth
                margin="dense"
                value={consultationFormData.diagnosis}
                onChange={handleChange}
                error={!!fieldsError.diagnosis}
                helperText={fieldsError.diagnosis ? fieldsError.diagnosis : ""}
                autoComplete="off"
              />
              <TextField
                label="Symptoms"
                name="symptoms"
                fullWidth
                margin="dense"
                value={consultationFormData.symptoms}
                onChange={handleChange}
                error={!!fieldsError.symptoms}
                helperText={fieldsError.symptoms ? fieldsError.symptoms : ""}
                autoComplete="off"
              />
              <TextField
                label="Prescription"
                name="prescription"
                fullWidth
                margin="dense"
                value={consultationFormData.prescription}
                onChange={handleChange}
                error={!!fieldsError.prescription}
                helperText={fieldsError.prescription ? fieldsError.prescription : ""}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Consent and Agreement */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Consent and Agreement</h2>
            <FormControlLabel
              control={
                <Checkbox
                  checked={consultationFormData.consent}
                  onChange={handleChange}
                  name="consent"
                />
              }
              label="I consent to the consultation and agree to the terms and privacy policy."
            />
            {fieldsError.consent && (
              <p className="text-sm text-red-600 mt-1">{fieldsError.consent}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={onClose} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button type="submit" color="primary" variant="contained">
              Consult Patient
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

ConsultationFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  consultationFormData: PropTypes.object.isRequired,
  setConsultationFormData: PropTypes.func.isRequired,
  fieldsError: PropTypes.object.isRequired,
  setFieldsError: PropTypes.func.isRequired,
};

export default ConsultationFormModal;
