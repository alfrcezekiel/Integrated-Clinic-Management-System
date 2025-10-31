// ...existing code...
import {
    useState,
    useEffect,
    useCallback
} from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import CMS from "../../../API/CMS";
import { useAuthorization } from '../../../context/auth/useAuthorization';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Filler,
    Tooltip,
    Legend
);

const PopularAppointmentAnalytics = () => {
    const { user, token } = useAuthorization();
    const tokenContext = token || localStorage.getItem("authToken");
    const clinic_id = user?.sid;

    // helpers: format date "January 1, 2023" and time "1:00 PM"
    const formatDateLabel = useCallback((dateStr) => {
        if (!dateStr) return '—';
        try {
            const d = new Date(dateStr);
            if (isNaN(d)) {
                // try common alternate formats: if dateStr is "YYYY-MM-DD"
                const parsed = dateStr.includes('-') ? new Date(dateStr + 'T00:00:00') : new Date(dateStr);
                if (!isNaN(parsed)) {
                    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(parsed);
                }
                return dateStr;
            }
            return new Intl.DateTimeFormat('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            }).format(d);
        } catch {
            return dateStr;
        }
    }, []);

    const formatTimeLabel = useCallback((timeStr) => {
        if (!timeStr) return '—';
        try {
            // If timeStr already contains AM/PM, return as-is
            if (/(am|pm|AM|PM)/.test(timeStr)) return timeStr;
            // If time is like "HH:mm" or "HH:mm:ss", attach a date so Date can parse it
            let t = timeStr;
            if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeStr)) {
                t = `1970-01-01T${timeStr}`;
            }
            const d = new Date(t);
            if (isNaN(d)) return timeStr;
            return d.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return timeStr;
        }
    }, []);

    const fetchAppointmentData = useCallback(async ({ clinicID, startDate, endDate }) => {
        try {
            const response = await CMS.get(`/cms.api.com/clinic/analytics/popular_appointments`, {
                headers: {
                    "Authorization": `Bearer ${tokenContext}`,
                    "Content-Type": "application/json"
                },
                params: {
                    clinicID: clinicID,
                    startDate: startDate,
                    endDate: endDate
                }
            });

            if (response.status === 200) {
                return {
                    dates: response.data.dates,
                    times: response.data.times,
                    days: response.data.days,
                    countsBy: {
                        dates: response.data.datesCounts,
                        times: response.data.timesCounts,
                        days: response.data.daysCounts
                    }
                };
            } else {
                throw new Error(`Failed to retrieve the popularity data's`);
            }
        } catch (error) {
            console.error(`Failed to filter popularity appointment dates, appointment times, and days: ${error}`);
        }
    }, [tokenContext]);

    const indexOfMax = (arr = []) => {
        if (!arr || arr.length === 0) return 0;
        return arr
            .map((v, i) => ({ v, i }))
            .reduce((a, b) => (b.v > a.v ? b : a)).i;
    }

    // initialize to the shape Chart expects to avoid undefined .map errors
    const buildChartData = useCallback((data, mode) => {
        const rawLabels = mode === 'times' ? (data?.times ?? []) : mode === 'days' ? (data?.days ?? []) : (data?.dates ?? []);
        const counts = data?.countsBy?.[mode] ?? rawLabels.map(() => 0);

        // format labels based on mode
        const labels = (rawLabels || []).map((lbl) => {
            if (mode === 'times') return formatTimeLabel(lbl);
            if (mode === 'dates') return formatDateLabel(lbl);
            return lbl; // days remain as-is
        });
        return {
            labels,
            datasets: [
                {
                    label: `Popular Appointments by (${mode})`,
                    data: counts,
                    fill: true,
                    backgroundColor: 'rgba(99,102,241,0.12)', // indigo-500 with opacity
                    borderColor: 'rgba(99,102,241,1)',
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: 'rgba(99,102,241,1)',
                },
            ],
        };
    }, [formatDateLabel, formatTimeLabel]);

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });
    const [rawData, setRawData] = useState(null);
    const [view, setView] = useState('dates'); // 'dates' | 'times' | 'days'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchAppointmentData({
                    clinicID: clinic_id,
                });
                setRawData(data);
                setChartData(buildChartData(data, 'dates'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [clinic_id, fetchAppointmentData, buildChartData]);

    useEffect(() => {
        if (rawData) {
            setChartData(buildChartData(rawData, view));
        }
    }, [view, rawData, buildChartData]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#4B5563'
                },
                grid: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#4B5563'
                },
                grid: {
                    color: 'rgba(203,213,225,0.3)'
                }
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Popular Appointment Analytics</h3>
                    <p className="text-sm text-gray-500">Most chosen appointment dates, appointment times and days by patients</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setView('dates')}
                        className={`cursor-pointer px-3 py-1.5 rounded-md text-sm font-medium ${view === 'dates' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        Dates
                    </button>
                    <button
                        onClick={() => setView('times')}
                        className={`cursor-pointer px-3 py-1.5 rounded-md text-sm font-medium ${view === 'times' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        Times
                    </button>
                    <button
                        onClick={() => setView('days')}
                        className={`cursor-pointer px-3 py-1.5 rounded-md text-sm font-medium ${view === 'days' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        Days
                    </button>
                </div>
            </div>

            <div className="mt-4 h-64 sm:h-72 md:h-80">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-sm text-gray-500">Loading...</div>
                ) : (chartData && chartData.labels && chartData.labels.length > 0) ? (
                    <Line data={chartData} options={options} />
                ) : (
                    <div className="flex items-center justify-center h-full text-sm text-gray-500">No data available</div>
                )}
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                    <div className="text-xs text-gray-500">Top Appointment Date</div>
                    <div className="mt-1 font-medium text-gray-800">
                        {(() => {
                            const arr = rawData?.countsBy?.dates || [];
                            const idx = indexOfMax(arr);
                            const rawDate = rawData?.dates?.[idx] ?? '—';
                            return formatDateLabel(rawDate);
                        })()}
                    </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                    <div className="text-xs text-gray-500">Top Appointment Time</div>
                    <div className="mt-1 font-medium text-gray-800">
                        {(() => {
                            const arr = rawData?.countsBy?.times || [];
                            const idx = indexOfMax(arr);
                            const rawTime = rawData?.times?.[idx] ?? '—';
                            return formatTimeLabel(rawTime);
                        })()}
                    </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                    <div className="text-xs text-gray-500">Top Day</div>
                    <div className="mt-1 font-medium text-gray-800">
                        {(() => {
                            const arr = rawData?.countsBy?.days || [];
                            const idx = indexOfMax(arr);
                            return rawData?.days?.[idx] ?? '—';
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default PopularAppointmentAnalytics;