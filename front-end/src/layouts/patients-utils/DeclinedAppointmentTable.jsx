import { useState, useEffect } from "react";
import CMS from "../../API/CMS";
import DeclinedAppointmentsTableValue from "../../hooks/DeclinedAppointmentValues";
import { useAuthorization } from "../../context/auth/useAuthorization";

// this component is used to render the declined appointments table
const DeclinedAppointmentStatusTable = () => {
    const appointmentsTableColumn = [
        {
            key: "clinic_name",
            label: "Clinic Name",
            className: "text-center"
        },
        {
            key: "firstName",
            label: "Name",
            className: "text-center"
        },
        {
            key: "email",
            label: "Email",
            className: "text-center"
        },
        {
            key: "appointmentDate",
            label: "Appointment Date",
            className: "text-center"
        },
        {
            key: "phoneNumber",
            label: "Phone Number",
            className: "text-center"
        },
        {
            key: "preferredTime",
            label: "Appointment Time",
            className: "text-center"
        },
        {
            key: "status",
            label: "Status",
            className: "text-center"
        },
        {
            key: "purposeOfAppointment",
            label: "Purpose of Appointment",
            className: "lg:table-cell"
        }
    ];
    const { user, token } = useAuthorization();

    const [searchTerm, setSearchTerm] = useState("");
    const [allDeclinedAppointments, setAllDeclinedAppointments] = useState([]);
    const [retrievedAppointmentsData, setRetrievedAppointmentsData] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const patientEmail = user?.sem || "";
    const tokenContext = token || localStorage.getItem("authToken");
    const [isSearching] = useState(false);

    // Pagination derived values
    const totalItems = retrievedAppointmentsData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = retrievedAppointmentsData.slice(indexOfFirstItem, indexOfLastItem);

    if (!tokenContext) {
        console.error("No token found in context or localStorage");
    }

    // Retrieve all declined appointments for this patient once
    useEffect(() => {
        const retrieveDeclinedStatus = async () => {
            try {
                setIsLoading(true);

                const response = await CMS.get(`/CMS/patients-dashboard/getPatientDeclinedStatus/${patientEmail}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenContext}`,
                    },
                });

                if (response.status === 200) {
                    const data = response.data.patientsDeclinedStatus || [];
                    setAllDeclinedAppointments(data);
                    setRetrievedAppointmentsData(data);
                } else {
                    console.error(`Failed to retrieve declined appointment status in server: ${response.status}`);
                }
            } catch (error) {
                console.error(`Failed to retrieve declined appointment status: ${error}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (patientEmail && tokenContext) {
            retrieveDeclinedStatus();
        }
    }, [patientEmail, tokenContext]);

    // Local filter on patient information (name, email, phone, clinic, purpose, status, date, time)
    useEffect(() => {
        // Reset to first page on each new search
        setCurrentPage(1);

        const term = searchTerm.trim().toLowerCase();
        if (!term) {
            setRetrievedAppointmentsData(allDeclinedAppointments);
            return;
        }

        const timer = setTimeout(() => {
            const filtered = allDeclinedAppointments.filter((appt) => {
                const fullName = `${appt?.firstName || ""} ${appt?.lastName || ""}`.trim();
                const fields = [
                    appt?.firstName,
                    appt?.lastName,
                    fullName,
                    appt?.email,
                    appt?.phoneNumber,
                    appt?.clinic_name,
                    appt?.purposeOfAppointment,
                    appt?.status,
                    appt?.appointmentDate,
                    appt?.preferredTime,
                ];

                return fields.some((val) =>
                    String(val || "").toLowerCase().includes(term)
                );
            });

            setRetrievedAppointmentsData(filtered);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, allDeclinedAppointments]);

    const handleSearchChange = (e) => {
        const { value } = e.target;
        setSearchTerm(value);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };

    return (
        <>
            <div className="mt-16 mb-8 w-full">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div
                        className="px-6 py-4 bg-gradient-to-r from-black to-black flex flex-col sm:flex-row justify-between items-center gap-4"
                    >
                        <h2 className="text-white text-start text-xl font-bold">Declined Appointments</h2>
                        <div className="relative w-full sm:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black/50 focus:border-black/50 sm:text-sm"
                                placeholder="Search patients..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {appointmentsTableColumn.map((column) => (
                                                <th
                                                    key={column.key}
                                                    scope="col"
                                                    className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className}`}
                                                >
                                                    {column.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    {isSearching === isLoading && (
                                        <DeclinedAppointmentsTableValue
                                            appointmentsTableColumn={appointmentsTableColumn}
                                            retrievedAppointmentsData={currentItems}
                                        />
                                    )}
                                </table>
                                {isLoading && (
                                    <div className="py-6 text-center">
                                        <div
                                            className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black/100"
                                        >
                                        </div>
                                    </div>
                                )}
                            </div>
                            {retrievedAppointmentsData.length === 0 && !isLoading && (
                                <div className="text-center py-4 text-gray-500">
                                    {searchTerm ? 'No searched declined appointments found' : 'No declined appointments available'}
                                </div>
                            )}
                            {totalItems > 0 && (
                                <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
                                    <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                                        Showing <span className="font-medium">
                                            {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
                                        </span> to {" "}
                                        <span className="font-medium">
                                            {Math.min(currentPage * itemsPerPage, totalItems)}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <select
                                            className="px-3 py-1 border rounded text-sm"
                                            value={itemsPerPage}
                                            onChange={handleItemsPerPageChange}
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                            <option value={150}>150</option>
                                            <option value={200}>200</option>
                                            <option value={250}>250</option>
                                            <option value={300}>300</option>
                                            <option value={350}>350</option>
                                            <option value={400}>400</option>
                                            <option value={450}>450</option>
                                            <option value={500}>500</option>
                                        </select>
                                        <div className="flex space-x-1 gap-1">
                                            <button
                                                onClick={() => handlePageChange(1)}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-black/100 text-white"
                                            >
                                                First
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-black/100 text-white"
                                            >
                                                Previous
                                            </button>
                                            <p className="py-1 text-center">
                                                Page {currentPage} of {totalPages}
                                            </p>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage >= totalPages}
                                                className="px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-black/100 text-white"
                                            >
                                                Next
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(totalPages)}
                                                disabled={currentPage >= totalPages}
                                                className="px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-black/100 text-white"
                                            >
                                                Last
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DeclinedAppointmentStatusTable;