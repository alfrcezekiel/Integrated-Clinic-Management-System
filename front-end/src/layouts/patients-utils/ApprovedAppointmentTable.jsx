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
                    setRetrievedAppointmentsData(response.data.patientsApprovedStatus || []);
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
            filteredApprovedBookedAppointments("")
        }
        debouncedSearch(value)
    }

    // Pagination
    const totalItems = retrievedAppointmentsData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = retrievedAppointmentsData.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

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
                            placeholder="Search appointments..."
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
                            {isLoading && (
                                <div className="py-6 text-center">
                                    <div
                                        className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black/100"
                                    >
                                    </div>
                                </div>
                            )}
                            {retrievedAppointmentsData.length === 0 && !isLoading && (
                                <div className="text-center py-4 text-gray-500">
                                    {searchTerm ? 'No searched approved appointments found' : 'No approved appointments available'}
                                </div>
                            )}
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                                                <span className="font-medium">
                                                    {Math.min(indexOfLastItem, totalItems)}
                                                </span>{' '}
                                                of <span className="font-medium">{totalItems}</span> results
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center">
                                                <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-700">
                                                    Rows per page:
                                                </label>
                                                <select
                                                    id="itemsPerPage"
                                                    value={itemsPerPage}
                                                    onChange={handleItemsPerPageChange}
                                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black/50 focus:border-black/50 sm:text-sm rounded-md"
                                                >
                                                    <option value={5}>5</option>
                                                    <option value={10}>10</option>
                                                    <option value={25}>25</option>
                                                    <option value={50}>50</option>
                                                </select>
                                            </div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                <button
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    <span className="sr-only">Previous</span>
                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i;
                                                    } else {
                                                        pageNum = currentPage - 2 + i;
                                                    }
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                                <button
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    <span className="sr-only">Next</span>
                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApprovedAppointmentsTable;