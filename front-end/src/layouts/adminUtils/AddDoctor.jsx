import { useState, useEffect } from "react";
import "../../assets/css/main.css";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Card,
    CardHeader,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    InputAdornment,
    IconButton,
    FormHelperText,
} from "@mui/material";
import { Visibility, VisibilityOff, Edit, Delete } from "@mui/icons-material";
import CMS from "../../API/CMS";
import { useNavigate, useLocation } from "react-router-dom";

const AddDoctor = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        medicalSpecialties: "",
        yearsOfExperience: "",
        consultationFee: "",
        gender: "",
        password: "",
    });
    const [fieldErrors, setFieldErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        medicalSpecialties: "",
        yearsOfExperience: "",
        consultationFee: "",
        gender: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [doctorsList, setDoctorsList] = useState([]); // State to store submitted doctors
    const medicalSpecialtiesList = [
        "Cardiology",
        "Dermatology",
        "Endocrinology",
        "Gastroenterology",
        "General Practice",
        "Hematology",
        "Infectious Disease",
        "Neurology",
        "Obstetrics and Gynecology",
        "Oncology",
        "Ophthalmology",
        "Orthopedics",
        "Pediatrics",
        "Psychiatry",
        "Pulmonology",
        "Radiology",
        "Trauma Surgeon",
        "Rheumatology",
        "Urology",
    ];
    const navigate = useNavigate();
    const location = useLocation();
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    useEffect(() => {
        const retrieveListsOfDoctors = async () => {
            try {
                const response = await CMS.get("/CMS/admin-dashboard/listOfDoctors", {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.data) {
                    throw new Error("No list of doctors data returned");
                }

                if (response.status === 200) {
                    setDoctorsList(response.data.doctors);
                }
            } catch (error) {
                console.error(`Error in retrieving list of doctors: ${error}`);
            }
        }
        retrieveListsOfDoctors();
    }, [location.pathname]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await CMS.post(`/CMS/admin-dashboard/addDoctor`, formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.data) {
                throw new Error("No doctor data returned");
            }

            if (response.data && response.status === 200) {
                alert("Doctor added successfully");
                setFieldErrors({}); // Reset field errors
                setIsModalOpen(false); // Close the modal after submission
                setDoctorsList([...doctorsList, formData]); // Update the list of doctors
                setFormData({
                    // Reset form data
                    firstName: "",
                    lastName: "",
                    email: "",
                    medicalSpecialties: "",
                    yearsOfExperience: "",
                    consultationFee: "",
                    gender: "",
                    password: ""
                });
                navigate("/admin-dashboard/add-doctor");
            } 
        } catch (error) {
            if(error.response && error.response.status === 400){
                setFieldErrors(error.response.data.errors);
            } else {
                console.error(`Error in adding doctor in admin dashboard form: ${error}`);
            }
        }
    };

    // Table columns
    const doctorsTableColumns = [
        "First Name",
        "Last Name",
        "Email",
        "Medical Specialties",
        "Years of Experience",
        "Consultation Fee",
        "Gender",
        "Edit",
        "Delete",
    ];

    // Toggle password visibility
    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // function to update the doctors details
    const handleEdit = (doctor) => {
        console.log("Edit doctor:", doctor);
    }

    // function to delete the doctor details
    const handleDelete = (doctor) => {
        console.log("Delete doctor:", doctor);
    }

    return (
        <div className="p-4">
            {/* Button to open the modal */}
            <div className="flex justify-end mb-4">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600"
                >
                    Add Doctor
                </Button>
            </div>

            {/* Modal */}
            <Dialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                slotProps={{
                    paper: {
                        className: "fixed right-0 h-full w-full m-0 rounded-none", // Tailwind classes for positioning
                    }
                }}
            >
                <DialogTitle className="text-xl font-semibold">Add Doctor</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit} autoComplete="off" id="addDoctorForm">
                        <TextField
                            fullWidth
                            margin="normal"
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="mb-4"
                            autoComplete="off"
                            helperText={fieldErrors.firstName}
                            error={Boolean(fieldErrors.firstName)}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            autoComplete="off"
                            helperText={fieldErrors.lastName}
                            error={Boolean(fieldErrors.lastName)}
                            className="mb-4"
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            autoComplete="off"
                            helperText={fieldErrors.email}
                            error={Boolean(fieldErrors.email)}
                            className="mb-4"
                        />
                        <FormControl fullWidth margin="normal" className="mb-4" error={Boolean(fieldErrors.medicalSpecialties)}>
                            <InputLabel>Medical Specialties</InputLabel>
                            <Select
                                name="medicalSpecialties"
                                value={formData.medicalSpecialties}
                                onChange={handleInputChange}
                                required
                            >
                                <MenuItem value="">Select Medical Specialty</MenuItem>
                                {medicalSpecialtiesList.map((specialty, index) => (
                                    <MenuItem key={index} value={specialty}>
                                        {specialty}
                                    </MenuItem>
                                ))}
                            </Select>
                            {fieldErrors.medicalSpecialties && <FormHelperText error>{fieldErrors.medicalSpecialties}</FormHelperText>}
                        </FormControl>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Years of Experience"
                            name="yearsOfExperience"
                            type="number"
                            value={formData.yearsOfExperience}
                            onChange={handleInputChange}
                            required
                            inputProps={{ min: 0, step: 1 }}
                            className="mb-4"
                            autoComplete="off"
                            helperText={fieldErrors.yearsOfExperience}
                            error={Boolean(fieldErrors.yearsOfExperience)}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Consultation Fee"
                            name="consultationFee"
                            type="number"
                            value={formData.consultationFee}
                            onChange={handleInputChange}
                            required
                            inputProps={{ min: 0, step: 0.01 }}
                            autoComplete="off"
                            helperText={fieldErrors.consultationFee}
                            error={Boolean(fieldErrors.consultationFee)}
                            className="mb-4"
                        />
                        <FormControl fullWidth margin="normal" className="mb-4" error={Boolean(fieldErrors.gender)}>
                            <InputLabel>Gender</InputLabel>
                            <Select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                required
                            >
                                <MenuItem value="">Select Gender</MenuItem>
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                            </Select>
                            {fieldErrors.gender && <FormHelperText error>{fieldErrors.gender}</FormHelperText>}
                        </FormControl>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"} // Toggle between text and password
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            autoComplete="off"
                            helperText={fieldErrors.password}
                            error={Boolean(fieldErrors.password)}
                            className="mb-4"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleTogglePasswordVisibility}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <DialogActions className="p-4 flex justify-end gap-2">
                            <Button
                                onClick={() => setIsModalOpen(false)}
                                color="secondary"
                                className="bg-gray-500 hover:bg-gray-600 text-white"
                                variant="contained"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                color="primary"
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                                variant="contained"
                                type="submit"
                            >
                                Add Doctor
                            </Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Table to display submitted doctors */}
            <Card className="shadow-lg rounded-2xl w-full">
                <CardHeader
                    title="List of Doctors"
                    className="bg-blue-500 mb-8 p-6"
                    titleTypographyProps={{
                        variant: "h6",
                        className: "text-white text-center",
                    }}
                />
                <CardContent className="overflow-x-scroll px-0 pt-0 pb-2">
                    <Table className="w-full min-w-[640px] table-auto">
                        <TableHead>
                            <TableRow>
                                {doctorsTableColumns.map((header, i) => (
                                    <TableCell
                                        key={i}
                                        className="border-b border-blue-gray-50 text-center py-3 px-5"
                                        align="center"
                                    >
                                        <Typography
                                            variant="caption"
                                            className="text-[11px] font-bold uppercase text-blue-gray-400"
                                        >
                                            {header}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {doctorsList && doctorsList.length >= 0 ? (
                                doctorsList.map((doctor, id) => (
                                    <TableRow key={id}>
                                        <TableCell align="center">
                                            <Typography variant="body2" className="text-blue-gray-900">
                                                {doctor.firstName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" className="text-blue-gray-900">
                                                {doctor.lastName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" className="text-blue-gray-900">
                                                {doctor.email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" className="text-blue-gray-900">
                                                {doctor.medicalSpecialties}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" className="text-blue-gray-900">
                                                {doctor.yearsOfExperience}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" className="text-blue-gray-900">
                                                {doctor.consultationFee}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" className="text-blue-gray-900">
                                                {doctor.gender}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                onClick={() => handleEdit(doctor)}
                                                color="primary"
                                            >
                                                <Edit />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                onClick={() => handleDelete(doctor)}
                                                color="error"
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow key={0}>
                                    <TableCell colSpan={doctorsTableColumns.length} align="center">
                                        <Typography variant="body2" className="text-blue-gray-900">
                                            No doctors found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddDoctor;