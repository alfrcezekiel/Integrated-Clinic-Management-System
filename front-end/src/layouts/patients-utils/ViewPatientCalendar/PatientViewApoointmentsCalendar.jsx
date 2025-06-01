import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { enUS } from "date-fns/locale";
import CMS from "../../../API/CMS";
import {
  Typography,
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
  DialogContent,
} from "@mui/material";
import { useAuthorization } from "../../../context/auth/useAuthorization";

const PatientsViewAppointmentCalendar = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const locales = {
    "en-US": enUS,
  };
  const [events, setEvents] = useState([]);
  const { user, token } = useAuthorization();

  const patient_email = user?.sem;
  const tokenContext = token || localStorage.getItem("authToken");

  if (!tokenContext) {
    console.error("No token found in context or localStorage");
  }

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
  });

  const formatPreferredTime = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return format(date, "p");
  };

  useEffect(() => {
    const retrievePatientsAppointments = async () => {
      try {
        const response = await CMS.get(`/CMS/patientsDashboard/bookedAppointments/${patient_email}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${tokenContext}`,
          },
        });

        if (response.status === 200) {
          const formattedAppointments = response.data.patientsAppointments.map(
            (app) => {
              const [hour, minute] = app.preferredTime.split(":").map(Number);
              const appointmentStart = new Date(app.appointmentDate);
              appointmentStart.setHours(hour, minute, 0, 0);

              const appointmentEnd = new Date(appointmentStart);
              appointmentEnd.setHours(appointmentEnd.getHours() + 1); // Adjust as needed

              return {
                ...app,
                start: appointmentStart,
                end: appointmentEnd,
              };
            }
          );

          setEvents(formattedAppointments);
        }
      } catch (error) {
        console.error(`Failed to retrieve appointments: ${error}`);
      }
    };
    retrievePatientsAppointments();
  }, [patient_email, tokenContext]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseDialog = () => {
    setSelectedEvent(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "text-green-400";
      case "Pending":
        return "text-yellow-400";
      case "Declined":
        return "text-red-400";
      case "Cancelled":
        return "text-red-400"
      case "Consulted":
        return "text-blue-300";
      default:
        return "text-white";
    }
  };

  return (
    <div className="relative p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 1000 }}
        onSelectEvent={handleSelectEvent}
        components={{
          event: ({ event }) => (
            <div>
              <div className="font-medium">{`${event.firstName} ${event.lastName}`}</div>
              <div
                className={`text-xs ${getStatusColor(
                  event.status
                )} rounded px-2 py-2`}
              >
                {event.status}
              </div>
            </div>
          ),
        }}
      />

      <Dialog open={!!selectedEvent} onClose={handleCloseDialog} fullWidth>
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <>
              <div className="mb-2">
                <strong>Patient Name:</strong>
                <Typography>
                  {`${selectedEvent.firstName} ${selectedEvent.lastName}`}
                </Typography>
              </div>
              <div>
                <strong>Email Address:</strong>
                <Typography>{selectedEvent.email}</Typography>
              </div>
              <div>
                <strong>Appointment Date:</strong>
                <Typography>
                  {format(selectedEvent.appointmentDate, "PPPP")}
                </Typography>
              </div>
              <div>
                <strong>Appointment Time:</strong>
                <Typography>
                  {selectedEvent.preferredTime
                    ? formatPreferredTime(selectedEvent.preferredTime)
                    : ""}
                </Typography>
              </div>
              <div>
                <strong>Phone Number:</strong>
                <Typography>{selectedEvent.phoneNumber}</Typography>
              </div>
              <div>
                <strong>Appointment Status:</strong>
                <Typography
                  className={`${getStatusColor(selectedEvent.status)}`}
                >
                  {selectedEvent.status}
                </Typography>
              </div>
              <div>
                <strong>Purpose of Appointment:</strong>
                <Typography>{selectedEvent.purposeOfAppointment}</Typography>
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <div className="flex justify-end items-centers w-full">
            <Button
              onClick={handleCloseDialog}
              color="primary"
              variant="contained"
            >
              Close
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PatientsViewAppointmentCalendar;
