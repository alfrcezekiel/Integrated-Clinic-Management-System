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
import AppointmentsTable from "../../hooks/useMemoTableRows";
import { useState, useEffect } from "react";
import CMS from "../../API/CMS";

const PatientsTable = () => {
    const appointmentsTableColumn = [
        'First Name',
        'Last Name',
        "Email",
        'Appointment Date',
        "Phone Number",
        "Appointment Time",
        'Status',
        'Purpose of Appointment',
    ]

    const [retrievedAppointmentsData, setRetrievedAppointmentsData] = useState([]);

    useEffect(() => {

        const retrieveAppointments = async () => {
            try {
                const response = await CMS.get("/CMS/patientsDashboard/bookedAppointments", {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.status === 200) {
                    setRetrievedAppointmentsData(response.data.patientsAppointments);
                }

            } catch (error) {
                console.log(`Failed to retrieve appointments: ${error}`);
            }
        }
        retrieveAppointments();

    }, []);

    return (
        <>
            <div className="mt-5 mb-1 flex justify-center items-center w-full">
                <Card className="shadow-lg w-full">
                    <CardHeader
                        title="View All Appointments"
                        className="bg-blue-500 mb-8 p-6"
                        slotProps={{
                            title: {
                                variant: 'h6',
                                className: 'text-white text-center',
                            },
                        }}
                    />
                    <CardContent className="overflow-x-scroll px-0 pt-0 pb-2">
                        <Table className="w-full min-w-[640px]">
                            <TableHead>
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
                            <AppointmentsTable
                                retrievedAppointmentsData={retrievedAppointmentsData}
                            />
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default PatientsTable;