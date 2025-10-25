import {
    useState,
    useCallback,
} from 'react';
import {
    TextField,
    Button,
    MenuItem,
    Box,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    AccessTime,
    AccessAlarm,
    AttachMoney,
    Business,
    Phone
} from '@mui/icons-material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Person from '@mui/icons-material/Person';
import Lock from '@mui/icons-material/Lock';
import Email from '@mui/icons-material/Email';
import LocationOn from '@mui/icons-material/LocationOn';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Proptypes from "prop-types"
import {
    LocalizationProvider,
    TimePicker
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import CMS from "../../API/CMS";
import dayjs from 'dayjs';

const ClinicRegistrationModal = ({ open, onClose, fieldErrors, setFieldErrors, formData, setFormData }) => {
    const [fileName, setFileName] = useState('');

    const handleFormDataChange = useCallback(async (e, field) => {
        if (e && typeof e === "object" && e.target) {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }));
        } else if (field) {
            setFormData((prev) => ({
                ...prev,
                [field]: e
            }));
        }

        const { name } = e.target;
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({
                ...prev,
                [name]: null
            }));
        }
    }, [fieldErrors, setFieldErrors, setFormData]);

    const handleFileChange = useCallback((event) => {
        const file = event?.target?.files ? event.target.files[0] : null;
        if (file) {
            setFileName(file.name);
            setFormData((prev) => ({
                ...prev,
                clinicImage: file,
            }));
        } else {
            setFileName('');
            setFormData((prev) => ({
                ...prev,
                clinicImage: null,
            }));
        }

        if (fieldErrors.clinicImage) {
            setFieldErrors((prev) => ({
                ...prev,
                clinicImage: null
            }));
        }
    }, [fieldErrors, setFieldErrors, setFormData]);

    const [showPassword, setShowPassword] = useState(false);
    const [confirmShowPassword, setConfirmShowPassword] = useState(false);

    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleToggleConfirmPassword = () => {
        setConfirmShowPassword((prev) => !prev);
    }

    // handles the clinic data  registration form submission
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();

            // Append all fields to FormData
            data.append("clinicName", formData.clinicName);
            data.append("clinicAddress", formData.clinicAddress);
            data.append("clinicPhoneNumber", formData.clinicPhoneNumber);
            data.append("clinicEmail", formData.clinicEmail);
            data.append("openingDays", formData.openingDays);
            data.append("closingDays", formData.closingDays);
            data.append("openingHours", formData.openingHours ? dayjs(formData.openingHours).format('hh:mm A') : "");
            data.append("closingHours", formData.closingHours ? dayjs(formData.closingHours).format('hh:mm A') : "");
            data.append("consultationFee", formData.consultationFee);
            data.append("clinicType", formData.clinicType);
            data.append("clinicId", formData.clinicId);
            data.append("password", formData.password);
            data.append("confirmPassword", formData.confirmPassword);
            data.append("adminID", localStorage.getItem("sid"));

            // Append image only if present
            if (formData.clinicImage) {
                data.append("clinicImage", formData.clinicImage);
            }

            const response = await CMS.post("/admin-dashboard/create-clinic", data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });

            if (response.data && response.status === 200) {
                setFieldErrors({
                    clinicName: "",
                    clinicAddress: "",
                    clinicEmail: "",
                    clinicImage: null,
                    clinicPhoneNumber: "",
                    openingDays: "",
                    closingDays: "",
                    openingHours: null,
                    closingHours: null,
                    consultationFee: "",
                    clinicType: "",
                    clinicId: "",
                    password: "",
                    confirmPassword: ""
                });
                alert("Clinic registered successfully");
                setFormData({
                    clinicName: "",
                    clinicAddress: "",
                    clinicEmail: "",
                    clinicImage: null,
                    clinicPhoneNumber: "",
                    openingDays: "",
                    closingDays: "",
                    openingHours: null,
                    closingHours: null,
                    consultationFee: "",
                    clinicType: "",
                    clinicId: "",
                    password: "",
                    confirmPassword: ""
                })
                onClose()
            }
        } catch (error) {
            if (error.response || error.response.data.status === 400) {
                setFieldErrors(error.response.data.errors);
            } else {
                console.error("Error in clinic registration:", error.message || error);
            }
        }
    }, [formData, onClose, setFieldErrors, setFormData]);

    const handleClose = useCallback(() => {
        onClose();
        setFileName('');
        setFieldErrors(prev => ({
            ...prev,
            clinicImage: ""
        }));
    }, [onClose, setFieldErrors]);

    const preferredOpeningDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const consultationFee = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000];
    const clinicTypes = ["General Clinic", "Specialist Clinic", "Dental Clinic", "Pediatric Clinic", "Dermatology Clinic", "Psychiatry Clinic", "Physiotherapy Clinic", "Optometry Clinic", "Gynecology Clinic", "Orthopedic Clinic"];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md" fullWidth
            classes={{ paper: "rounded-lg shadow-lg" }}
        >
            <DialogTitle className="text-white bg-blue-300 text-center">Registration Clinic</DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent className='space-y-6'>
                    {/* Clinic Information */}
                    <Box className="space-y-4 p-4 border rounded-lg shadow bg-blue-50" item="true">
                        <h3 className="font-semibold text-blue-600">Clinic Information</h3>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-blue-600">Clinic Name</Typography>
                            <Box className="flex items-center space-x-2">
                                <Person color="primary" />
                                <TextField
                                    fullWidth
                                    label="Enter Clinic Name"
                                    variant="outlined"
                                    margin="dense"
                                    autoComplete="off"
                                    name="clinicName"
                                    type="text"
                                    placeholder="Enter Clinic Name"
                                    value={formData.clinicName}
                                    onChange={(e) => handleFormDataChange(e)}
                                    error={Boolean(fieldErrors.clinicName)}
                                    helperText={fieldErrors.clinicName && fieldErrors.clinicName}
                                />
                            </Box>
                        </Box>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-blue-600">Clinic Address</Typography>
                            <Box className="flex items-center space-x-2">
                                <LocationOn color="primary" />
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    type="text"
                                    name="clinicAddress"
                                    placeholder="Enter Clinic Address"
                                    autoComplete="off"
                                    value={formData.clinicAddress}
                                    label="Enter Clinic Address"
                                    variant="outlined"
                                    onChange={(e) => handleFormDataChange(e)}
                                    error={Boolean(fieldErrors.clinicAddress)}
                                    helperText={fieldErrors.clinicAddress ? fieldErrors.clinicAddress : ""}
                                />
                            </Box>
                        </Box>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-blue-600">Clinic Phone Number</Typography>
                            <Box className="flex items-center space-x-2">
                                <Phone color="primary" />
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    type="number"
                                    name="clinicPhoneNumber"
                                    placeholder="Enter Clinic Phone Number"
                                    autoComplete="off"
                                    value={formData.clinicPhoneNumber}
                                    label="Enter Clinic Phone Number"
                                    variant="outlined"
                                    onChange={(e) => handleFormDataChange(e)}
                                    error={Boolean(fieldErrors.clinicPhoneNumber)}
                                    helperText={fieldErrors.clinicPhoneNumber ? fieldErrors.clinicPhoneNumber : ""}
                                />
                            </Box>
                        </Box>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-blue-600">Clinic Email</Typography>
                            <Box className="flex items-center space-x-2">
                                <Email color="primary" />
                                <TextField
                                    fullWidth
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Enter Clinic Email"
                                    label="Enter Clinic Email"
                                    variant="outlined"
                                    margin="dense"
                                    onChange={handleFormDataChange}
                                    name="clinicEmail"
                                    value={formData.clinicEmail}
                                    error={Boolean(fieldErrors.clinicEmail)}
                                    helperText={fieldErrors.clinicEmail ? fieldErrors.clinicEmail : ""}
                                />
                            </Box>
                        </Box>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-blue-600">Clinic Image</Typography>
                            <Box className="flex items-center space-x-2">
                                <PhotoCamera color="primary" />
                                <Button variant="outlined" component="label">
                                    Upload Image
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={(event) => handleFileChange(event)}
                                        name="clinicImage"
                                        multiple={false}
                                    />
                                </Button>
                                <Typography variant="body2" className="text-blue-500">
                                    {fileName}
                                </Typography>
                                {fieldErrors.clinicImage && (
                                    <Typography variant="body2" className="text-red-500">
                                        {fieldErrors.clinicImage}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    {/* Clinic Scheduling */}
                    <Box className="space-y-4 p-4 border rounded-lg shadow bg-green-50">
                        <Box className="flex items-center space-x-2">
                            <CalendarToday color="success" />
                            <h3 className="font-semibold text-green-700">Clinic Scheduling</h3>
                        </Box>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-green-600">Opening Days</Typography>
                            <Box className="flex items-center space-x-2">
                                <AccessTime color="success" />
                                <TextField
                                    fullWidth
                                    select
                                    autoComplete='off'
                                    name="openingDays"
                                    value={formData.openingDays}
                                    onChange={(e) => handleFormDataChange(e)}
                                    label="Select Opening Days"
                                    variant="outlined"
                                    margin="dense"
                                    error={Boolean(fieldErrors.openingDays)}
                                    helperText={fieldErrors.openingDays ? fieldErrors.openingDays : ""}
                                >
                                    {preferredOpeningDays.map((day) => (
                                        <MenuItem key={day} value={day}>{day}</MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </Box>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-green-600">Closing Days</Typography>
                            <Box className="flex items-center space-x-2">
                                <AccessAlarm color="success" />
                                <TextField
                                    fullWidth
                                    select
                                    autoComplete='off'
                                    name="closingDays"
                                    value={formData.closingDays}
                                    onChange={(e) => handleFormDataChange(e)}
                                    label="Select Closing Days"
                                    variant="outlined"
                                    margin="dense"
                                    error={Boolean(fieldErrors.closingDays)}
                                    helperText={fieldErrors.closingDays ? fieldErrors.closingDays : ""}
                                >
                                    {preferredOpeningDays.map((day) => (
                                        <MenuItem key={day} value={day}>{day}</MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </Box>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-green-600">Opening Hours</Typography>
                            <Box className="flex items-center space-x-2" >
                                <AccessTime color="success" />
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['TimePicker']} className="w-full">
                                        <TimePicker
                                            ampm
                                            label="Select Opening Hours"
                                            value={formData.openingHours ? dayjs(formData.openingHours, "hh:mm A") : null}
                                            name="openingHours"
                                            className='w-screen'
                                            onChange={(e) => handleFormDataChange(e, "openingHours")}
                                            slotProps={{
                                                textField: {
                                                    margin: "dense",
                                                    autoComplete: "off",
                                                    name: "openingHours",
                                                    error: Boolean(fieldErrors.openingHours),
                                                    helperText: fieldErrors.openingHours || ""
                                                }
                                            }}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Box>
                        </Box>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-green-600">Closing Hours</Typography>
                            <Box className="flex items-center space-x-2">
                                <AccessAlarm color="success" />
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['TimePicker']}>
                                        <TimePicker
                                            className='w-screen'
                                            label="Select Closing Hours"
                                            value={formData.closingHours ? dayjs(formData.closingHours, "hh:mm A") : null}
                                            name="closingHours"
                                            onChange={(e) => handleFormDataChange(e, "closingHours")}
                                            slotProps={{
                                                textField: {
                                                    autoComplete: "off",
                                                    margin: "dense",
                                                    name: "closingHours",
                                                    error: Boolean(fieldErrors.closingHours),
                                                    helperText: fieldErrors.closingHours || ""
                                                }
                                            }}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Box>
                        </Box>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-green-600">Consultation Fee</Typography>
                            <Box className="flex items-center space-x-2">
                                <AttachMoney color="success" />
                                <TextField
                                    fullWidth
                                    label="Enter Consultation Fee"
                                    variant="outlined"
                                    margin="dense"
                                    type="number"
                                    name="consultationFee"
                                    value={formData.consultationFee}
                                    select
                                    onChange={(e) => handleFormDataChange(e)}
                                    error={Boolean(fieldErrors.consultationFee)}
                                    helperText={fieldErrors.consultationFee ? fieldErrors.consultationFee : ""}
                                >
                                    {consultationFee.map((fee) => (
                                        <MenuItem key={fee} value={fee}>{fee}</MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </Box>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-green-600">Clinic Type</Typography>
                            <Box className="flex items-center space-x-2">
                                <Business color="success" />
                                <TextField
                                    fullWidth
                                    select
                                    autoCapitalize="off"
                                    name="clinicType"
                                    value={formData.clinicType}
                                    onChange={(e) => handleFormDataChange(e)}
                                    label="Enter Clinic Type"
                                    variant="outlined"
                                    margin="dense"
                                    error={Boolean(fieldErrors.clinicType)}
                                    helperText={fieldErrors.clinicType ? fieldErrors.clinicType : ""}
                                >
                                    {clinicTypes.map((type) => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </Box>
                    </Box>

                    {/* Clinic Authentication */}
                    <Box className="space-y-4 p-4 border rounded-lg shadow bg-purple-50">
                        <h3 className="font-semibold text-purple-700">Clinic Authentication</h3>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-purple-600">ID (optional)</Typography>
                            <Box className="flex items-center space-x-2">
                                <Person color="secondary" />
                                <TextField
                                    fullWidth
                                    label="Enter ID"
                                    name="clinicId"
                                    autoCapitalize='off'
                                    margin="dense"
                                    onChange={(e) => handleFormDataChange(e)}
                                    type="number"
                                    placeholder="Enter Clinic ID"
                                    value={formData.clinicId}
                                    variant="outlined"
                                    error={Boolean(fieldErrors.clinicId)}
                                    helperText={fieldErrors.clinicId ? fieldErrors.clinicId : ""}
                                />
                            </Box>
                        </Box>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-purple-600">Password</Typography>
                            <Box className="flex items-center space-x-2">
                                <Lock color="secondary" />
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    placeholder="Enter Password"
                                    name="password"
                                    autoComplete='off'
                                    value={formData.password}
                                    variant="outlined"
                                    type={showPassword ? 'text' : 'password'}
                                    label={"Enter Password"}
                                    onChange={(e) => handleFormDataChange(e)}
                                    error={Boolean(fieldErrors.password)}
                                    helperText={fieldErrors.password ? fieldErrors.password : ""}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleTogglePassword} edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        </Box>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-purple-600">Confirm Password</Typography>
                            <Box className="flex items-center space-x-2">
                                <Lock color="secondary" />
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    autoComplete='off'
                                    placeholder="Enter Confirm Password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleFormDataChange(e)}
                                    variant="outlined"
                                    type={confirmShowPassword ? 'text' : 'password'}
                                    label="Enter Password"
                                    error={Boolean(fieldErrors.confirmPassword)}
                                    helperText={fieldErrors.confirmPassword ? fieldErrors.confirmPassword : ""}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleToggleConfirmPassword} edge="end">
                                                    {confirmShowPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>

                {/* Action Buttons */}
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                    >
                        Register Clinic
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

ClinicRegistrationModal.propTypes = {
    open: Proptypes.bool.isRequired,
    fieldErrors: Proptypes.object.isRequired,
    setFieldErrors: Proptypes.func.isRequired,
    onClose: Proptypes.func.isRequired,
    formData: Proptypes.object.isRequired,
    setFormData: Proptypes.func.isRequired,
}
export default ClinicRegistrationModal;
