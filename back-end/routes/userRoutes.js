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
    verifyToken,
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
    getAppointmentHistoryInClinic
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
import upload from "../middleware/fileImage/clinicImage.js";

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
router.get("/patientsDashboard", getPatientsDashboard);

// router for retrieving the patients id details into input fields
router.get("/patientsDashboard/getBookedAppointments/:id", getBookedAppointments);

// router for booking the patients appointments
router.post("/patientsDashboard/patientsBookedAppointments", [validatePatientBookAppointment], patientsBookedAppointments);

// router for retrieving the patients booked appointments  to display in tables
router.get("/patientsDashboard/bookedAppointments", getPatientsAppointments);

// router for destroying the session of the patients account
router.get("/patientsDashboard/logout", logout)

// router for logging in doctors account
router.post("/loginDoctorsAccount", [doctorsLoginValidation], loginDoctorsAccount);

// router for destroying the session of the doctors account
router.get("/doctors-dashboard/logout", logout);

// router for updating the patients appointments
router.put("/doctors-dashboard/updateAppointment/:appointmentID", [validatePatientsDetails], updatePatientsAppointments);

// router for retrieving the clinic name and patient id to display in doctors dashboard
router.get("/doctors-dashboard/appointments/:clinicID", getBookedAppointmentsToDisplayInDoctorsDashboard);

// router for logging in as admin in CMS
router.post("/adminAccount", [adminLoginValidation], loginAdminAccount);

// router for destroying the session of the admin account
router.get("/admin-dashboard/logout", logout);

// router for adding a new doctor in the CMS admin dashboard
router.post("/admin-dashboard/addDoctor", [validateAddDoctor], addDoctor);

// router for getting the list of doctors in the CMS admin dashboard
router.get("/admin-dashboard/listOfDoctors", getDoctorsLists);

// router for updating the doctors details in admin dashboard
router.put("/admin-dashboard/updateDoctor/:doctorsID", [validateUpdatingDoctor], updateDoctorsDetails);

// router for delete the doctors details in admin dashboard
router.delete("/admin-dashboard/deleteDoctor/:doctorsID", deleteDoctorsDetails);

// router for creating a clinic in admin dashboard
router.post("/admin-dashboard/create-clinic", upload.single("clinicImage"), [validateCreateClinicDetails], createClinic);

// router for getting the clinic details in admin dashboard
router.get("/admin-dashboard/clinics", getClinics);

// router for filtering the clinic details in search field in patient's dashboard
router.get("/patients-dashboard/filter_search", filterClinicDetails)

// router for getting the pending status of the patients appointments
router.get("/patients-dashboard/getPatientPendingStatus/:email", getPatientPendingStatus);

// router for logging in the clinic account
router.post("/clinicLoggedInAccount", [doctorsLoginValidation], loggedInClinicAccount);

// router for getting the approved status of the patients appointments
router.get("/patients-dashboard/getPatientApprovedStatus/:email", getPatientApprovedStatus);

/*
    router for getting the declined status of patients appointments
*/
router.get("/patients-dashboard/getPatientDeclinedStatus/:email", getPatientsDeclinedStatus);

// router for getting the patients pending status to display in the table of clinics dashboard
router.get("/doctors-dashboard/getPatientPendingStatus/:clinicID", getPendingAppointmentStatus);

// router for getting the patients approved status to display in the table of clinics dashboard
router.get("/doctors-dashboard/getPatientApprovedStatus/:clinicID", getApprovedAppointmentStatusInClinic);

// router for getting the patients declined status to display in the table of clinics dashboard
router.get("/doctors-dashboard/getPatientDeclinedStatus/:clinicID", getDeclinedAppointmentStatusInClinic);

// router for retrieving the data of registered patients account to admin dashboard
router.get("/admin-dashboard/registeredPatientAccount", getRegisteredPatientsAccountInAdmin);

// router for updating the patient registered account in admin dashboard
router.put("/admin-dashboard/updateRegisteredPatientAccount/:patientID", updateRegisteredPatientsAccountInAdmin);

// router for inserting the patients consultation in the clinic dashboard then update the status in appointment table
router.post("/clinic-dashboard/consultPatient", consultPatientInClinicDashboard);

// router for getting the appointment history of the patients in clinic dashboard
router.get("/clinic-dashboard/getAppointmentHistory/:clinicID", getAppointmentHistoryInClinic);

export default router;