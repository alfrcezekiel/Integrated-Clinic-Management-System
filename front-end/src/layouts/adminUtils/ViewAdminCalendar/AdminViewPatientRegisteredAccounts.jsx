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

const AdminViewPatientRegisteredAccountCalendar = () => {
  const locales = {
    "en-US": enUS,
  };
  const [events, setEvents] = useState([]);

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
  });

  useEffect(() => {
    const retrievedPatientsRegisteredAccounts = async () => {
      try {
        const response = await CMS.get("/admin-dashboard/registeredPatientAccount", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json"
          }
        });

        if (response.status === 200) {
          const rawData = response.data.registeredPatientsAccount;

          const formattedBirthdays = rawData
            .filter((item) => item.dateOfBirth)
            .map((item) => {
              const dob = new Date(item.dateOfBirth);

              return {
                title: `🎂 ${item.firstName} ${item.lastName}`,
                start: dob,
                end: dob,
                allDay: true,
                originalDate: item.dateOfBirth, // Store original date string
                ...item,
              };
            })
            .filter(Boolean);
          setEvents(formattedBirthdays);
        }
      } catch (error) {
        console.error("Failed to load birthdays:", error);
      }
    };

    retrievedPatientsRegisteredAccounts();
  }, []);

  const [selectedEvent, setSelectedEvent] = useState(null);

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
        return "text-red-300";
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
              <div className="text-xs rounded px-2 py-2">{`${event.title}`}</div>
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
        <DialogTitle>Registered Patient Account Details</DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <>
              <div className="mb-2">
                <strong>Patient Account Name</strong>
                <Typography>
                  {`${selectedEvent.firstName} ${selectedEvent.lastName}`}
                </Typography>
              </div>
              <div className="mb-2">
                <strong>Email Address</strong>
                <Typography>{selectedEvent.email}</Typography>
              </div>
              <div className="mb-2">
                <strong>Address</strong>
                <Typography>{selectedEvent.address}</Typography>
              </div>
              <div className="mb-2">
                <strong>Date Of Birth</strong>
                <Typography>
                  {selectedEvent.originalDate
                    ? format(
                      new Date(selectedEvent.originalDate),
                      "MMMM d, yyyy"
                    )
                    : "N/A"}
                </Typography>
              </div>
              <div className="mb-2">
                <strong>Phone Number</strong>
                <Typography>{selectedEvent.phoneNumber}</Typography>
              </div>
              <div className="mb-2">
                <strong>Civil Status</strong>
                <Typography>{selectedEvent.civilStatus}</Typography>
              </div>
              <div className="mb-2">
                <strong>Account Status</strong>
                <Typography
                  className={`${getStatusColor(selectedEvent.status)}`}
                >
                  {selectedEvent.status}
                </Typography>
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

export default AdminViewPatientRegisteredAccountCalendar;
