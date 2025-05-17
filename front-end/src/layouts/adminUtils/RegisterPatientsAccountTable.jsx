import {
    Card,
    CardHeader,
    CardContent,
    Table,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
    useCallback,
    useEffect,
    useState
} from "react"
import CMS from "../../API/CMS.jsx";
import PatientsAccountsTableValue from "./PatientsAccountsTableValue.jsx";
import dayjs from "dayjs";
import DeleteConfirmationDialog from "../../utils/DeleteConfirmation.jsx";
import {
    useNavigate
} from "react-router-dom"

const RegisterPatientsAccountTable = () => {
    const registerPatientColums = [
        "First Name",
        "Last Name",
        "Email",
        "Address",
        "Gender",
        "Civil Status",
        "Date of Birth",
        "Phone Number",
        "Status",
        "Edit",
        "Delete"
    ]

    const civilStatus = ["Single", "Married", "Divorced", "Widowed"];

    const status = ["Approved", "Declined", "Pending"];

    const [patientsAccountData, setPatientsAccountData] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const navigate = useNavigate();

    const navigateToPatientsRegisterAccounts =  async () => {
        retrievedPatientsAccountData()
        navigate("/admin-dashboard/RegisterPatientsAccount")
    }

    // function to open the dialog of modify patient registered account
    const handleOpenModal = (patient) => {
        setSelectedPatient(patient);
        setOpenModal(true);
    }

    // function  to close the dialog of updating patient registered account
    const handleCloseModal = useCallback(() => {
        setSelectedPatient(null);
        setOpenModal(false);
        retrievedPatientsAccountData();
    }, [])

    // function to close the dialog box of delete patient registered account
    const handleDeleteConfirmRegisteredPatientAccount = async () => {
        setSelectedPatient(null)
        setOpenDeleteDialog(false);
        navigateToPatientsRegisterAccounts()
    }

    // function to open the dialog box of confirmed delete patient registered account
    const handleDeletePatientAccountDialog = async (patient) => {
        setSelectedPatient(patient)
        setOpenDeleteDialog(true);
    }
    
    const handleChange = useCallback(async (e, field) => {
        if (e && e.target) {
            const { name, value } = e.target;
            setSelectedPatient((prev) => ({
                ...prev,
                [name]: value
            }));
        } else if (field) {
            setSelectedPatient((prev) => ({
                ...prev,
                [field]: dayjs(e)
            }));
        }
    }, [])


    // function to update the patient registered accounts
    const handleUpdate = useCallback(async () => {
        try {
            const response = await CMS.put(`/CMS/admin-dashboard/updateRegisteredPatientAccount/${selectedPatient.patientID}`, selectedPatient, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization":`Bearer ${localStorage.getItem("authToken")}`
                },
            });

            if (response.status === 200) {
                setPatientsAccountData(
                    (prev) => prev.map((patient) => patient.patientID === selectedPatient.patientID ? selectedPatient : patient)
                );
                alert("Patient account updated successfully");
                handleCloseModal();
            } else {
                console.error(`Failed to update patient account: ${response.status}`);
            }
        } catch (error) {
            console.error("Error updating patient account:", error);
        }
    }, [selectedPatient, handleCloseModal]);

    // arrow function to retrieved the registered patients accounts
    const retrievedPatientsAccountData = async () => {
        try {
            const response = await CMS.get("/CMS/admin-dashboard/registeredPatientAccount", {
                headers: {
                    "Content-Type":"application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            })

            if (!response.data) {
                throw new Error("No response for registered patients account data");
            }

            if (response.status === 200) {
                setPatientsAccountData(response.data.registeredPatientsAccount);
            } else {
                console.error(`Failed to retrieve patients account data: ${response.status}`);
            }
        } catch (error) {
            console.error("Error retrieving patients account data:", error);
        }
    }

    useEffect(() => {
        retrievedPatientsAccountData()
    }, [])

    // function to handle the deletion of patient registerd account
    const handleConfirmDeletePatientRegisteredAccount = async () => {
        try {
            const response = await CMS.delete(`CMS/admin-dashboard/deleteRegisteredPatientAccount/${selectedPatient.patientID}`, {
                headers: {
                    "Content-Type":"application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            })

            if(response.status === 200){
                setPatientsAccountData((prev) => (
                    prev.filter((patient) => patient.patientID === selectedPatient.patientID)
                ))
                handleDeleteConfirmRegisteredPatientAccount()
            }
        } catch (error){
            console.error(`Error in deleting the patient register account component: ${error}`)
        }
    } 

    return (
        <div className="mt-12 mb-1 flex justify-center items-center w-full">
            <Card className="shadow-lg rounded-2xl w-full">
                <CardHeader
                    title="Registered Patients Account"
                    className="bg-blue-500 mb-2 p-6"
                    slotProps={{
                        title: {
                            variant: 'h6',
                            className: 'text-white text-center',
                        },
                    }}
                />
                <CardContent className="overflow-x-scroll pt-0 pb-2 rounded-xl shadow-sm bg-white">
                    <Table className="w-full min-w-[640px] table-auto">
                        <TableHead className="bg-gray-100 text-sm sm:text-base text-gray-600 uppercase">
                            <TableRow>
                                {registerPatientColums.map((header, i) => (
                                    <TableCell
                                        key={i}
                                        className="border-b border-blue-gray-50 text-center py-3 px-5"
                                        align="center"
                                    >
                                        <Typography
                                            variant="body2"
                                            className="text-[11px] font-bold uppercase text-blue-gray-400"
                                        >
                                            {header}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <PatientsAccountsTableValue
                            patientsAccountData={patientsAccountData}
                            registerPatientColums={registerPatientColums}
                            updateRegisteredPatientsAccount={handleOpenModal}
                            deleteRegisteredPatientsAccount={handleDeletePatientAccountDialog}
                        />
                    </Table>
                </CardContent>
            </Card>
            
            {/* Component for updating the patient registered account */}
            <Dialog
                open={openModal}
                onClose={handleCloseModal}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle className="text-center text-black">
                    Modify Patient Details Account
                </DialogTitle>
                <DialogContent className="flex flex-col gap-4">
                    {selectedPatient && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <TextField
                                    margin="dense"
                                    name="firstName"
                                    label="First Name"
                                    autoComplete="off"
                                    placeholder="Enter your first name"
                                    value={selectedPatient.firstName}
                                    onChange={handleChange}
                                    fullWidth
                                />
                                <TextField
                                    margin="dense"
                                    name="lastName"
                                    placeholder="Enter your last name"
                                    label="Last Name"
                                    autoComplete="off"
                                    value={selectedPatient.lastName}
                                    onChange={handleChange}
                                    fullWidth
                                />
                                <TextField
                                    margin="dense"
                                    name="email"
                                    placeholder="Enter you email"
                                    label="Email"
                                    autoComplete="off"
                                    value={selectedPatient.email}
                                    onChange={handleChange}
                                    fullWidth
                                />
                                <TextField
                                    name="address"
                                    margin="dense"
                                    autoComplete="off"
                                    placeholder="Enter your address"
                                    label="Address"
                                    value={selectedPatient.address}
                                    onChange={handleChange}
                                    fullWidth
                                />
                                <TextField
                                    name="civilStatus"
                                    label="Select Civil Status"
                                    autoComplete="off"
                                    placeholder="Select Civil Status"
                                    margin="dense"
                                    value={selectedPatient.civilStatus}
                                    onChange={handleChange}
                                    fullWidth
                                    select
                                >
                                    {civilStatus.map((status, i) => (
                                        <MenuItem
                                            key={i}
                                            value={status}
                                        >
                                            {status}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DatePicker']}>
                                        <DatePicker
                                            className="w-full"
                                            margin="dense"
                                            id="date-of-birth"
                                            name="dateOfBirth"
                                            value={selectedPatient.dateOfBirth ? dayjs(selectedPatient.dateOfBirth) : ""}
                                            onChange={() => handleChange(selectedPatient.dateOfBirth, "dateOfBirth")}
                                            label="Date of Birth"
                                            slotProps={{
                                                textField: {
                                                    variant: "outlined",
                                                    placeholder: "Enter your date of birth",
                                                    fullWidth: true,
                                                    autoComplete: "off"
                                                },
                                            }}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                                <TextField
                                    name="phoneNumber"
                                    label="Phone Number"
                                    placeholder="Enter your phone number"
                                    margin="dense"
                                    value={selectedPatient.phoneNumber}
                                    autoComplete="off"
                                    onChange={handleChange}
                                    fullWidth
                                />
                                <TextField
                                    name="status"
                                    label="Select Status"
                                    autoComplete="off"
                                    margin="dense"
                                    placeholder="Select status"
                                    value={selectedPatient.status}
                                    onChange={handleChange}
                                    fullWidth
                                    select
                                >
                                    {status.map((status, i) => (
                                        <MenuItem
                                            key={i}
                                            value={status}
                                        >
                                            {status}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </div>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseModal}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdate}
                        variant="contained"
                    >
                        Modify Patient Account
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Component to open the dialog box of deleting the patient registerd account */}
            <DeleteConfirmationDialog 
                open={openDeleteDialog}
                onClose={handleDeleteConfirmRegisteredPatientAccount}
                users={selectedPatient}
                onConfirm={handleConfirmDeletePatientRegisteredAccount}
            />
        </div>
    );
}

export default RegisterPatientsAccountTable;