import { Card, CardContent, CardHeader, Typography, Chip, Box, Avatar, Button, IconButton, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PhoneIcon from '@mui/icons-material/Phone';

const ClinicCard = ({ clinic, onViewDetails, onEditClinic }) => {
    const firstLetter = clinic.clinicName ? clinic.clinicName.charAt(0).toUpperCase() : 'C';

    const getClinicTypeColor = (type) => {
        const colors = {
            "General Practice": "#4caf50",
            "Dental Clinic": "#2196f3",
            "Pediatric": "#ff9800",
            "Orthopedic": "#9c27b0",
            "Dermatology": "#e91e63",
            "Ophthalmology": "#00bcd4",
            "Mental Health": "#8bc34a",
            "Physical Therapy": "#ff5722",
            "Urgent Care": "#f44336",
            "Specialty Clinic": "#673ab7"
        };
        return colors[type] || "#757575";
    };

    const formatAddress = () => {
        return clinic.address ? clinic.address : 'No address provided';
    };

    return (
        <Card
            elevation={4}
            className="h-full transition-all duration-300 hover:shadow-2xl rounded-xl overflow-hidden border border-gray-200"
            sx={{
                position: 'relative',
                '&:hover': {
                    transform: 'translateY(-5px)',
                }
            }}
        >
            {/* Gradient top bar */}
            <Box
                sx={{
                    height: '6px',
                    width: '100%',
                    background: `linear-gradient(90deg, ${getClinicTypeColor(clinic.clinicType)} 30%, #ffffff 100%)`,
                }}
            />

            <CardHeader
                avatar={
                    <Avatar
                        sx={{
                            bgcolor: getClinicTypeColor(clinic.clinicType),
                            boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
                            width: 50,
                            height: 50,
                            fontSize: '1.3rem',
                        }}
                    >
                        {firstLetter}
                    </Avatar>
                }
                title={
                    <Typography
                        variant="h6"
                        className="font-bold text-gray-800"
                        sx={{ fontSize: '1.2rem' }}
                    >
                        {clinic.clinicName}
                    </Typography>
                }
                subheader={
                    <Chip
                        icon={<MedicalServicesIcon sx={{ fontSize: '1rem' }} />}
                        label={clinic.clinicType}
                        size="small"
                        sx={{
                            backgroundColor: getClinicTypeColor(clinic.clinicType),
                            color: 'white',
                            fontWeight: 'bold',
                            mt: 1,
                        }}
                    />
                }
                action={
                    <Tooltip title="Edit Clinic">
                        <IconButton
                            size="small"
                            onClick={() => onEditClinic(clinic)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <SettingsIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                }
                className="pb-1"
            />

            <CardContent sx={{ pt: 0 }}>
                <Box className="flex flex-col space-y-2 mb-4">
                    <Box className="flex items-start">
                        <LocationOnIcon className="text-gray-500 mr-2 mt-1" fontSize="small" />
                        <Typography variant="body2" className="text-gray-600">
                            {formatAddress()}
                        </Typography>
                    </Box>

                    <Box className="flex items-center">
                        <EmailIcon className="text-gray-500 mr-2" fontSize="small" />
                        <Typography variant="body2" className="text-gray-600">
                            {clinic.email}
                        </Typography>
                    </Box>

                    {clinic.phone && (
                        <Box className="flex items-center">
                            <PhoneIcon className="text-gray-500 mr-2" fontSize="small" />
                            <Typography variant="body2" className="text-gray-600">
                                {clinic.phone}
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Box className="flex justify-between items-center mt-4">
                    <Typography variant="caption" className="italic text-gray-400">
                        ID: {clinic.id?.substring(0, 8) || 'Pending'}
                    </Typography>

                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<InfoOutlinedIcon />}
                        onClick={() => onViewDetails && onViewDetails(clinic)}
                        sx={{
                            backgroundColor: getClinicTypeColor(clinic.clinicType),
                            color: 'white',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: `${getClinicTypeColor(clinic.clinicType)}cc`,
                            }
                        }}
                    >
                        Details
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

ClinicCard.propTypes = {
    clinic: PropTypes.shape({
        id: PropTypes.string,
        clinicName: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        phone: PropTypes.string,
        address: PropTypes.string,
        clinicType: PropTypes.oneOf([
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
        ]).isRequired
    }).isRequired,
    onViewDetails: PropTypes.func.isRequired,
    onEditClinic: PropTypes.func.isRequired
};

export default ClinicCard;
