import {
    Button,
    Typography,
    Container,
    Box,
    Grid,
    CircularProgress,
    Paper,
    Divider,
    Fade,
    Alert,
    IconButton,
    Tooltip,
    useTheme
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useState, useEffect } from "react";
import ClinicRegistrationModal from "./AddClinicModal";
import CMS from "../../API/CMS";
import ClinicCard from "./ClinicCards";

const AddClinic = () => {
    const theme = useTheme();
    const [clinics, setClinics] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [setFieldErrors] = useState({});
    
    // Fetch clinics from API
    const fetchClinics = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await CMS.get('/CMS/admin-dashboard/clinics');

            if (response.status === 200) {
                setClinics(response.data.clinics);
            }
        } catch (err) {
            console.error('Error fetching clinics:', err);
            setError('Failed to load clinics. Please try again later.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Load clinics on component mount
    useEffect(() => {
        fetchClinics();
    }, []);

    // Handle modal open/close
    const handleOpenModal = () => {
        setIsModalOpen(true);
    }
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFieldErrors({}); // Clear field errors when modal closes
        // Refresh the clinics list after modal closes
        fetchClinics();
    };

    // Handle manual refresh
    const handleRefresh = () => {
        setRefreshing(true);
        fetchClinics();
    };

    // Function to handle view details
    const handleViewDetails = (clinic) => {
        // Implement view details functionality
        console.log("View details for clinic:", clinic);
    };

    // Function to handle edit clinic
    const handleEditClinic = (clinic) => {
        // Implement edit clinic functionality
        console.log("Edit clinic:", clinic);
    };

    // Group clinics by type for better organization
    const getClinicTypes = () => {
        return [...new Set(clinics.map(clinic => clinic.clinic_type))];
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header Section */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 2,
                    background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                    color: 'white'
                }}
            >
                <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <Box className="flex items-center">
                        <LocalHospitalIcon sx={{ fontSize: 36, mr: 2 }} />
                        <Box>
                            <Typography variant="h4" component="h1" className="font-bold">
                                Registered Clinics
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mt: 0.5, opacity: 0.9 }}>
                                Manage your healthcare network
                            </Typography>
                        </Box>
                    </Box>
                    <Box className="flex gap-2 self-end md:self-auto">
                        <Tooltip title="Refresh clinic list">
                            <IconButton
                                color="inherit"
                                onClick={handleRefresh}
                                disabled={refreshing}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                                }}
                            >
                                {refreshing ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<AddIcon />}
                            onClick={handleOpenModal}
                            sx={{
                                bgcolor: 'white',
                                color: theme.palette.primary.main,
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.9)'
                                },
                                fontWeight: 'bold'
                            }}
                        >
                            Add New Clinic
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Stats Summary (optional) */}
            {clinics.length > 0 && (
                <Box className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f9ff' }}>
                        <Typography variant="h6" color="primary" className="font-bold">
                            Total Clinics
                        </Typography>
                        <Typography variant="h3" className="mt-2">{clinics.length}</Typography>
                    </Paper>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#f7f7ff' }}>
                        <Typography variant="h6" color="secondary" className="font-bold">
                            Clinic Types
                        </Typography>
                        <Typography variant="h3" className="mt-2">
                            {getClinicTypes().length}
                        </Typography>
                    </Paper>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fff5' }}>
                        <Typography variant="h6" style={{ color: '#4caf50' }} className="font-bold">
                            Latest Addition
                        </Typography>
                        <Typography variant="body1" className="mt-2 font-medium">
                            {clinics.length > 0 ? clinics[clinics.length - 1].clinic_name : 'N/A'}
                        </Typography>
                    </Paper>
                </Box>
            )}

            {/* Main Content */}
            {loading ? (
                <Box className="flex flex-col items-center justify-center py-12">
                    <CircularProgress size={60} />
                    <Typography variant="h6" className="mt-4">Loading clinics</Typography>
                </Box>
            ) : error ? (
                <Fade in={true}>
                    <Alert
                        severity="error"
                        sx={{ mb: 4, borderRadius: 2 }}
                        action={
                            <Button color="inherit" size="small" onClick={fetchClinics}>
                                Retry
                            </Button>
                        }
                    >
                        {error}
                    </Alert>
                </Fade>
            ) : clinics.length === 0 ? (
                <Fade in={true}>
                    <Paper className="text-center py-12 rounded-lg" elevation={0} sx={{ bgcolor: '#f8fafc', border: '1px dashed #ccc' }}>
                        <MedicalServicesIcon sx={{ fontSize: 60, color: '#9e9e9e', mb: 2 }} />
                        <Typography variant="h5" className="mb-5 font-medium">No clinics registered yet</Typography>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<AddIcon />}
                            onClick={handleOpenModal}
                            className="mt-2"
                        >
                            Register Your First Clinic
                        </Button>
                    </Paper>
                </Fade>
            ) : (
                <Fade in={true}>
                    <Box>
                        {getClinicTypes().map(clinicType => (
                            <Box key={clinicType} sx={{ mb: 5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" className="font-semibold">{clinicType}</Typography>
                                    <Divider sx={{ flexGrow: 1, ml: 2 }} />
                                </Box>

                                <Grid container spacing={3}>
                                    {clinics
                                        .filter(clinic => clinic.clinic_type === clinicType)
                                        .map((clinic) => (
                                            <Grid item xs={12} sm={6} md={4} key={clinic.clinic_id || clinic.email}>
                                                <Fade in={true} timeout={500}>
                                                    <Box>
                                                        <ClinicCard
                                                            clinic={clinic}
                                                            onViewDetails={handleViewDetails}
                                                            onEditClinic={handleEditClinic}
                                                        />
                                                    </Box>
                                                </Fade>
                                            </Grid>
                                        ))}
                                </Grid>
                            </Box>
                        ))}
                    </Box>
                </Fade>
            )}

            {/* Registration Modal */}
            <ClinicRegistrationModal
                open={isModalOpen}
                onClose={handleCloseModal}
            />
        </Container>
    );
};

export default AddClinic;