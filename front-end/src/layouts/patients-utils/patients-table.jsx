import {
    useState,
    useEffect,
    useCallback,
} from "react";
import AppointmentsTable from "../../hooks/useMemoTableRows";
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";

const PatientsTable = () => {
    const columns = [
        {
            key: 'name',
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
            key: 'appointmentTime',
            label: 'Appointment Time',
            className: 'text-center'
        },
        {
            key: 'status',
            label: 'Status',
            className: 'text-center'
        },
        {
            key: 'purpose',
            label: 'Purpose of Appointment',
            className: 'text-center'
        },
    ];

    const { user, token } = useAuthorization();
    const tokenContext = token || localStorage.getItem("authToken");
    const [retrievedAppointmentsData, setRetrievedAppointmentsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isSearching, setIsSearching] = useState(false);

    /**
     * Filter data based on search term of patient information
     */
    const retrieveFilteredAppointments = useCallback(async (searchQuery) => {
        if (!tokenContext) return;

        setIsSearching(true);

        try {
            const response = await CMS.get(`/CMS/cms.api.com/patient/dashboard/filterAllBookedAppointments`, {
                params: {
                    search: searchQuery,
                    email: user?.sem,
                    page: currentPage,
                    limit: itemsPerPage
                }
            })

            if (response.status === 200) {
                setRetrievedAppointmentsData(response.data.result.data)
                setCurrentPage(response.data.result.currentPage);
                setItemsPerPage(response.data.result.limit);
            } else {
                throw new Error(`Failed to filtered all patient booked appointments`)
            }
        } catch (error) {
            console.error(`Error in filtered all patient booked appointments: ${error}`);
        } finally {
            setIsSearching(false);
        }
    }, [tokenContext, currentPage, itemsPerPage, user?.sem])

    /**
     * @function debouncing the search filtering when the user searched for information it waits for short delay in the interval period of time
     */
    const handleSearch = useCallback((e) => {
        const searchValue = e.target.value;
        setSearchTerm(searchValue);

        if (!searchValue.trim()) {
            retrieveFilteredAppointments()
            return;
        }

        const timer = setTimeout(() => {
            retrieveFilteredAppointments(searchValue)
        }, 500)

        return () => clearTimeout(timer)
    }, [retrieveFilteredAppointments])

    // const filteredData = useMemo(() => {
    //     if (!searchTerm.trim()) return retrievedAppointmentsData;

    //     const lowercasedSearch = searchTerm.toLowerCase();
    //     return retrievedAppointmentsData.filter(item =>
    //         Object.entries({
    //             firstName: item.firstName,
    //             lastName: item.lastName,
    //             email: item.email,
    //             phoneNumber: item.phoneNumber,
    //             status: item.status,
    //             purposeOfAppointment: item.purposeOfAppointment,
    //             appointmentDate: item.appointmentDate
    //         }).some(([, value]) => value?.toString().toLowerCase().includes(lowercasedSearch))
    //     );
    // }, [searchTerm, retrievedAppointmentsData]);

    // Pagination
    const totalItems = retrievedAppointmentsData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = retrievedAppointmentsData.slice(indexOfFirstItem, indexOfLastItem);

    /**
     * @function retrieves the all booked appointment of patient infonrmation
     */
    const fetchAppointments = useCallback(async () => {
        if (!tokenContext) {
            console.error("No token found in context or localStorage");
            setIsLoading(false);
            return;
        }

        try {
            const email = user?.sem;
            const response = await CMS.get(`/CMS/patientsDashboard/bookedAppointments/${email}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`,
                },
            });

            if (response.status === 200) {
                setRetrievedAppointmentsData(response.data.patientsAppointments);
            }
        } catch (error) {
            console.error(`Failed to retrieve appointments:`, error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.sem, tokenContext]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

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
                    <h2 className="text-xl font-semibold text-white">Appointments</h2>
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
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        scope="col"
                                        className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className}`}
                                    >
                                        <div className="flex items-center justify-center">
                                            {column.label}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        {isSearching === isLoading && (
                            <AppointmentsTable
                                retrievedAppointmentsData={currentItems}
                            />
                        )}
                    </table>
                </div>
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
                {!isLoading && retrievedAppointmentsData.length === 0 && (
                    <div className="px-6 py-4 text-center text-gray-500">
                        {searchTerm ? 'No searched appointments found' : 'No appointments found'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientsTable;