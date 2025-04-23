import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid2 as Grid,
    Typography,
    CircularProgress
} from "@mui/material";
import PropTypes from "prop-types";

const ConfirmAppointmentModal = ({ open, onClose, patientsData, onNextStep }) => {
    const renderItem = (label, value) => (
        <Grid item xs={12}>
            <div className="flex flex-col text-left">
                <Typography variant="subtitle2" color="textSecondary">
                    {label}
                </Typography>
                <Typography variant="body1">{value}</Typography>
            </div>
        </Grid>
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle className="flex justify-between items-center">
                Confirm Booked Appointment
            </DialogTitle>


            {!patientsData ? (
                <DialogContent className="space-y-6 flex flex-col gap-6 justify-center items-center">
                    <CircularProgress />
                </DialogContent>
            ) : (
                <>
                    <DialogContent className="space-y-6 flex flex-col gap-6">
                        {/* Patient Section Title */}
                        <Typography variant="h6" gutterBottom className="text-left">
                            Patient Information
                        </Typography>
                        <section className="border p-4 rounded-lg shadow-sm w-full">
                            <Grid container spacing={2} direction="column">
                                {renderItem("First Name", patientsData?.patient?.firstName)}
                                {renderItem("Last Name", patientsData?.patient?.lastName)}
                                {renderItem("Email", patientsData?.patient?.email)}
                                {renderItem("Phone Number", patientsData?.patient?.phoneNumber)}
                                {renderItem("Appointment Date", patientsData?.patient?.appointmentDate)}
                                {renderItem("Appointment Time", patientsData?.patient?.preferredTime)}
                            </Grid>
                        </section>

                        {/* Clinic Section Title */}
                        <Typography variant="h6" gutterBottom className="text-left">
                            Clinic Information
                        </Typography>
                        <section className="border p-4 rounded-lg shadow-sm w-full">
                            <Grid container spacing={2} direction="column">
                                {renderItem("Clinic Name", patientsData?.clinic?.clinic_name)}
                                {renderItem("Clinic Address", patientsData?.clinic?.clinic_address)}
                                {renderItem("Clinic Email Address", patientsData?.clinic?.email)}
                                {renderItem("Phone Number", patientsData?.clinic?.phoneNumber)}
                                {renderItem("Consultation Fee", patientsData?.clinic?.consultation_fee)}
                                {renderItem("Clinic Type", patientsData?.clinic?.clinic_type)}
                                {renderItem("Date Open", patientsData?.clinic?.clinic_date_open && patientsData?.clinic?.clinic_close_date ? `${patientsData.clinic.clinic_date_open} - ${patientsData.clinic.clinic_close_date}` : "N/A")}
                                {renderItem("Clinic Closed Time", patientsData?.clinic?.clinic_time && patientsData?.clinic?.clinic_close_time ? `${patientsData.clinic.clinic_time} - ${patientsData.clinic.clinic_close_time}` : "N/A")}
                            </Grid>
                        </section>
                    </DialogContent>
                </>
            )}

            <DialogActions className="p-4 flex justify-between">
                <Button variant="outlined" color="secondary" onClick={onClose}>
                    Back
                </Button>
                <Button variant="contained" color="primary" onClick={onNextStep}>
                    Proceed To Payment
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ConfirmAppointmentModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    patientsData: PropTypes.shape({
        patient: PropTypes.shape({
            firstName: PropTypes.string,
            lastName: PropTypes.string,
            email: PropTypes.string,
            phoneNumber: PropTypes.string,
            appointmentDate: PropTypes.string,
            preferredTime: PropTypes.string,
        }).isRequired,
        clinic: PropTypes.shape({
            clinic_name: PropTypes.string,
            clinic_address: PropTypes.string,
            email: PropTypes.string,
            phoneNumber: PropTypes.string,
            consultation_fee: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            clinic_type: PropTypes.string,
            clinic_date_open: PropTypes.string,
            clinic_close_date: PropTypes.string,
            clinic_time: PropTypes.string,
            clinic_close_time: PropTypes.string,
        }).isRequired,
    }).isRequired,
    onNextStep: PropTypes.func.isRequired,
}

export default ConfirmAppointmentModal;