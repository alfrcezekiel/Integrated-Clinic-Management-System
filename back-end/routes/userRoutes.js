import express from "express"
import {CMS}from "../controllers/cms.js";

const router = express.Router()

router.get("/", CMS)

export default router;