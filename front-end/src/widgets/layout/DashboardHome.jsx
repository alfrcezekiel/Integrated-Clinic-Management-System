import PropTypes from 'prop-types';
import statisticsCardsData from "../../data/statistics-cards-data";
import StatisticsCard from "../cards/statistics-card";
import Typography from "@mui/material/Typography";
import PatientsViewAppointmentCalendar from '../../layouts/patients-utils/ViewPatientCalendar/PatientViewApoointmentsCalendar';
function DashboardHome() {
    return (
        <>
            <div className="mt-12 p-2">
                <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
                    {statisticsCardsData.map(({ icon: Icon, title, footer, ...rest }) => (
                        <StatisticsCard
                            key={title}
                            {...rest}
                            title={title}
                            icon={<Icon/>}
                            footer={
                                <Typography className="font-normal text-blue-gray-600">
                                    <strong className={footer.color}>{footer.value}</strong>
                                    &nbsp;{footer.label}
                                </Typography>
                            }
                        />
                    ))}
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-auto">
                <PatientsViewAppointmentCalendar />
            </div>
        </>
    )
}

DashboardHome.propTypes = {
    title: PropTypes.string.isRequired,
    footer: PropTypes.string.isRequired,
}

export default DashboardHome;