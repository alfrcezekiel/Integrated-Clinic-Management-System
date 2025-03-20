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
import DeleteConfirmationModal from "./ConfirmDeleteModal";
import UpdatingDoctorDetailsModal from "./UpdatingDoctorDetailsModal";

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
    const [isLoading, setIsLoading] = useState(false);
    const [isEditableText, setIsEditableText] = useState(false)
    const [currentDoctorID, setCurrentDoctorID] = useState("")
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [isUpdatingModalOpen, setIsUpdatingModalOpen] = useState(false);
    const [successUpdatingMessage, setSuccessUpdatingMessage] = useState("");   
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
    
    // function for closing the success modal
    const handleSuccesfulUpdateModalClose = () => {
        setIsUpdatingModalOpen(false);
    }
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

    // function to add a doctor details in a modal form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const endpoint = isEditableText ? `/CMS/admin-dashboard/updateDoctor/${currentDoctorID}` : "/CMS/admin-dashboard/addDoctor";
            const method = isEditableText ? "put" : "post";
            const response = await CMS[method](endpoint, formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.data) {
                throw new Error("No doctor data returned");
            }

            if (response.data && response.status === 200) {
                setSuccessUpdatingMessage(isEditableText ? "Doctor details updated successfully" : "Doctor added successfully");  // Set success message for updating the doctor details
                setIsUpdatingModalOpen(true); // Open the success modal
                if (isEditableText) {
                    setDoctorsList(doctorsList.map((doctor) =>
                        doctor.doctorsID === currentDoctorID ? formData : doctor
                    ));
                } else {
                    setDoctorsList([...doctorsList, formData]); // Update the list of doctors
                }
                // function to refresh the list of doctors
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

                setFieldErrors({}); // Reset field errors
                setIsModalOpen(false); // Close the modal after submission
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
            if (error.response && error.response.status === 400) {
                setFieldErrors(error.response.data.errors);
            } else {
                console.error(`Error in adding doctor in admin dashboard form: ${error}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Table columns for displaying doctors
    const doctorsTableColumns = [
        "ID",
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
        setIsModalOpen(true);
        setIsEditableText(true)
        setCurrentDoctorID(doctor.doctorsID)
        setFormData({
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            email: doctor.email,
            medicalSpecialties: doctor.medicalSpecialties,
            yearsOfExperience: doctor.yearsOfExperience,
            consultationFee: doctor.consultationFee,
            gender: doctor.gender
        })
    }

    // function to delete the doctor details
    const handleDelete = (doctor) => {
        setSelectedDoctor(doctor);
        setOpenDeleteModal(true);
    }

    const handleDeleteModalClose = () => {
        setOpenDeleteModal(false);
    }

    const confirmDelete = async () => {
        try {
            if (!selectedDoctor) {
                alert("No doctor selected for deletion");
                return;
            }

            const response = await CMS.delete(`/CMS/admin-dashboard/deleteDoctor/${selectedDoctor.doctorsID}`, {
                headers: {
                    "Content-Type": "application/json",
                }
            })

            if(!response.data){
                throw new Error("No doctor data returned");
            }

            if(response.status === 200){
                setDoctorsList((prevDoctors) => (
                    prevDoctors.filter((doctor) => doctor.doctorsID !== selectedDoctor.doctorsID)
                ))
                setOpenDeleteModal(false);
                navigate("/admin-dashboard/add-doctor");
            } else {
                console.error("Error in deleting doctor");
            }
        } catch (error) {
            console.error(`Error in deleting doctor: ${error}`);
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFieldErrors({}); // Reset field errors
        setCurrentDoctorID("")
        setIsEditableText(false)
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
    }

    return (
        <div className="p-4 m-1">
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
            >
                <DialogTitle className="text-xl font-semibold">
                    {isEditableText ? "Modify Doctor Details" : "Add Doctor"}
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit} autoComplete="off" id="addDoctorForm">
                        <TextField
                            fullWidth
                            margin="normal"
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
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
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
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
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                                onChange={(e) => setFormData({...formData, medicalSpecialties: e.target.value})}
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
                            onChange={(e) => setFormData({...formData, yearsOfExperience: e.target.value})}
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
                            onChange={(e) => setFormData({...formData, consultationFee: e.target.value})}
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
                                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                required
                            >
                                <MenuItem value="">Select Gender</MenuItem>
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
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
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
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
                                onClick={handleCloseModal}
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
                                disabled={isLoading}
                            >
                                {isEditableText ? "Modify Doctor Details" : "Add Doctor"}
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
                                                {doctor.doctorsID}
                                            </Typography>
                                        </TableCell>
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
                    <DeleteConfirmationModal 
                        open={openDeleteModal}
                        onClose={handleDeleteModalClose}
                        onConfirm={confirmDelete}
                        doctor={selectedDoctor}
                    />
                    {/* Updating Modal component if was successful */}
                    <UpdatingDoctorDetailsModal
                        isOpen={isUpdatingModalOpen}
                        onClose={handleSuccesfulUpdateModalClose}
                        message={successUpdatingMessage}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default AddDoctor;