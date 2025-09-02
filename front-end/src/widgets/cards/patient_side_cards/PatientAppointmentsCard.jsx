import {
    Assignment as PendingIcon,
    CheckCircle as ApprovedIcon,
    Cancel as CancelledIcon,
    Clear as DeclinedIcon,
    Event as AllIcon,
    Person as ConsultedIcon
} from '@mui/icons-material';
import CalculateAllBookedAppointments from '../../../hooks/patients_data_hooks/CalculateAllBookedAppointment';
import CalculatePendingBookedAppointments from '../../../hooks/patients_data_hooks/CalculatePendingBookedAppointments';
import CalculateApprovedBookedAppointments from '../../../hooks/patients_data_hooks/CalculateApprovedBookedAppointment';
import CalculateConsultedPatients from '../../../hooks/patients_data_hooks/CalculateConsultedPatients';
import CalculateCancelledBookedAppointments from '../../../hooks/patients_data_hooks/CalculateCancelledBookedAppointments';
import CalculateDeclinedBookedAppointment from '../../../hooks/patients_data_hooks/CalculateDeclinedBookedAppointment';

/**
 * @function component for patient appointments card
 */
const PatientAppointmentsCard = () => {
    const allBookedAppointments = CalculateAllBookedAppointments();
    const pendingBookedAppointments = CalculatePendingBookedAppointments();
    const approvedBookedAppointments = CalculateApprovedBookedAppointments();
    const consultedPatients = CalculateConsultedPatients();
    const cancelledBookedAppointments = CalculateCancelledBookedAppointments();
    const declinedBookedAppointments = CalculateDeclinedBookedAppointment();

    const patientsData = [
        {
            title: "All Appointments",
            value: allBookedAppointments,
            Icon: AllIcon,
            gradient: 'from-blue-500 to-blue-700',
            iconBg: 'bg-blue-500'
        },
        {
            title: "Pending Booked Appointments",
            value: pendingBookedAppointments,
            Icon: PendingIcon,
            gradient: 'from-orange-400 to-orange-600',
            iconBg: 'bg-orange-400'
        },
        {
            title: "Approved Booked Appointments",
            value: approvedBookedAppointments,
            Icon: ApprovedIcon,
            gradient: 'from-green-500 to-green-700',
            iconBg: 'bg-green-500'
        },
        {
            title: "Declined Booked Appointments",
            value: declinedBookedAppointments,
            Icon: DeclinedIcon,
            gradient: 'from-red-500 to-red-700',
            iconBg: 'bg-red-500'
        },
        {
            title: "Cancelled Booked Appointments",
            value: cancelledBookedAppointments,
            Icon: CancelledIcon,
            gradient: 'from-gray-400 to-gray-600',
            iconBg: 'bg-gray-400'
        },
        {
            title: "Consulted Patients",
            value: consultedPatients,
            Icon: ConsultedIcon,
            gradient: 'from-blue-400 to-blue-800',
            iconBg: 'bg-blue-500'
        }
    ];

    return (
        <div className="py-10 block">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {patientsData.map(({ title, value, Icon, gradient, iconBg }, index) => (
                    <div
                        key={index}
                        className={`rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl bg-gradient-to-r ${gradient}`}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-2xl font-bold text-white">
                                    {value}
                                </div>
                                <div className={`rounded-full w-12 h-12 flex items-center justify-center ${iconBg} text-white`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-white text-lg font-semibold">{title}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PatientAppointmentsCard;
