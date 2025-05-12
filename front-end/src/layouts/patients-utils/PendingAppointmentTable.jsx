import {
    Typography,
    Card,
    CardHeader,
    CardContent,
    Table,
    TableHead,
    TableRow,
    TableCell,
} from "@mui/material";
import PendingStatusAppointmentTable from "../../hooks/PendingTableAppointment";
import { useState, useEffect } from "react";
import CMS from "../../API/CMS";

const PendingAppointmentTable = () => {
    const appointmentsTableColumn = [
        "Clinic Name",
        'First Name',
        'Last Name',
        "Email",
        'Appointment Date',
        "Phone Number",
        "Appointment Time",
        'Status',
        'Purpose of Appointment',
    ]

    const patientEmail = localStorage.getItem("sem");

    const [retrievedAppointmentsData, setRetrievedAppointmentsData] = useState([]);

    useEffect(() => {
        const retrievePendingStatus = async () => {
            try {
                const response = await CMS.get(`/CMS/patients-dashboard/getPatientPendingStatus/${patientEmail}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                    },
                });

                if (response.status === 200) {
                    setRetrievedAppointmentsData(response.data.patientsPendingStatus);
                } else {
                    console.error(`Failed to retrieve pending appointment status in server: ${response.status}`);
                }

            } catch (error) {
                console.error(`Failed to retrieve pending appointment status: ${error}`);
            }
        }
        retrievePendingStatus();
    }, [patientEmail]);

    return (
        <>
            <div className="mt-5 mb-1 flex justify-center items-center w-full">
                <Card className="shadow-lg w-full">
                    <CardHeader
                        title="Pending Appointments"
                        className="bg-blue-500 mb-2 p-6"
                        slotProps={{
                            title: {
                                variant: 'h6',
                                className: 'text-white text-center',
                            },
                        }}
                    />
                    <CardContent className="overflow-x-scroll pt-0 pb-2 rounded-xl shadow-sm bg-white">
                        <Table className="w-full min-w-[100%] text-left text-gray-500">
                            <TableHead className="bg-gray-100 text-sm sm:text-base text-gray-600 uppercase">
                                <TableRow>
                                    {appointmentsTableColumn.map((header, i) => (
                                        <TableCell
                                            key={i}
                                            className="border-b border-blue-gray-50 text-center py-3 px-5"
                                            align="center"
                                        >
                                            <Typography
                                                variant="caption"
                                                className="text-[11px] font-bold uppercase text-blue-gray-400"
                                            >
                                                {header}
                                            </Typography>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <PendingStatusAppointmentTable
                                retrievedAppointmentsData={retrievedAppointmentsData}
                                appointmentsTableColumn={appointmentsTableColumn}
                            />
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default PendingAppointmentTable;