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
import { useState, useEffect } from "react";
import CMS from "../../API/CMS";
import DeclinedAppointmentsTableValue from "../../hooks/DeclinedAppointmentValues";
import { useAuthorization } from "../../context/auth/useAuthorization";

// this component is used to render the declined appointments table
const DeclinedAppointmentStatusTable = () => {
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
    const { user, token } = useAuthorization();

    const patientEmail = user?.sem || "";
    const tokenContext = token;
    if (!tokenContext) {
        console.error("No token found in context or localStorage");
    }
    
    const [retrievedAppointmentsData, setRetrievedAppointmentsData] = useState([]);

    useEffect(() => {
        const retrieveDeclinedStatus = async () => {
            try {
                const response = await CMS.get(`/CMS/patients-dashboard/getPatientDeclinedStatus/${patientEmail}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenContext}`,
                    },
                });

                if (response.status === 200) {
                    setRetrievedAppointmentsData(response.data.patientsDeclinedStatus);
                } else {
                    console.error(`Failed to retrieve declined appointment status in server: ${response.status}`);
                }

            } catch (error) {
                console.error(`Failed to retrieve declined appointment status: ${error}`);
            }
        }
        retrieveDeclinedStatus();
    }, [patientEmail, tokenContext]);

    return (
        <>
            <div className="mt-20 mb-1 flex justify-center items-center w-full">
                <Card className="shadow-lg w-full">
                    <CardHeader
                        title="Declined Appointments"
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
                            <DeclinedAppointmentsTableValue
                                retrievedAppointmentsData={retrievedAppointmentsData}
                            />
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default DeclinedAppointmentStatusTable;