import { useState, useEffect, useCallback } from "react";
import CMS from "../../API/CMS";
import DeclinedAppointmentsTableValue from "../../hooks/DeclinedAppointmentValues";
import { useAuthorization } from "../../context/auth/useAuthorization";

// this component is used to render the declined appointments table
const DeclinedAppointmentStatusTable = () => {
    const appointmentsTableColumn = [
        {
            key: "clinicName",
            label: "Clinic Name",
            className: "text-center"
        },
        {
            key: "name",
            label: "Name",
            className: "text-center"
        },
        {
            key: "email",
            label: "Email",
            className: "text-center"
        },
        {
            key: "address",
            label: "Address",
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
            key: "appointmentTime",
            label: "Appointment Time",
            className: "text-center"
        },
        {
            key: "status",
            label: "Status",
            className: "text-center"
        },
        {
            key: "purpose",
            label: "Purpose of Appointment",
            className: "text-center"
        }
    ]
    const { user, token } = useAuthorization();

    const [searchTerm, setSearchTerm] = useState("");
    const [retrievedAppointmentsData, setRetrievedAppointmentsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const patientEmail = user?.sem || "";
    const tokenContext = token;
    const [isSearching, setIsSearching] = useState(false);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10,
        hasNextPage: false,
        hasPreviousPage: false
    });
    const [totalItems, setTotalItems] = useState(0);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);

    if (!tokenContext) {
        console.error("No token found in context or localStorage");
    }

    const filteredDeclinedAppointments = useCallback(async (searchQuery, page = 1, limit = 10) => {
        if (!patientEmail && !tokenContext) return;

        const filterSearching = searchQuery.trim() !== "";
        if (filterSearching) {
            setIsSearching(true);
        } else {
            setIsLoading(true);
        }

        try {
            const response = await CMS.get(`/cms.api.com/patient/dashboard/searchDeclinedBookedAppointments`, {
                params: {
                    search: searchQuery,
                    email: patientEmail,
                    page: page,
                    limit: limit
                },
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`,
                },
            })

            if (response.status === 200) {
                setRetrievedAppointmentsData(response.data.data);
                setPagination(response.data.pagination);
                setTotalItems(response.data.pagination?.total);
            } else {
                throw new Error(`Failed to filter declined appointment information in server: ${response.status}`);
            }
        } catch (error) {
            console.error(`Failed to filter declined appointment information: ${error}`);
        } finally {
            setIsSearching(false);
            setIsLoading(false);
        }
    }, [patientEmail, tokenContext]);

    const debouncedSearch = useCallback(async (searchValue) => {
        const timer = setTimeout(async () => {
            await filteredDeclinedAppointments(searchValue, pagination.currentPage, pagination.limit)
                .finally(() => setSearchLoading(false));
            return;
        }, 500);

        setSearchTimeout(timer);

        return () => clearTimeout(timer)
    }, [filteredDeclinedAppointments, pagination.currentPage, pagination.limit]);

    useEffect(() => {
        if (searchTerm.trim()) {
            filteredDeclinedAppointments(searchTerm, pagination.currentPage, pagination.limit)
        } else {
            filteredDeclinedAppointments("", pagination.currentPage, pagination.limit)
        }

    }, [searchTerm, pagination.currentPage, pagination.limit, filteredDeclinedAppointments]);

    const handleSearchChange = useCallback(async (e) => {
        const { value } = e.target;
        setSearchTerm(value);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        setSearchLoading(true);

        if (!value.trim()) {
            await filteredDeclinedAppointments("", pagination.currentPage, pagination.limit)
                .finally(() => setSearchLoading(false));
            return;
        }

        await debouncedSearch(value)
    }, [debouncedSearch, filteredDeclinedAppointments, pagination.currentPage, searchTimeout, pagination.limit]);

    const retrieveDeclinedStatus = useCallback( async () => {
        try {
            setIsLoading(true)

            const response = await CMS.get(`/patients-dashboard/getPatientDeclinedStatus/${patientEmail}`, {
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
        } finally {
            setIsLoading(false);
        }
    }, [patientEmail, tokenContext]);

    useEffect(() => {
        retrieveDeclinedStatus();
    }, [patientEmail, tokenContext, retrieveDeclinedStatus]);

    const handlePageChange = useCallback( async (pageNumber) => {
        setPagination((prev) => ({
            ...prev,
            currentPage: pageNumber
        }))

        if (searchTerm.trim()) {
            await filteredDeclinedAppointments(searchTerm, pageNumber, pagination.limit)
        } else {
            await filteredDeclinedAppointments("", pageNumber, pagination.limit)
        }
    }, [filteredDeclinedAppointments, searchTerm, pagination.limit]);

    const handleItemsPerPageChange = useCallback(async (e) => {
        const newItemsPerPage = parseInt(e.target.value)
        setPagination((prev) => ({
            ...prev,
            currentPage: 1,
            limit: newItemsPerPage
        }))

        if (searchTerm.trim()) {
            await filteredDeclinedAppointments(searchTerm, pagination.currentPage, newItemsPerPage)
        } else {
            await filteredDeclinedAppointments("", pagination.currentPage, newItemsPerPage)
        }
    }, [filteredDeclinedAppointments, pagination.currentPage, searchTerm])

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
                            {searchLoading && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black/500"></div>
                                </div>
                            )}
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
                                    {isSearching || searchLoading || isLoading ? (
                                        <tbody>
                                            <tr>
                                                <td
                                                    colSpan={appointmentsTableColumn.length}
                                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                                                >
                                                    <div className="flex justify-center items-center h-32">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black/500"></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    ) : (
                                        <DeclinedAppointmentsTableValue
                                            appointmentsTableColumn={appointmentsTableColumn}
                                            retrievedAppointmentsData={retrievedAppointmentsData}
                                        />
                                    )}
                                </table>
                            </div>
                        </div>
                        {retrievedAppointmentsData.length === 0 && !isLoading && (
                            <div className="text-center py-4 text-gray-500">
                                <p className="text-gray-500 dark:text-gray-400">
                                    {searchTerm ? 'No searched declined appointments found' : 'No declined appointments available'}
                                </p>
                            </div>
                        )}
                        {totalItems > 0 && (
                            <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
                                <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                                    Showing <span className="font-medium">
                                        {Math.min(pagination.limit, totalItems)}
                                    </span> to {" "}
                                    <span className="font-medium">
                                        {Math.min(pagination.currentPage * pagination.limit, totalItems)}
                                    </span>
                                    {" "}
                                    of <span className="font-medium">{totalItems}</span> items
                                </div>
                                <div className="flex items-center space-x-4">
                                    <select
                                        className="px-3 py-1 border rounded text-sm"
                                        value={pagination.limit}
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
                                            disabled={pagination.currentPage === 1}
                                            className="px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-black/100 text-white"
                                        >
                                            First
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={pagination.currentPage === 1}
                                            className="px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-black/100 text-white"
                                        >
                                            Previous
                                        </button>
                                        <p className="py-1 text-center">
                                            Page {pagination.currentPage} of {pagination.totalPages}
                                        </p>
                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            disabled={pagination.currentPage >= pagination.totalPages}
                                            className="px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-black/100 text-white"
                                        >
                                            Next
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(pagination.totalPages)}
                                            disabled={pagination.currentPage >= pagination.totalPages}
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
        </>
    )
}

export default DeclinedAppointmentStatusTable;