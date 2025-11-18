import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_UPLOAD_DIR = path.join(__dirname, "../../uploads", "medical_reports");

if (!fs.existsSync(BASE_UPLOAD_DIR)) {
    fs.mkdirSync(BASE_UPLOAD_DIR, { recursive: true });
}

/**
 * @exports function that retrieve the patient information then indicate the path for medical reports
 */
export const autoGenerateMedicalReportPath = async (patient) => {
    const timestamp = Date.now();
    
    // Handle different clinic types for patient name fields
    let firstName, lastName;
    
    if (patient.clinic_type === "Psychiatry Clinic") {
        firstName = patient.first_name || "patient";
        lastName = patient.last_name || " ";
    } else {
        // Default to Dental Clinic field names
        firstName = patient.patient_first_name || "patient";
        lastName = patient.patient_last_name || " ";
    }
    
    const sanitizeFirstName = firstName.replace(/[^a-zA-Z0-9]/g, "_");
    const sanitizeLastName = lastName.replace(/[^a-zA-Z0-9]/g, "_");

    const fileName = `Medical_Report_${sanitizeFirstName}_${sanitizeLastName}_${timestamp}.pdf`
    const relativePath = path.join("uploads", "medical_reports", fileName)
    const fullPath = path.join(BASE_UPLOAD_DIR, fileName);

    return {
        fileName,
        relativePath,
        fullPath
    }
}

export const saveMedicalReport = async (fileBuffer, pathInfo) => {
    try {
        await fs.promises.writeFile(pathInfo.fullPath, fileBuffer);
        return pathInfo.relativePath.replace(/\\/g, "/");
    } catch (error) {
        console.error(`Error saving medical report: ${error}`);
        throw new Error(`Failed to save medical report: ${error.message}`)
    }
}
