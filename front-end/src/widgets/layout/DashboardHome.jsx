import PropTypes from 'prop-types';
import PatientsViewAppointmentCalendar from '../../layouts/patients-utils/ViewPatientCalendar/PatientViewApoointmentsCalendar';
import PatientAppointmentsCard from '../cards/patient_side_cards/PatientAppointmentsCard';

function DashboardHome() {
    return (
        <>
            <div className="p-4">
                <div className="p-2 rounded-lg overflow-auto">
                    <PatientAppointmentsCard />
                </div>
                <div className="p-2 rounded-lg shadow-lg overflow-auto">
                    <PatientsViewAppointmentCalendar />
                </div>
            </div>
        </>
    )
}

DashboardHome.propTypes = {
    title: PropTypes.string.isRequired,
    footer: PropTypes.string.isRequired,
}

export default DashboardHome;