import express from "express"
import {CMS, registerPatientAccount, loginPatientsAccount, contactMessageManagement}from "../controllers/cms.js";
import validateRegister from "../middleware/validation.js";
import patientsLoginValidation from "../middleware/patientsLoginValidation.js";
import validateContacts from "../middleware/contact.validation.js";

const router = express.Router()

// router for CMS controller
router.get("/", CMS)

// route for registering patients account
router.post("/registerPatientsAccount", [validateRegister], registerPatientAccount)

// route for login patients account
router.post("/loginPatientsAccount", [patientsLoginValidation], loginPatientsAccount)

// router for contact us in landing page
router.post("/contactUs",  [contactMessageManagement], contactMessageManagement);

export default router;