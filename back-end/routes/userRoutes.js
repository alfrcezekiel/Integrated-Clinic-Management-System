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
} from "../controllers/cms.js";
import validateRegister from "../middleware/validation.js";
import patientsLoginValidation from "../middleware/patientsLoginValidation.js";
import validateContacts from "../middleware/contact.validation.js";
import validateAppointmentID from "../middleware/patientId.validation.js";

const router = express.Router();

// router for CMS controller
router.get("/", CMS);

// route for registering patients account
router.post("/registerPatientsAccount", [validateRegister], registerPatientAccount);

// route for login patients account
router.post("/loginPatientsAccount", [patientsLoginValidation], loginPatientsAccount);

// router for contact us in landing page
router.post("/contactUs", [validateContacts], contactMessageManagement);

router.get("/patientsDashboard", getPatientsDashboard);

// router for retrieving the patients id details into input fields
router.get("/patientsDashboard/getBookedAppointments/:id", getBookedAppointments);

// router for booking the patients appointments
router.post("/patientsDashboard/patientsBookedAppointments", patientsBookedAppointments);

// router for retrieving the patients booked appointments  to display in tables
router.get("/patientsDashboard/bookedAppointments", getPatientsAppointments);

// router for destroying the session
router.get("/patientsDashboard/logout", logout)

export default router;