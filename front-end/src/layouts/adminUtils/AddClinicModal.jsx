import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import PropTypes from 'prop-types';
import CMS from "../../API/CMS";

const ClinicRegistrationModal = ({ open, onClose }) => {
    const [formData, setFormData] = useState({
        clinicName: '',
        email: '',
        password: '',
        confirmPassword: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        clinicType: ''
    });

    const [errors, setErrors] = useState({});

    const clinicTypes = [
        "General Practice",
        "Dental Clinic",
        "Pediatric",
        "Orthopedic",
        "Dermatology",
        "Ophthalmology",
        "Mental Health",
        "Physical Therapy",
        "Urgent Care",
        "Specialty Clinic"
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error when field is edited
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await CMS.post('/CMS/admin-dashboard/create-clinic', formData);
            if (response.status === 200) {
                alert("Clinic registered successfully");
                setFormData({})
                onClose();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            classes={{ paper: 'rounded-lg' }}
        >
            <DialogTitle className="bg-blue-600 text-white py-4 font-bold text-center text-xl">
                Register Your Clinic
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent className="p-6">
                    <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextField
                            label="Clinic Name"
                            name="clinicName"
                            value={formData.clinicName}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            error={!!errors.clinicName}
                            helperText={errors.clinicName}
                            className="col-span-2"
                        />

                        <TextField
                            label="Address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            error={!!errors.address}
                            helperText={errors.address}
                            className="col-span-2"
                        />

                        <TextField
                            label="Email"
                            name="email"
                            type="text"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            error={!!errors.email}
                            helperText={errors.email}
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="clinic-type-label">Clinic Type</InputLabel>
                            <Select
                                labelId="clinic-type-label"
                                name="clinicType"
                                value={formData.clinicType}
                                onChange={handleChange}
                                error={!!errors.clinicType}
                            >
                                {clinicTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.clinicType && (
                                <p className="text-red-500 text-xs mt-1">{errors.clinicType}</p>
                            )}
                        </FormControl>

                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            error={!!errors.password}
                            helperText={errors.password}
                        />

                        <TextField
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword}
                        />
                    </Box>
                </DialogContent>

                <DialogActions className="p-4 bg-gray-50">
                    <Button
                        onClick={onClose}
                        className="text-gray-600 hover:bg-gray-100"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Register Clinic
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

ClinicRegistrationModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
}
export default ClinicRegistrationModal;