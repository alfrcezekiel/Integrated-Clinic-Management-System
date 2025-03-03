import express from "express"
import {CMS, registerPatientAccount}from "../controllers/cms.js";
import validateRegister from "../middleware/validation.js";

const router = express.Router()

router.get("/", CMS)

router.post("/registerPatientsAccount", [validateRegister], registerPatientAccount)

export default router;