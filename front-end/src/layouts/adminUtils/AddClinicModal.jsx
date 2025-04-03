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
    VisibilityOff
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

const ClinicRegistrationModal = ({ open, onClose, }) => {
    const [fileName, setFileName] = useState('');
    const [formData, setFormData] = useState({
        clinicName: "",
        clinicAddress: "",
        clinicEmail: "",
        clinicImage: null,
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
    }, []);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
            setFormData((prev) => ({
                ...prev,
                clinicImage: file,
            }));
        }
    };
    const [showPassword, setShowPassword] = useState(false);
    const [confirmShowPassword, setConfirmShowPassword] = useState(false);

    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleToggleConfirmPassword = () => {
        setConfirmShowPassword((prev) => !prev);
    }

    const preferredOpeningDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday - Friday", "Saturday - Sunday"];
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

            <form>
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
                                {fileName && (
                                    <Typography variant="body2" className="text-blue-500">
                                        {fileName}
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
                            >
                                {preferredOpeningDays.map((day) => (
                                    <MenuItem key={day} value={day}>{day}</MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-green-600">Closing Days</Typography>
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
                            >
                                {preferredOpeningDays.map((day) => (
                                    <MenuItem key={day} value={day}>{day}</MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-green-600">Opening Hours</Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['TimePicker']}>
                                    <TimePicker
                                        label="Select Opening Hours"
                                        value={memoizedFormDataValue.openingHours}
                                        name="openingHours"
                                        className='w-full'
                                        onChange={(value) => handleFormDataChange(value, "openingHours")}
                                        renderinput={(params) =>
                                            <TextField
                                                fullWidth
                                                margin="dense"
                                                {...params}
                                            />
                                        }
                                    />
                                </DemoContainer>
                            </LocalizationProvider>
                        </Box>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-green-600">Closing Hours</Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['TimePicker']}>
                                    <TimePicker
                                        label="Select Closing Hours"
                                        value={memoizedFormDataValue.closingHours}
                                        name="closingHours"
                                        className='w-full'
                                        onChange={(value) => handleFormDataChange(value, "closingHours")}
                                        renderinput={(params) =>
                                            <TextField
                                                fullWidth
                                                margin="dense"
                                                {...params}
                                            />
                                        }
                                    />
                                </DemoContainer>
                            </LocalizationProvider>
                        </Box>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-green-600">Consultation Fee</Typography>
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
                            >
                                {consultationFee.map((fee) => (
                                    <MenuItem key={fee} value={fee}>{fee}</MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        <Box className="space-y-2">
                            <Typography variant="subtitle2" className="text-green-600">Clinic Type</Typography>
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
                            >
                                {clinicTypes.map((type) => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </TextField>
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
                                    label={"Enter Password"}
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
                    <Button onClick={onClose} variant="outlined">Cancel</Button>
                    <Button variant="contained" color="primary">Register Clinic</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

ClinicRegistrationModal.propTypes = {
    open: Proptypes.bool.isRequired,
    openingHours: Proptypes.object.isRequired,
    setOpeningHours: Proptypes.func.isRequired,
    closingHours: Proptypes.object.isRequired,
    setClosingHours: Proptypes.func.isRequired,
    onClose: Proptypes.func.isRequired
}
export default ClinicRegistrationModal;
