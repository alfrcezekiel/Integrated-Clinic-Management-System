import { useState, useCallback, useMemo } from 'react';
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
    // const [formData, setFormData] = useState({
    //     clinicName: "",
    //     clinicAddress: "",
    //     clinicEmail: "",
    //     clinicImage: null,
    //     clinicPhoneNumber: "",
    //     openingDays: "",
    //     closingDays: "",
    //     openingHours: null,
    //     closingHours: null,
    //     consultationFee: "",
    //     clinicType: "",
    //     clinicId: "",
    //     password: "",
    //     confirmPassword: ""
    // })

    const memoizedFieldErrorsValue = useMemo(() => fieldErrors, [fieldErrors]);

    const memoizedFormDataValue = useMemo(() => {
        return (
            formData
        )
    }, [formData]);

    const handleFormDataChange = useCallback((e, field) => {
        if (typeof e === "object" && e !== null && e.target) {
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
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
            setFormData((prev) => ({
                ...prev,
                clinicImage: file,
            }));
        }

        if (memoizedFieldErrorsValue.clinicImage) {
            setFieldErrors((prev) => ({
                ...prev,
                clinicImage: ""
            }));
        }
    }, [memoizedFieldErrorsValue.clinicImage, setFieldErrors, setFormData]);

    const [showPassword, setShowPassword] = useState(false);
    const [confirmShowPassword, setConfirmShowPassword] = useState(false);

    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleToggleConfirmPassword = () => {
        setConfirmShowPassword((prev) => !prev);
    }

    const handleSubmit = useCallback(async (e) => {
        try {
            e.preventDefault();
            const data = new FormData();
            data.append("clinicName", memoizedFormDataValue.clinicName);
            data.append("clinicAddress", memoizedFormDataValue.clinicAddress);
            data.append("clinicEmail", memoizedFormDataValue.clinicEmail);

            if (memoizedFormDataValue.clinicImage) {
                data.append("clinicImage", memoizedFormDataValue.clinicImage);  // Append file if present
            }

            data.append("openingDays", memoizedFormDataValue.openingDays);
            data.append("closingDays", memoizedFormDataValue.closingDays);

            // Convert time values to a string format (if they exist)
            if (memoizedFormDataValue.openingHours) {
                const openingTime = dayjs(memoizedFormDataValue.openingHours).format('hh:mm A');  // Format the time
                data.append('openingHours', openingTime);
            }
            if (memoizedFormDataValue.closingHours) {
                const closingTime = dayjs(memoizedFormDataValue.closingHours).format('hh:mm A');  // Format the time
                data.append('closingHours', closingTime)
            }
            data.append("clinicPhoneNumber", memoizedFormDataValue.clinicPhoneNumber);
            data.append("consultationFee", memoizedFormDataValue.consultationFee);
            data.append("clinicType", memoizedFormDataValue.clinicType);
            data.append("clinicId", memoizedFormDataValue.clinicId);
            data.append("password", memoizedFormDataValue.password);
            data.append("confirmPassword", memoizedFormDataValue.confirmPassword);
            data.append("adminID", localStorage.getItem("sid"))
            const response = await CMS.post("/CMS/admin-dashboard/create-clinic", data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
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
                console.log(`Error in clinic registration: ${error}`)
            }
        }
    }, [memoizedFormDataValue, onClose, setFieldErrors, setFormData]);

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
                                    value={memoizedFormDataValue.clinicName}
                                    onChange={handleFormDataChange}
                                    error={Boolean(memoizedFieldErrorsValue.clinicName)}
                                    helperText={memoizedFieldErrorsValue.clinicName ? memoizedFieldErrorsValue.clinicName : ""}
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
                                    value={memoizedFormDataValue.clinicAddress}
                                    label="Enter Clinic Address"
                                    variant="outlined"
                                    onChange={handleFormDataChange}
                                    error={Boolean(memoizedFieldErrorsValue.clinicAddress)}
                                    helperText={memoizedFieldErrorsValue.clinicAddress ? memoizedFieldErrorsValue.clinicAddress : ""}
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
                                    value={memoizedFormDataValue.clinicPhoneNumber}
                                    label="Enter Clinic Phone Number"
                                    variant="outlined"
                                    onChange={handleFormDataChange}
                                    error={Boolean(memoizedFieldErrorsValue.clinicPhoneNumber)}
                                    helperText={memoizedFieldErrorsValue.clinicPhoneNumber ? memoizedFieldErrorsValue.clinicPhoneNumber : ""}
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
                                    value={memoizedFormDataValue.clinicEmail}
                                    error={Boolean(memoizedFieldErrorsValue.clinicEmail)}
                                    helperText={memoizedFieldErrorsValue.clinicEmail ? memoizedFieldErrorsValue.clinicEmail : ""}
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
                                        onChange={handleFileChange}
                                        name="clinicImage"
                                    />
                                </Button>
                                <Typography variant="body2" className="text-blue-500">
                                    {fileName}
                                </Typography>
                                {memoizedFieldErrorsValue.clinicImage && (
                                    <Typography variant="body2" className="text-red-500">
                                        {memoizedFieldErrorsValue.clinicImage}
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
                                    value={memoizedFormDataValue.openingDays}
                                    onChange={handleFormDataChange}
                                    label="Select Opening Days"
                                    variant="outlined"
                                    margin="dense"
                                    error={Boolean(memoizedFieldErrorsValue.openingDays)}
                                    helperText={memoizedFieldErrorsValue.openingDays ? memoizedFieldErrorsValue.openingDays : ""}
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
                                    value={memoizedFormDataValue.closingDays}
                                    onChange={handleFormDataChange}
                                    label="Select Closing Days"
                                    variant="outlined"
                                    margin="dense"
                                    error={Boolean(memoizedFieldErrorsValue.closingDays)}
                                    helperText={memoizedFieldErrorsValue.closingDays ? memoizedFieldErrorsValue.closingDays : ""}
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
                                            label="Select Opening Hours"
                                            value={memoizedFormDataValue.openingHours}
                                            name="openingHours"
                                            className='w-screen'
                                            ampm
                                            onChange={(value) => handleFormDataChange(value, "openingHours")}
                                            renderinput={(params) =>
                                                <TextField
                                                    fullWidth
                                                    margin="dense"
                                                    error={Boolean(memoizedFieldErrorsValue.openingHours)}
                                                    helperText={memoizedFieldErrorsValue.openingHours ? memoizedFieldErrorsValue.openingHours : ""}
                                                    {...params}
                                                />
                                            }
                                            slotProps={{
                                                textField: {
                                                    margin: "dense",
                                                    name: "openingHours",
                                                    error: Boolean(memoizedFieldErrorsValue.openingHours),
                                                    helperText: memoizedFieldErrorsValue.openingHours ? memoizedFieldErrorsValue.openingHours : ""
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
                                            value={memoizedFormDataValue.closingHours}
                                            name="closingHours"
                                            ampm
                                            onChange={(value) => handleFormDataChange(value, "closingHours")}
                                            renderinput={(params) =>
                                                <TextField
                                                    fullWidth
                                                    margin="dense"
                                                    {...params}
                                                />
                                            }
                                            slotProps={{
                                                textField: {
                                                    margin: "dense",
                                                    name: "closingHours",
                                                    error: Boolean(memoizedFieldErrorsValue.closingHours),
                                                    helperText: memoizedFieldErrorsValue.closingHours ? memoizedFieldErrorsValue.closingHours : ""
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
                                    value={memoizedFormDataValue.consultationFee}
                                    select
                                    onChange={handleFormDataChange}
                                    error={Boolean(memoizedFieldErrorsValue.consultationFee)}
                                    helperText={memoizedFieldErrorsValue.consultationFee ? memoizedFieldErrorsValue.consultationFee : ""}
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
                                    value={memoizedFormDataValue.clinicType}
                                    onChange={handleFormDataChange}
                                    label="Enter Clinic Type"
                                    variant="outlined"
                                    margin="dense"
                                    error={Boolean(memoizedFieldErrorsValue.clinicType)}
                                    helperText={memoizedFieldErrorsValue.clinicType ? memoizedFieldErrorsValue.clinicType : ""}
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
                                    onChange={handleFormDataChange}
                                    margin="dense"
                                    type="number"
                                    placeholder="Enter Clinic ID"
                                    value={memoizedFormDataValue.clinicId}
                                    variant="outlined"
                                    error={Boolean(memoizedFieldErrorsValue.clinicId)}
                                    helperText={memoizedFieldErrorsValue.clinicId ? memoizedFieldErrorsValue.clinicId : ""}
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
                                    value={memoizedFormDataValue.password}
                                    variant="outlined"
                                    type={showPassword ? 'text' : 'password'}
                                    label={"Enter Password"}
                                    onChange={handleFormDataChange}
                                    error={Boolean(memoizedFieldErrorsValue.password)}
                                    helperText={memoizedFieldErrorsValue.password ? memoizedFieldErrorsValue.password : ""}
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
                                    value={memoizedFormDataValue.confirmPassword}
                                    onChange={handleFormDataChange}
                                    variant="outlined"
                                    type={confirmShowPassword ? 'text' : 'password'}
                                    label="Enter Password"
                                    error={Boolean(memoizedFieldErrorsValue.confirmPassword)}
                                    helperText={memoizedFieldErrorsValue.confirmPassword ? memoizedFieldErrorsValue.confirmPassword : ""}
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
