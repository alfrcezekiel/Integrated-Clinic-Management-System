import {
    useState,
    useEffect,
    useCallback
} from "react";
import CMS from "../../API/CMS";
import ApprovedAppointmentsTableValue from "../../hooks/ApprovedAppointmentValues";
import { useAuthorization } from "../../context/auth/useAuthorization";

const ApprovedAppointmentsTable = () => {
    const appointmentsTableColumn = [
        {
            key: 'clinic_name',
            label: 'Clinic Name',
            className: 'text-center'
        },
        {
            key: 'firstName',
            label: 'Name',
            className: 'text-center'
        },
        {
            key: 'email',
            label: 'Email',
            className: 'text-center'
        },
        {
            key: 'appointmentDate',
            label: 'Appointment Date',
            className: 'text-center'
        },
        {
            key: 'phoneNumber',
            label: 'Phone Number',
            className: 'text-center'
        },
        {
            key: 'preferredTime',
            label: 'Appointment Time',
            className: 'text-center'
        },
        {
            key: 'status',
            label: 'Status',
            className: 'text-center'
        },
        {
            key: 'purposeOfAppointment',
            label: 'Purpose of Appointment',
            className: 'text-center'
        },
    ];

    const { user, token } = useAuthorization();
    const patientEmail = user?.sem;
    const tokenContext = token || localStorage.getItem("authToken");
    const [retrievedAppointmentsData, setRetrievedAppointmentsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        const retrieveApprovedStatus = async () => {
            if (!tokenContext) return;

            setIsLoading(true);
            try {
                const response = await CMS.get(`/CMS/patients-dashboard/getPatientApprovedStatus/${patientEmail}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenContext}`,
                    },
                });

                if (response.status === 200) {
                    setRetrievedAppointmentsData(response.data.patientsApprovedStatus);
                } else {
                    console.error(`Failed to retrieve approved appointment status in server: ${response.status}`);
                }
            } catch (error) {
                console.error(`Failed to retrieve approved appointment status: ${error}`);
            } finally {
                setIsLoading(false);
            }
        }

        if (patientEmail) {
            retrieveApprovedStatus();
        }
    }, [patientEmail, tokenContext]);

    // Pagination
    const totalItems = retrievedAppointmentsData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = retrievedAppointmentsData.slice(indexOfFirstItem, indexOfLastItem);

    /**
     * @function filter the declined booked appointment details
     */

    const filteredApprovedBookedAppointments = useCallback(async (searchQuery) => {
        if (!patientEmail) return;

        setIsSearching(true);

        try {
            const response = await CMS.get(`/CMS/cms.api.com/patient/dashboard/searchedApprovedBookedAppointments`, {
                params: {
                    search: searchQuery,
                    email: patientEmail,
                    page: currentPage,
                    limit: itemsPerPage
                },
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`,
                },
            })

            if (response.status === 200) {
                setRetrievedAppointmentsData(response.data.result.appointments);
                setCurrentPage(response.data.result.pagination.currentPage);
                setItemsPerPage(response.data.result.pagination.limit);
            } else {
                throw new Error(`Failed to filter approved booked appointments in server: ${response.status}`);
            }
        } catch (error) {
            console.error(`Failed to filter approved booked appointments: ${error}`);
        } finally {
            setIsSearching(false);
        }
    }, [currentPage, itemsPerPage, patientEmail, tokenContext])

    const debouncedSearch = useCallback((searchValue) => {
        const timer = setTimeout(() => {
            filteredApprovedBookedAppointments(searchValue);
        }, 500)

        return () => clearTimeout(timer)
    }, [filteredApprovedBookedAppointments]);

    const handleSearchChange = (e) => {
        const { value } = e.target;
        setSearchTerm(value);
        if (value.trim() === "") {
            filteredApprovedBookedAppointments("");
        }
        debouncedSearch(value);
    }

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };

    return (
        <div className="mt-16 mb-8 w-full">
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-black to-black flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold text-white">Approved Appointments</h2>
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
                                                className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                                            >
                                                {column.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                {isSearching === isLoading && (
                                    <ApprovedAppointmentsTableValue
                                        appointmentsTableColumn={appointmentsTableColumn}
                                        retrievedAppointmentsData={currentItems}
                                    />
                                )}
                            </table>
                        </div>
                    </div>
                </div>
                {!isLoading && retrievedAppointmentsData.length === 0 && (
                    <div className="text-center py-4">
                        {searchTerm ? `No searched approved appointments found` : 'No approved appointments available'}
                    </div>
                )}
                {/* Pagination */}
                {totalItems > 0 && (
                    <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
                        <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                            Showing <span className="font-medium">
                                {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
                            </span> to{' '}
                            <span className="font-medium">
                                {Math.min(currentPage * itemsPerPage, totalItems)}
                            </span>{' '}
                            of <span className="font-medium">{totalItems}</span> results
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
    );
};

export default ApprovedAppointmentsTable;