import {
    useState,
    useMemo,
    useEffect,
    useCallback
} from 'react';
import { Search, Eye } from 'lucide-react';
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";
import { CLINIC_TYPES } from "../../constants/clinicTypes.js";

const clinicFieldConfigs = {
    [CLINIC_TYPES.DENTAL]: {
        patientInfo: {
            firstName: "first_name",
            lastName: "last_name",
            email: "email",
            address: "address",
            phoneNumber: "phone_number"
        },
        medicalHistory: [
            { label: "Documented Allergic Reactions", field: "allergy_details" },
            { label: "Current Prescription Medications", field: "taking_prescription_medication_details" },
            { label: "Chronic Health Conditions", field: "chronic_condition_details" },
            { label: "Temporomandibular Joint (TMJ) or Jaw Pain History", field: "history_of_jaw_pain_details" },
            { label: "History of Excessive Bleeding", field: "experienced_excessive_bleeding_details" },
            { label: "Cardiovascular History", field: "past_history_of_cardiovascular_issues" },
            { label: "Prophylactic Antibiotic Recommendation", field: "advised_taking_antibiotics_details" },
            { label: "Surgical History", field: "past_surgeries_details" }
        ],
        lifestyleAssessment: [
            { label: "Gingival Bleeding History", field: "experience_bleeding_details" },
            { label: "Dental Sensitivity Description", field: "tooth_sensitivity_details" },
            { label: "Concerns Regarding Dental Aesthetics", field: "dental_appearance_details" },
            { label: "Tooth Mobility Observations", field: "loose_teeth_details" },
            { label: "Regular Physical Activity", field: "regular_exercise_details" },
            { label: "Alcohol Consumption Habits", field: "consume_alcohol_details" },
            { label: "Dental Floss Usage", field: "dental_floss_details" },
            { label: "Intake of Sugary Foods or Beverages", field: "consume_sugary_foods_or_beverages_details" },
            { label: "Oral Malodor or Dysgeusia", field: "bad_breath_or_bad_taste_details" },
            { label: "Recent Dental Radiographs", field: "dental_xrays_details" },
            { label: "Nutritional Balance and Diet Quality", field: "balanced_diet_details" },
            { label: "Tobacco Use Frequency", field: "smoke_frequency_details" },
            { label: "Engagement in Athletic Activities", field: "participate_in_sports_details" },
            { label: "Previous Dental Restorations", field: "dental_restoration_details" },
            { label: "History of Orthodontic Interventions", field: "orthodontic_treatment_details" },
            { label: "Brushing Frequency", field: "brush_frequency_details" },
            { label: "Mouthwash Usage", field: "use_mouthwash_details" },
            { label: "Toothbrush Replacement Frequency", field: "replace_toothbrush_details" },
            { label: "Tongue Cleaning Practices", field: "clean_tongue_details" },
            { label: "Regular Dental Check-up Attendance", field: "regular_checkup_details" },
            { label: "Dental Anxiety Level", field: "dental_anxiety_details" },
            { label: "History of Dental Trauma", field: "dental_trauma_details" },
            { label: "Eating Disorder History", field: "eating_disorder_details" }
        ]
    },
    [CLINIC_TYPES.PSYCHIATRY]: {
        patientInfo: {
            firstName: "first_name",
            lastName: "last_name",
            email: "email",
            address: "address",
            phoneNumber: "phone_number"
        },
        medicalHistory: [
            { label: "Diagnosed Mental Health Conditions", field: "diagnosed_mental_health_condition_details" },
            { label: "Current Psychiatric Medications", field: "taking_psychiatric_medication_details" },
            { label: "History of Psychiatric Hospitalization", field: "hospitalized_for_mental_health_reason_details" },
            { label: "Family History of Mental Health Conditions", field: "family_history_of_mental_health_condition_details" },
            { label: "Suicidal Thoughts or Behaviors", field: "suicidal_thoughts_or_behavior_details" },
            { label: "Self-Harm or Suicide Attempts", field: "self_harm_or_suicide_details" },
            { label: "Counseling or Therapy History", field: "counseling_or_therapy_details" },
            { label: "Emotional or Behavioral Patterns", field: "emotional_or_behavioral_patterns_details" }
        ],
        lifestyleAssessment: [
            { label: "Mood Patterns", field: "mood_details" },
            { label: "Excessive Worry or Anxiety", field: "excessive_worry_or_anxiety_details" },
            { label: "Sleep Patterns", field: "sleep_patterns_details" },
            { label: "Appetite or Weight Changes", field: "appetite_or_weight_details" },
            { label: "Sleep Changes", field: "sleep_changes_details" },
            { label: "Feelings of Hopelessness or Worthlessness", field: "hopelessness_or_worthlessness_details" },
            { label: "Agitation or Impulsivity", field: "agitation_or_impulsivity_details" },
            { label: "Difficulty Concentrating", field: "difficulty_concentrating_details" },
            { label: "Stress Levels", field: "stress_level_details" },
            { label: "Support System", field: "support_system_details" },
            { label: "Major Life Changes", field: "major_life_changes_details" },
            { label: "Substance Use", field: "substances_details" },
            { label: "Sleep Hours", field: "sleep_hours_details" },
            { label: "Social Groups", field: "social_group_details" },
            { label: "Living Situation", field: "living_situation_details" },
            { label: "Coping with Stress", field: "coping_with_stress_details" },
            { label: "Mental Health Treatment History", field: "mental_health_treatment_details" },
            { label: "Previous Treatment History", field: "treatment_history_details" },
            { label: "Currently in Therapy", field: "currently_in_therapy_details" },
            { label: "Negative Experience with Mental Health Treatment", field: "negative_experience_with_mental_health_treatment_details" },
            { label: "Currently Under Care of Psychiatrist", field: "currently_undercare_of_psychiatrist_details" },
            { label: "Stopped Taking Psychiatric Medications", field: "stopped_taking_psychiatric_medication_details" },
            { label: "Side Effects from Psychiatric Medications", field: "side_effects_from_psychiatric_medication_details" },
            { label: "Consistent with Therapy/Medication Attendance", field: "consistent_with_attending_therapy_or_taking_medication_details" }
        ]
    }
};

const ClinicAppointmentHistory = () => {
    const [consultedPatientsData, setConsultedPatientsData] = useState([]);
    const [loadingConsultedPatientsData, setLoadingConsultedPatientsData] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const memoizedConsultedPatientsData = useMemo(() => consultedPatientsData, [consultedPatientsData]);

    const { user, token } = useAuthorization();

    const clinicID = user?.sid;
    const tokenContext = token;
    const clinicType = user?.stype;

    const columns = [
        "Clinic Name",
        "Full Name",
        "Email",
        "Address",
        "Appointment Date",
        "Appointment Time",
        "Phone Number",
        "Gender",
        "Status",
        "Actions"
    ]

    const dateFormat = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getStatusStyles = (status) => {
        const baseClasses = "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";

        switch (status?.toLowerCase()) {
            case "approved":
                return `${baseClasses} bg-green-100 text-green-800`;
            case "declined":
                return `${baseClasses} bg-red-100 text-red-800`;
            case "consulted":
                return `${baseClasses} bg-blue-100 text-blue-800`;
            case "cancelled":
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case "pending":
                return `${baseClasses} bg-gray-100 text-gray-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    }

    const formatTimeToAMPM = (time) => {
        if (!time) return "N/A";
        if (time.includes("AM") || time.includes("PM")) return time;

        try {
            const [hours, minutes] = time.split(":");
            let hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? "PM" : "AM";
            hour = hour % 12 || 12;
            return `${hour}:${minutes || "00"} ${ampm}`;
        } catch {
            return time;
        }
    };

    const retrieveAppointmentHistoryOfConsultedPatientsInClinicTable = useCallback(async () => {
        try {
            setLoadingConsultedPatientsData(true);

            const response = await CMS.get(`/cms.api.com/clinic/clinic-table-appointment-history`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                },
                params: {
                    clinicID: clinicID,
                    clinicType: clinicType
                }
            });

            if (response.status === 200) {
                const data = response.data.appointmentHistory;

                setConsultedPatientsData(data);
            } else {
                throw new Error(`Failed to retrieve the consulted appointment history`)
            }
        } catch (error) {
            console.error(`Failed functionality to retrieve the consulted patients appointment history in table: ${error}`);
        } finally {
            setLoadingConsultedPatientsData(false);
        }
    }, [clinicType, clinicID, tokenContext]);

    useEffect(() => {
        retrieveAppointmentHistoryOfConsultedPatientsInClinicTable();
    }, [retrieveAppointmentHistoryOfConsultedPatientsInClinicTable]);

    const filteredAppointments = useMemo(() => {
        if (!searchTerm) return memoizedConsultedPatientsData;
        const term = searchTerm.toLowerCase();
        return memoizedConsultedPatientsData.filter(apt =>
            Object.values(apt).some(
                val => String(val).toLowerCase().includes(term)
            )
        );
    }, [memoizedConsultedPatientsData, searchTerm]);

    const handleViewResults = (appointmentId) => {
        // Handle view results action
        console.log('View results for:', appointmentId);
    };

    return (
        <div className="p-4 md:p-6 max-w-dvw xl:max-w-dvw max-sm:max-w-2xl lg:min-w-4xl md:min-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Clinic Consulted Patients</h1>
                <p className="text-gray-600">View and manage patient appointment history</p>
            </div>

            {/* Search Bar */}
            <div className="mb-6 max-w-md">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search patients..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Responsive Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr className="text-center">
                                {columns.map((column, index) => (
                                    <th
                                        key={index}
                                        className="px-4 py-3 text-center text-xs font-medium text-gray-600 whitespace-nowrap uppercase tracking-wider"
                                    >
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loadingConsultedPatientsData ? (
                                <tr>
                                    <td colSpan={columns.length} className="py-4 px-6 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAppointments.length > 0 ? (
                                filteredAppointments.map((appointment, i) => (
                                    <tr key={i} className={`hover:bg-gray-50 ${i % 2 === 0 ? `bg-gray-50` : `bg-white`}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="text-sm font-medium text-gray-900">
                                                {appointment.clinic_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="text-sm font-medium text-gray-900">{appointment[clinicFieldConfigs[clinicType].patientInfo.firstName]} {appointment[clinicFieldConfigs[clinicType].patientInfo.lastName]}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="text-sm text-gray-900">{appointment[clinicFieldConfigs[clinicType].patientInfo.email]}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            {appointment[clinicFieldConfigs[clinicType].patientInfo.address]}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="text-sm text-gray-900 flex items-center justify-center">
                                                {dateFormat(appointment.appointment_date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="text-sm text-gray-500 flex items-center justify-center">
                                                {formatTimeToAMPM(appointment.appointment_time)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            <div className="text-sm text-gray-900">{appointment[clinicFieldConfigs[clinicType].patientInfo.phoneNumber]}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            <div className="text-sm text-gray-900">{appointment.gender}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            <span className={`${getStatusStyles(appointment.status)} px-2 py-1 rounded-full text-xs font-medium`}>
                                                {appointment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button
                                                onClick={() => handleViewResults(appointment.clinic_appointment_id)}
                                                className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Results
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No appointments found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination - Add your pagination component here */}
            <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of <span className="font-medium">20</span> results
                </div>
                <div className="flex space-x-2">
                    <button className="px-3 py-1 border rounded text-sm font-medium">Previous</button>
                    <button className="px-3 py-1 border rounded text-sm font-medium bg-black text-white">Next</button>
                </div>
            </div>
        </div>
    );
};

export default ClinicAppointmentHistory;