import {
    IconButton,
    Tooltip
} from '@mui/material';
import PropTypes from 'prop-types';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import Business from '@mui/icons-material/Business';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
    useNavigate
} from 'react-router-dom';

const ClinicCard = ({ clinic, onViewDetails, onEditClinic }) => {
    const firstLetter = clinic.clinic_name ? clinic.clinic_name.charAt(0).toUpperCase() : 'C';

    const getClinicTypeColor = (type) => {
        const colors = {
            "General Practice": "bg-green-500",
            "Dental Clinic": "bg-blue-500",
            "Orthopedic Clinic": "bg-purple-500",
            "Dermatology": "bg-pink-500",
            "Ophthalmology": "bg-cyan-500",
            "Mental Health": "bg-lime-500",
            "Physical Therapy": "bg-orange-500",
            "Urgent Care": "bg-red-500",
            "Specialty Clinic": "bg-indigo-500",
            "General Clinic": "bg-gray-500",
            "Specialist Clinic": "bg-blue-700",
            "Dermatology Clinic": "bg-purple-700",
            "Optometry Clinic": "bg-cyan-700",
            "Pediatric Clinic": "bg-yellow-500",
            "Gynecology Clinic": "bg-orange-700",
            "Psychiatry Clinic": "bg-red-700",
            "Physiotherapy Clinic": "bg-lime-700",
        };
        return colors[type] || "bg-gray-400";
    };

    const formatAddress = () => {
        return clinic.clinic_address ? clinic.clinic_address : 'No address provided';
    };

    const formatTimeToAmPm = (time) => {
        if (!time) return "";
        const [hour, minute] = time.split(":");
        const date = new Date();
        date.setHours(+hour);
        date.setMinutes(+minute);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    };
    
    const navigate = useNavigate();

    const navigateToViewcClinic = () => {
        navigate(`/admin-dashboard/ViewClinic`, {
            state: {
                clinic: clinic
            }
        })
    }

    const handleViewDetails = () => {
        onViewDetails(clinic);
        navigateToViewcClinic();
    }

    return (
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-transform transform hover:-translate-y-2">
            <img
                className="w-full h-full object-cover"
                src={`http://localhost:7506/public/uploads/${clinic.clinic_image}`}
                alt="Clinic"
            />

            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div
                            className={`w-12 h-12 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-md ${getClinicTypeColor(
                                clinic.clinic_type
                            )}`}
                        >
                            {firstLetter}
                        </div>
                        <div className="ml-4">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-1">{clinic.clinic_name}</h2>
                            <div
                                className={`inline-flex items-center px-2 py-1 text-xs font-semibold text-white rounded ${getClinicTypeColor(
                                    clinic.clinic_type
                                )}`}
                            >
                                <MedicalServicesIcon className="mr-1 text-sm" />
                                {clinic.clinic_type}
                            </div>
                        </div>
                    </div>
                    <Tooltip title="Edit Clinic">
                        <IconButton
                            size="small"
                            onClick={() => onEditClinic(clinic)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <SettingsIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>

                <div className="mt-4 space-y-3">
                    <div className="flex items-start">
                        <LocationOnIcon className="text-gray-500 mr-2 mt-1" fontSize="small" />
                        <p className="text-sm text-gray-600">{formatAddress()}</p>
                    </div>
                    <div className="flex items-center">
                        <EmailIcon className="text-gray-500 mr-2" fontSize="small" />
                        <p className="text-sm text-gray-600">{clinic.email}</p>
                    </div>
                    {clinic.phoneNumber && (
                        <div className="flex items-center">
                            <PhoneIcon className="text-gray-500 mr-2" fontSize="small" />
                            <p className="text-sm text-gray-600">{clinic.phoneNumber}</p>
                        </div>
                    )}
                    <div className="flex items-center">
                        <Business className="text-gray-500 mr-2" fontSize="small" />
                        <p className="text-sm text-gray-600">
                            {clinic.clinic_date_open ? clinic.clinic_date_open : ''} - {' '}
                            {clinic.clinic_close_date ? clinic.clinic_close_date : ''}
                        </p>
                    </div>
                    <div className="flex items-center">
                        <AccessTimeIcon className="text-gray-500 mr-2" fontSize="small" />
                        <p className="text-sm text-gray-600">
                            {clinic.clinic_time ? formatTimeToAmPm(clinic.clinic_time) : ""}
                            {clinic.clinic_close_time ? ` - ${formatTimeToAmPm(clinic.clinic_close_time)}` : ""}
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <button
                        onClick={handleViewDetails}
                        className={`px-4 py-2 text-sm font-semibold text-white rounded shadow-md transition-transform transform hover:scale-105 ${getClinicTypeColor(
                            clinic.clinic_type
                        )}`}
                    >
                        <InfoOutlinedIcon className="mr-1 text-sm" />
                        View Clinic
                    </button>
                </div>
            </div>
        </div>
    );
};

ClinicCard.propTypes = {
    clinic: PropTypes.shape({
        clinic_name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        phoneNumber: PropTypes.string,
        clinic_address: PropTypes.string,
        clinic_date_open: PropTypes.string,
        clinic_close_date: PropTypes.string,
        clinic_type: PropTypes.oneOf([
            "General Practice",
            "Dental Clinic",
            "Orthopedic Clinic",
            "Dermatology Clinic",
            "Ophthalmology Clinic",
            "Mental Health Clinic",
            "Physical Therapy Clinic",
            "Urgent Care Clinic",
            "Specialty Clinic",
            "General Clinic",
            "Specialist Clinic",
            "Dermatology Clinic",
            "Optometry Clinic",
            "Pediatric Clinic",
            "Gynecology Clinic",
            "Psychiatry Clinic",
            "Physiotherapy Clinic"
        ]).isRequired,
        clinic_image: PropTypes.string,
        clinic_time: PropTypes.string,
        clinic_close_time: PropTypes.string,
    }).isRequired,
    onViewDetails: PropTypes.func.isRequired,
    onEditClinic: PropTypes.func.isRequired
};

export default ClinicCard;
