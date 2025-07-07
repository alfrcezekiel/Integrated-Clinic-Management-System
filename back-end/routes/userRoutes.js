import express from "express";
import {
    CMS,
    registerPatientAccount,
    loginPatientsAccount,
    contactMessageManagement,
    getPatientsDashboard,
    getBookedAppointments,
    patientsBookedAppointments,
    getPatientsAppointments,
    logout,
    loginDoctorsAccount,
    updatePatientsAppointments,
    getBookedAppointmentsToDisplayInDoctorsDashboard,
    getLoggedInUser,
    requireLogin,
    loginAdminAccount,
    addDoctor,
    getDoctorsLists,
    updateDoctorsDetails,
    deleteDoctorsDetails,
    createClinic,
    getClinics,
    filterClinicDetails,
    getPatientPendingStatus,
    loggedInClinicAccount,
    getPatientApprovedStatus,
    getPatientsDeclinedStatus,
    getPendingAppointmentStatus,
    getApprovedAppointmentStatusInClinic,
    getDeclinedAppointmentStatusInClinic,
    getRegisteredPatientsAccountInAdmin,
    updateRegisteredPatientsAccountInAdmin,
    consultPatientInClinicDashboard,
    getAppointmentHistoryInClinic,
    addPatientPaymentInformation,
    retrievePatientDetailsInPaymentDialog,
    retrievedPaymentConfirmedDetails,
    cancelledPaymentDetails,
    validateStep,
    deleteRegisteredPatientAccount,
    verifyToken,
    consultationQuestionnaire,
    retrievedMedicalHistoryConsultationQuestionnaires,
    retrieveLifestyleInformationQuestionnaires,
    retrieveClinicalAssessmentQuestionnaires,
    retrieveOralHygieneQuestionnaires,
    cancelBookedAppointment,
    deleteBookedAppointment,
    addBookAppointmentInClinic,
    retrieveAllBookedAppointmentsOfClinic,
    calculateTotalBookedAppointmentsOfClinic,
    calculatePendingBookedAppointments,
    confirmTokenVerification,
    calculateApprovedBookedAppointments,
    calculateDeclinedBookedAppointments,
    retrievePendingBookedAppointments,
    createAdminAccount,
    refreshAccessToken,
    totalNumberOfRegisteredClinics,
    calculateRegisteredPatientsAccounts,
    calculateNumberOfAdminAccounts,
    calculateConsultedPatients,
    calculateCancelledBookedAppointments,
    calculateTotalBookedAppointmentsOfPatient,
    calculatePendingBookedAppointmentsOfPatient,
    calculateApprovedBookedAppointmentOfPatient,
    calculateConsultedBookedAppointmentOfPatient,
    calculateCancelledBookedAppointmentsOfPatient,
    calculateDeclinedBookedAppointmentsOfPatient,
    retrieveClinicByIdApprovedBookedAppointments,
    retrieveClinicByIdDeclinedBookedAppointments,
    findBookedAppointmentByIdToModifyBookedAppointmentDetails,
    deleteBookedAppointmentDetailsInClinicSideTable,
    sendResetEmail,
    resetPassword
} from "../controllers/cms.js";
import validateRegister from "../middleware/validation.js";
import patientsLoginValidation from "../middleware/patientsLoginValidation.js";
import validateContacts from "../middleware/contact.validation.js";
import validateAppointmentID from "../middleware/patientId.validation.js";
import doctorsLoginValidation from "../middleware/doctors.login.validation.js";
import adminLoginValidation from "../middleware/admin.validation.js";
import validateAddDoctor from "../middleware/addingdoctor.validation.js";
import validateUpdatingDoctor from "../middleware/updatingDoctor.validation.js";
import validatePatientBookAppointment from "../middleware/patientBookAppointmentValidation.js";
import validatePatientsDetails from "../middleware/updatePatientsDetailsValidation.js";
import validateCreateClinicDetails from "../middleware/ValidateCreateClinicDetails.js";
import validatePaymentFields from "../middleware/PaymentValidation/PaymentFieldValidation.js";
import validateQuestionnaires from "../middleware/ValidateQuestionnaires.js";
import validateBookAppointmentInClinic from "../middleware/ValidateBookAppointmentInClinic.js";
import validatePatientRegisteredAccount from "../middleware/ValidateRegisteredAccount/validate.patientregisteredaccount.js";
import validateCreatingAdminAccount from "../middleware/ValidateCreatingAdminAccount.js";
import clinicUploadedFiles from "../middleware/combinedUploads/clinicUploadedFiles.js";
import validateUploadedFiles from "../middleware/validateUploadedFiles.js";
import validateAllBookedAppointmentSpecificDetails from "../middleware/ModifyBookedAllBookedAppointmentValidation.js";

const router = express.Router();

// router for CMS controller
router.get("/", CMS);

// route for registering patients account
router.post("/registerPatientsAccount", [validateRegister], registerPatientAccount);

// route for login patients account
router.post("/loginPatientsAccount", [patientsLoginValidation], loginPatientsAccount);

// router for contact us in landing page
router.post("/contactUs", [validateContacts], contactMessageManagement);

// router for counting the number of patients registered
router.get("/patientsDashboard", verifyToken, getPatientsDashboard);

// router for retrieving the patients id details into input fields
router.get("/patientsDashboard/getBookedAppointments/:id", verifyToken, getBookedAppointments);

// router for booking the patients appointments
router.post("/patientsDashboard/patientsBookedAppointments", [validatePatientBookAppointment], patientsBookedAppointments);

// router for retrieving the patients booked appointments  to display in tables
router.get("/patientsDashboard/bookedAppointments/:email", verifyToken, getPatientsAppointments);

// router for destroying the session of the patients account
router.get("/patientsDashboard/logout", verifyToken, logout)

// router for logging in doctors account
router.post("/loginDoctorsAccount", [doctorsLoginValidation], loginDoctorsAccount);

// router for destroying the session of the doctors account
router.get("/doctors-dashboard/logout", verifyToken, logout);

// router for updating the patients appointments in clinic side
router.put("/doctors-dashboard/updateAppointment/:appointmentID", [validatePatientsDetails], updatePatientsAppointments);

// router for retrieving the clinic name and patient id to display in doctors dashboard
router.get("/doctors-dashboard/appointments/:clinicID", verifyToken, getBookedAppointmentsToDisplayInDoctorsDashboard);

// router for logging in as admin in CMS
router.post("/adminAccount", [adminLoginValidation], loginAdminAccount);

// router for destroying the session of the admin account
router.get("/admin-dashboard/logout", verifyToken, logout);

// router for adding a new doctor in the CMS admin dashboard
router.post("/admin-dashboard/addDoctor", [validateAddDoctor], addDoctor);

// router for getting the list of doctors in the CMS admin dashboard
router.get("/admin-dashboard/listOfDoctors", getDoctorsLists);

// router for updating the doctors details in admin dashboard
router.put("/admin-dashboard/updateDoctor/:doctorsID", [validateUpdatingDoctor], updateDoctorsDetails);

// router for delete the doctors details in admin dashboard
router.delete("/admin-dashboard/deleteDoctor/:doctorsID", deleteDoctorsDetails);

// router for creating a clinic in admin dashboard
router.post("/adminDashboard/createClinicAccount",clinicUploadedFiles, validateUploadedFiles, [validateCreateClinicDetails], createClinic);

// router for getting the clinic details in admin dashboard
router.get("/admin-dashboard/clinics", verifyToken, getClinics);

// router for filtering the clinic details in search field in patient's dashboard
router.get("/patients-dashboard/filter_search", verifyToken, filterClinicDetails)

// router for getting the pending status of the patients appointments
router.get("/patients-dashboard/getPatientPendingStatus/:email", verifyToken, getPatientPendingStatus);

// router for logging in the clinic account
router.post("/clinicLoggedInAccount", [doctorsLoginValidation], loggedInClinicAccount);

// router for getting the approved status of the patients appointments
router.get("/patients-dashboard/getPatientApprovedStatus/:email", verifyToken, getPatientApprovedStatus);

/*
    router for getting the declined status of patients appointments
*/
router.get("/patients-dashboard/getPatientDeclinedStatus/:email", verifyToken, getPatientsDeclinedStatus);

// router for getting the patients pending status to display in the table of clinics dashboard
router.get("/doctors-dashboard/getPatientPendingStatus/:clinicID", verifyToken, getPendingAppointmentStatus);

// router for getting the patients approved status to display in the table of clinics dashboard
router.get("/doctors-dashboard/getPatientApprovedStatus/:clinicID", verifyToken, getApprovedAppointmentStatusInClinic);

// router for getting the patients declined status to display in the table of clinics dashboard
router.get("/doctors-dashboard/getPatientDeclinedStatus/:clinicID", verifyToken, getDeclinedAppointmentStatusInClinic);

// router for retrieving the data of registered patients account to admin dashboard
router.get("/admin-dashboard/registeredPatientAccount", verifyToken, getRegisteredPatientsAccountInAdmin);

// router for updating the patient registered account in admin dashboard
router.put("/admin-dashboard/updateRegisteredPatientAccount/:patientID", [validatePatientRegisteredAccount], updateRegisteredPatientsAccountInAdmin);

// router for inserting the patients consultation in the clinic dashboard then update the status in appointment table
router.post("/clinic-dashboard/consultPatient", consultPatientInClinicDashboard);

// router for getting the appointment history of the patients in clinic dashboard
router.get("/clinic-dashboard/getAppointmentHistory/:clinicID", verifyToken, getAppointmentHistoryInClinic);

// router for session verification
router.get("/retrieveSession", requireLogin, getLoggedInUser);

// router for adding the payment information of the patients in patients dashboard
router.post("/patients-dashboard/payment", [validatePaymentFields], addPatientPaymentInformation);

// router for retrieving the patients details to populate the payment dialog box
router.get("/patients-dashboard/retrievedPatientDetails/:patientID", retrievePatientDetailsInPaymentDialog);

// router for getting the patients payment information to display in the confirmed payment dialog box
router.get("/patients-dashboard/retrievedConfirmedPaymentDetails/:patientID", retrievedPaymentConfirmedDetails);

// router for cancelling the payment information if the patientts cancel their payment
router.put("/patients-dashboard/cancelPaymentDetails/:paymentID", cancelledPaymentDetails);

// router for validating the steps in clinic side
router.post("/clinic-dashboard/validatePatientConsultation/:step", validateStep);

// router for deleting the patient register account in admin side
router.delete("/admin-dashboard/deleteRegisteredPatientAccount/:patientID", deleteRegisteredPatientAccount);

// router for inserting the consultation questionnaire in admin side
router.post("/admin-dashboard/submittedConsultationQuestionnaire", [validateQuestionnaires], consultationQuestionnaire);

// router for getting the consultation questionnaires in admin side
router.get("/clinic-dashboard/retrievedMedicalHistoryConsultationQuestionnaires/:clinicID", verifyToken, retrievedMedicalHistoryConsultationQuestionnaires);

// router for retrieving the lifestyle information questionnaires in admin side
router.get("/clinic-dashboard/retrieveLifestyleInformationQuestionnaires/:clinicID", verifyToken, retrieveLifestyleInformationQuestionnaires);

// route for retrieving the clinical assessment questionnaires in server
router.get("/clinic-dashboard/retrieveClinicalAssessmentQuestionnaires/:clinicID", verifyToken, retrieveClinicalAssessmentQuestionnaires);

// router for retriving the oral hygiene consultation questionnaires in server
router.get("/clinic-dashboard/retrieveOralHygieneConsultationQuestionnaires/:clinicID", verifyToken, retrieveOralHygieneQuestionnaires);

// router for cancelling the booked appointment in patient side
router.put("/patients-dashboard/cancelBookedAppointment/:appointmentID", cancelBookedAppointment);

// router for deleting the booked appointment information in clinic side
router.delete("/clinicDashboard/deleteBookedAppointment/:appointmentID", deleteBookedAppointment);

// router for adding a book appointment in the clinic side
router.post("/clinicDashboard/addBookedAppointment", [validateBookAppointmentInClinic], addBookAppointmentInClinic);

// router for retrieving all booked appointments of clinic side
router.get("/clinicDashboard/clinicBookedAppointments/:clinicID", verifyToken, retrieveAllBookedAppointmentsOfClinic);

// router for calculating the total booked appointments of specific clinic side
router.get("/clinicDashboard/calculateTotalBookedAppointments", verifyToken, calculateTotalBookedAppointmentsOfClinic);

// router for calculating the pending booked appointments of specific clinic side
router.get("/clinicDashboard/calculatePendingBookedAppointments", verifyToken, calculatePendingBookedAppointments);

// router for confirming the token verification
router.get("/confirmVerificationToken", verifyToken, confirmTokenVerification);

// router for calculating the approved booked appointments of specific clinic 
router.get("/clinicDashboard/calculateTotalNumberOfApprovedBookedAppointments", verifyToken, calculateApprovedBookedAppointments);

// router for calculating the declined booked appointments of specific clinic
router.get("/clinicDashboard/calculateTotalNumberOfDeclinedBookedAppointments", verifyToken, calculateDeclinedBookedAppointments);

// router for retrieving the pending booked appointments of specific clinic 
router.get("/clinicDashboard/clinic/retrievePendingBookedAppointments", verifyToken, retrievePendingBookedAppointments);

// router for creating a new admin account in admin side
router.post("/adminDashboard/createAdminAccount", [validateCreatingAdminAccount], createAdminAccount);

// router for refreshing the access token
router.get("/refreshAccessToken", refreshAccessToken);

/**
 * @exports router for calculating the total number of registered clinics in admin side
 */
router.get("/adminDashboard/totalNumberOfRegisteredClinics", verifyToken, totalNumberOfRegisteredClinics);

/**
 * @exports router for calculating the number of registered patients account in admin side
 */
router.get("/adminDashboard/totalNumberOfRegisteredPatientsAccounts", verifyToken, calculateRegisteredPatientsAccounts);

/**
 * @exports router for calculating the admin accounts in admin side
 */

router.get("/adminDashboard/totalNumberOfAdminAccounts", verifyToken, calculateNumberOfAdminAccounts);

/**
 * @exports router for calculating the consulted patients in specific clinic side
 */
router.get(`/clinicDashboard/calculatedConsultedPatients`, verifyToken, calculateConsultedPatients);

/**
 * @exports router for calculating the cancelled booked appointment in specific clinic side
 */

router.get("/clinicDashboard/calculateCancelledBookedAppointments", verifyToken, calculateCancelledBookedAppointments);

/**
 * exports router for calculating all booked appointments of specific patient account
 */

router.get("/patient/dashboard/calculateAllBookedAppointments", verifyToken, calculateTotalBookedAppointmentsOfPatient);

/**
 * @exports router for calculating the pending booked appontments of specific patient account
 */
router.get("/patient/dashboard/calculatePendingBookedAppointments", verifyToken, calculatePendingBookedAppointmentsOfPatient);

/**
 * @exports router for calculating the approved booked appointmnet of specific patient account
 */
router.get("/patient/dashboard/calculateApprovedBookedAppointment", verifyToken, calculateApprovedBookedAppointmentOfPatient);

/**
 * @exports router for calculating the consulted patients in specifc patient account
 */

router.get("/patient/dashboard/calculateConsultedPatients", verifyToken, calculateConsultedBookedAppointmentOfPatient);

/**
 * @exports router for calculating the cancelled booked appointment in specific patient account
 */

router.get("/patient/dashboard/calculateCancelledBookedAppointments", verifyToken, calculateCancelledBookedAppointmentsOfPatient);

/**
 * @exports router for calculating the declined booked appointment in specific patient account
 */

router.get("/patient/dashboard/calculateDeclinedBookedAppointments", verifyToken, calculateDeclinedBookedAppointmentsOfPatient);

/**
 * @exports router for retrieving the approved booked appointment to render in clinic side table
 */
router.get("/clinic/dashboard/retrieveApprovedBookedAppointments", verifyToken, retrieveClinicByIdApprovedBookedAppointments);

/**
 * @exports router for retrieving the declined booked appointment to render in clinic side table
 */
router.get("/clinic/dashboard/retrieveDeclinedBookedAppointments", verifyToken, retrieveClinicByIdDeclinedBookedAppointments);

/**
 * @exports router to modify booked appointments details in clinic side table in specific booked appointment details
 */
router.put("/cms.api.com/clinic/dashboard/modifyBookedAppointmentDetails", verifyToken, [validateAllBookedAppointmentSpecificDetails], findBookedAppointmentByIdToModifyBookedAppointmentDetails);

/**
 * @exports router to delete specific booked appointments details in all booked appointment clinic side table
 */
router.delete("/cms.api.com/clinic/dashboard/deleteBookedAppointmentInClinicSideTable", verifyToken, deleteBookedAppointmentDetailsInClinicSideTable);

/**
 * @exports router to send a reset password link in the patient and clinic side
 */
router.post("/cms.api.com/sendResetEmail", sendResetEmail);

/**
 * @exports router to reset password in the patient and clinic side
 */
router.post("/cms.api.com/resetPassword", resetPassword);

export default router;