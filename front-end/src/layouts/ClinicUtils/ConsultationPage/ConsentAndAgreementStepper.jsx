import {
    FormControl,
    FormControlLabel,
    Checkbox,
    Typography,
    Box,
    Link,
    Alert
} from "@mui/material";
import PropTypes from "prop-types";

const ConsentAndAgreementStepper = ({ patientFormData, handleChange, fieldErrors = {} }) => {
    // Safely access consent value with default
    const consentValue = patientFormData?.consent || "No";

    // Ensure handleChange is a function
    const handleConsentChange = (e) => {
        if (typeof handleChange === 'function') {
            handleChange({
                target: {
                    name: 'consent',
                    value: e.target.checked ? "Yes" : "No"
                }
            });
        }
    };

    return (
        <div className="space-y-6">
            <Box className="space-y-4">
                <Alert severity="info" className="mb-4">
                    Please review and agree to the following terms before proceeding with the consultation.
                </Alert>

                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <Typography variant="body2" className="text-gray-600">
                        1. I understand that the information provided will be kept confidential and used only for medical purposes.
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                        2. I consent to the collection and processing of my personal and medical information.
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                        3. I acknowledge that I have provided accurate and complete information to the best of my knowledge.
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                        4. I understand that I can withdraw my consent at any time.
                    </Typography>
                </div>

                <FormControl
                    component="fieldset"
                    className="w-full"
                    error={!!fieldErrors?.consent}
                >
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={consentValue === "Yes"}
                                onChange={handleConsentChange}
                                name="consent"
                                color="primary"
                            />
                        }
                        label={
                            <Typography variant="body2">
                                I consent to the consultation and agree to the{" "}
                                <Link
                                    href="/terms"
                                    target="_blank"
                                    className="text-blue-600 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    terms and conditions
                                </Link>
                                {" "}and{" "}
                                <Link
                                    href="/privacy"
                                    target="_blank"
                                    className="text-blue-600 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    privacy policy
                                </Link>
                            </Typography>
                        }
                    />
                    {fieldErrors?.consent && (
                        <Typography variant="caption" color="error" className="mt-1 block">
                            {fieldErrors.consent && fieldErrors.consent}
                        </Typography>
                    )}
                </FormControl>

                <Typography variant="body2" className="text-gray-500 italic">
                    By checking this box, you acknowledge that you have read, understood, and agree to the terms and conditions of the consultation.
                </Typography>
            </Box>
        </div>
    );
};

ConsentAndAgreementStepper.propTypes = {
    patientFormData: PropTypes.shape({
        consent: PropTypes.string
    }),
    handleChange: PropTypes.func,
    fieldErrors: PropTypes.shape({
        consent: PropTypes.string
    })
};

export default ConsentAndAgreementStepper;
