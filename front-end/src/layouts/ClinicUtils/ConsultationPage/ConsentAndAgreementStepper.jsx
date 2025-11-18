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

const ConsentAndAgreementStepper = ({ patientFormData, handleChange, fieldErrors }) => {
    const consentValue = patientFormData?.consent;

    const handleConsentChange = (e) => {
        const newValue = e.target.checked ? 1 : 0;
        if (typeof handleChange === "function") {
            handleChange({
                target: {
                    name: "consent",
                    value: newValue
                }
            });
        }
    };

    return (
        <div className="space-y-6">
            <Box>
                <Alert severity="info" className="mb-6 mt-6">
                    Please review and agree to the following terms before proceeding with the consultation.
                </Alert>

                <div className="space-y-3 bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-sm">
                    {[
                        "I understand that the information provided will be kept confidential and used only for medical purposes.",
                        "I consent to the collection and processing of my personal and medical information.",
                        "I acknowledge that I have provided accurate and complete information to the best of my knowledge.",
                        "I understand that I can withdraw my consent at any time."
                    ].map((text, idx) => (
                        <Typography key={idx} variant="body2" className="text-gray-700 leading-relaxed">
                            {idx + 1}. {text}
                        </Typography>
                    ))}
                </div>

                <FormControl
                    component="fieldset"
                    className="w-full mt-6"
                    error={!!fieldErrors.consent}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={consentValue === 1 || consentValue === true || consentValue === "Yes" || consentValue === "yes"}
                                onChange={handleConsentChange}
                                name="consent"
                                color="primary"
                            />
                        }
                        label={
                            <Typography variant="body2" className={fieldErrors?.consent ? `text-red-500` : `text-gray-700`}>
                                I have read and agree to the {" "}
                                <Link
                                    href="/terms"
                                    target="_blank"
                                    underline="hover"
                                    className="text-blue-600"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    terms and conditions
                                </Link>{" "}
                                and{" "}
                                <Link
                                    href="/privacy"
                                    target="_blank"
                                    underline="hover"
                                    className="text-blue-600"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    privacy policy
                                </Link>.
                            </Typography>
                        }
                    />
                    {fieldErrors.consent && (
                        <Typography variant="caption" color="error" className="mt-1">
                            {fieldErrors.consent}
                        </Typography>
                    )}
                </FormControl>

                <Typography variant="body2" className="text-sm text-gray-500 italic mt-4">
                    By checking this box, you acknowledge that you have read, understood, and agree to the terms and conditions of the consultation.
                </Typography>
            </Box>
        </div>
    );
};

ConsentAndAgreementStepper.propTypes = {
    patientFormData: PropTypes.shape({
        consent: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.bool,
            PropTypes.string
        ])
    }),
    handleChange: PropTypes.func.isRequired,
    fieldErrors: PropTypes.object.isRequired
};

export default ConsentAndAgreementStepper;
