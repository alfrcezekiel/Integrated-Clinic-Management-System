import TextField from "@mui/material/TextField";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import {
    IconButton,
    InputAdornment,
    OutlinedInput,
    FormHelperText
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CMS from "../../API/CMS";
import { useAuthorization } from "../../context/auth/useAuthorization";
import { useSelector, useDispatch } from "react-redux";
import { updateField, resetForm } from "../../features/clinicForm/CreateClinicAccountSlice";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const CreateClinicAccount = () => {
    const clinicFormData = useSelector((state) => state.createClinicAccount);
    const dispatch = useDispatch();
    const [clinicImage, setClinicImage] = useState(null);
    const [clinicLtoFile, setClinicLtoFile] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({
        clinicName: "",
        clinicAddress: "",
        clinicEmail: "",
        clinicImage: null,
        ltoFile: null,
        clinicPhoneNumber: "",
        openingDays: "",
        closingDays: "",
        openingHours: null,
        closingHours: null,
        consultationFee: "",
        clinicType: "",
        password: "",
        confirmPassword: ""
    });
    const [submitting, setSubmitting] = useState(false);

    const location = useLocation();
    const clinicAccountState = location.state?.clinicAccountState
    const uploadClinicImageRef = useRef(null);
    const uploadLtoFileRef = useRef(null);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { token, user } = useAuthorization();
    const tokenContext = token;
    const clinic_id = user?.sid;

    useEffect(() => {
        if (!clinicAccountState) {
            dispatch(resetForm());
            setFieldErrors({})
            uploadClinicImageRef.current.value = "";
            uploadLtoFileRef.current.value = "";
            setClinicImage(null)
            setClinicLtoFile(null)
        }
    }, [clinicAccountState, dispatch]);

    const handleClickShowPassword = () => {
        setShowPassword((show) => !show);
    }

    const handleMouseDownPassword = (e) => {
        e.preventDefault();
    }

    const handleMouseUpPassword = (e) => {
        e.preventDefault();
    }

    const handleClickConfirmShowPassword = () => {
        setShowConfirmPassword((show) => !show);
    }

    const handleMouseDownConfirmPassword = (e) => {
        e.preventDefault();
    }

    // function to handle changes in uploading clinic image file
    const handleFileImageChange = async (e) => {
        const file = e.target.files[0];
        // const MAX_SIZE = 5 * 1024 * 1024; // 5MB

        // const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        // if (!file) {
        //     setFieldErrors((prev) => ({
        //         ...prev,
        //         clinicImage: "Clinic image is required",
        //     }))
        //     return;
        // }

        // if (!allowedMimeTypes.includes(file.type)) {
        //     setFieldErrors((prev) => ({
        //         ...prev,
        //         clinicImage: "Invalid file type. Only JPEG, PNG, JPG, and WEBP are allowed.",
        //     }))
        //     return;
        // }

        // if (file.size > MAX_SIZE) {
        //     setFieldErrors((prev) => ({
        //         ...prev,
        //         clinicImage: "File size exceeds 5MB",
        //     }))
        //     return;
        // }

        setClinicImage(file);
        setFieldErrors((prev) => ({
            ...prev,
            clinicImage: "",
        }))
    }

    // function to handle changes in uploading LTO document file
    const handleLTOFileChange = async (e) => {
        const file = e.target.files[0];
        // const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        // const allowedMimeType = [
        //     "application/pdf",
        //     "application/msword",
        //     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        //     "application/vnd.ms-excel"
        // ]

        // if (!file) {
        //     setFieldErrors((prev) => ({
        //         ...prev,
        //         ltoFile: "Please select an LTO document"
        //     }))
        //     return;
        // }

        // if (!allowedMimeType.includes(file.type)) {
        //     setFieldErrors((prev) => ({
        //         ...prev,
        //         ltoFile: "Invalid file type. Only PDF, DOC, DOCX, XLS, and XLSX are allowed."
        //     }))
        //     return;
        // }

        // if (file.size > MAX_SIZE) {
        //     setFieldErrors((prev) => ({
        //         ...prev,
        //         ltoFile: "File size exceeds 10MB"
        //     }))
        //     return;
        // }

        setClinicLtoFile(file);
        setFieldErrors((prev) => ({
            ...prev,
            ltoFile: ""
        }))
    };

    const handleMouseUpConfirmPassword = (e) => {
        e.preventDefault();
    }

    // this function handles changes in the text fields
    const handleTextFieldChange = async (e) => {
        const { name, value } = e.target;
        const fieldValue = value

        dispatch(updateField({
            field: name,
            value: fieldValue
        }))

        if (fieldErrors[name]) {
            setFieldErrors((prevState) => ({
                ...prevState,
                [name]: "",
            }));
        }
    }

    // this function handles changes in the time picker fields
    // specifically for opening and closing hours
    const handleTimePickerChange = (field, value) => {
        dispatch(updateField({
            field,
            value: value
        }));

        if (fieldErrors[field]) {
            setFieldErrors((prevState) => ({
                ...prevState,
                [field]: "",
            }));
        }
    }

    // this function handles the submission of the clinic account registration form
    const submitCreatedClinicAccount = async (e) => {
        try {
            e.preventDefault();

            if (submitting) return;
            setSubmitting(true);

            const formData = new FormData();

            const formattedOpeningHours = clinicFormData.openingHours ? dayjs(clinicFormData.openingHours).format("hh:mm A") : "";
            const formattedClosingHours = clinicFormData.closingHours ? dayjs(clinicFormData.closingHours).format("hh:mm A") : "";

            for (const key in clinicFormData) {
                /**
                 * This loop appends all the fields in the clinicFormData object to the formData object
                 * except for the openingHours and closingHours fields
                 */
                if (Object.prototype.hasOwnProperty.call(clinicFormData, key) && key !== "openingHours" && key !== "closingHours") {
                    formData.append(key, clinicFormData[key]);
                }
            }

            formData.append("openingHours", formattedOpeningHours);
            formData.append("closingHours", formattedClosingHours);
            if (clinicImage) {
                formData.append("clinicImage", clinicImage);
            }

            if (clinicLtoFile) {
                formData.append("ltoFile", clinicLtoFile);
            }

            formData.append("adminID", clinic_id)

            const response = await CMS.post("/adminDashboard/createClinicAccount", formData, {
                headers: {
                    "Authorization": `Bearer ${tokenContext}`,
                    "Content-Type": "multipart/form-data"
                }
            })

            if (response.status === 200) {
                alert("Clinic account created successfully!");
                dispatch(resetForm());
                if (uploadClinicImageRef.current) uploadClinicImageRef.current.value = "";
                if (uploadLtoFileRef.current) uploadLtoFileRef.current.value = "";
                setClinicImage(null);
                setClinicLtoFile(null);
                navigate("/admin-dashboard/AddClinic");
            } else {
                throw new Error(`Failed to create clinic account: ${response.statusText}`);
            }
        } catch (error) {
            if (error.response && error.response.data.errors && error.response.data && error.response.status === 400) {
                const errors = error.response.data.errors;

                setFieldErrors(errors);
            }
            console.error("Error creating clinic account in this component:", error);
        } finally {
            setSubmitting(false);
        }
    }

    const clinicDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ]

    const consultationFee = [
        100,
        200,
        300,
        400,
        500,
        600,
        700,
        800,
        900,
        1000
    ]

    const clinicType = [
        "Orthopedic Clinic",
        "Dental Clinic",
        "Pyschiatry Clinic",
    ]

    return (
        <div className="p-4 min-h-screen flex justify-center items-center">
            <div className="min-w-2/4 flex flex-col rounded-4xl shadow-2xl p-8">
                <div className="text-center font-semibold text-md">
                    <h4 className="text-black font-semibold text-xl">Clinic Registration Account</h4>
                    <p className="text-gray-600 mt-2">Create a new clinic account</p>
                </div>
                <div className="block flex-1/2 my-auto mx-auto p-4 w-full">
                    <form className="flex-col space-y-4" autoComplete="off" onSubmit={submitCreatedClinicAccount}>
                        <div className="min-w-3/4 p-6 rounded-2xl shadow-lg bg-white">
                            <div className="mb-4">
                                <span className="text-lg text-gray-700 font-semibold">Clinic Information</span>
                            </div>
                            <div className="flex-col">
                                <label className="text-gray-900">Clinic Name</label>
                                <TextField
                                    label="Clinic Name"
                                    variant="outlined"
                                    fullWidth
                                    placeholder="Enter Clinic Name"
                                    autoComplete="off"
                                    name="clinicName"
                                    type="text"
                                    value={clinicFormData.clinicName}
                                    margin="dense"
                                    onChange={handleTextFieldChange}
                                    error={!!fieldErrors.clinicName}
                                    helperText={fieldErrors.clinicName || ""}
                                />
                            </div>
                            <div className="flex-col">
                                <label className="text-gray-700 font-semibold">
                                    Address
                                </label>
                                <TextField
                                    label="Address"
                                    margin="dense"
                                    fullWidth
                                    value={clinicFormData.clinicAddress}
                                    placeholder="Enter Address"
                                    autoComplete="off"
                                    type="text"
                                    onChange={handleTextFieldChange}
                                    name="clinicAddress"
                                    variant="outlined"
                                    error={!!fieldErrors.clinicAddress}
                                    helperText={fieldErrors.clinicAddress || ""}
                                />
                            </div>
                            <div className="flex-col">
                                <label className="text-gray-700 font-semibold">
                                    Phone Number
                                </label>
                                <TextField
                                    fullWidth
                                    placeholder="Enter Phone Number"
                                    name="clinicPhoneNumber"
                                    value={clinicFormData.clinicPhoneNumber}
                                    variant="outlined"
                                    onChange={handleTextFieldChange}
                                    margin="dense"
                                    label="Phone Number"
                                    type="text"
                                    error={!!fieldErrors.clinicPhoneNumber}
                                    helperText={fieldErrors.clinicPhoneNumber || ""}
                                    autoComplete="off"
                                />
                            </div>
                            <div className="flex-col space-y-2">
                                <label className="font-semibold text-gray-700">
                                    Email
                                </label>
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    value={clinicFormData.clinicEmail}
                                    variant="outlined"
                                    onChange={handleTextFieldChange}
                                    error={!!fieldErrors.clinicEmail}
                                    helperText={fieldErrors.clinicEmail || ""}
                                    type="text"
                                    label="Email"
                                    placeholder="Enter Email Address"
                                    name="clinicEmail"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="flex-col">
                                <label htmlFor="clinicImage" className="font-semibold text-gray-700">
                                    Upload Image
                                </label>
                                <input
                                    className="block w-full text-sm text-gray-700 border mt-2 border-gray-300 rounded-lg cursor-pointer focus:outline-none p-4"
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    onChange={handleFileImageChange}
                                    name="clinicImage"
                                    ref={uploadClinicImageRef}
                                    placeholder="Upload Clinic Image"
                                    autoComplete="off"
                                />
                                {fieldErrors.clinicImage && (
                                    <FormHelperText error className="mt-1 text-sm text-red-600">
                                        {fieldErrors.clinicImage}
                                    </FormHelperText>
                                )}
                            </div>
                            <div className="flex-col">
                                <label htmlFor="ltoFile" className="font-semibold text-gray-700">
                                    License To Operate (LTO) Document
                                </label>
                                <input
                                    className="block w-full text-sm text-gray-700 border mt-2 border-gray-300 rounded-lg cursor-pointer focus:outline-none p-4"
                                    type="file"
                                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                                    name="ltoFile"
                                    ref={uploadLtoFileRef}
                                    onChange={handleLTOFileChange}
                                    autoComplete="off"
                                    placeholder="Upload License To Operate (LTO) Document"
                                />
                                {fieldErrors.ltoFile && (
                                    <FormHelperText error className="mt-1 text-sm text-red-600">
                                        {fieldErrors.ltoFile}
                                    </FormHelperText>
                                )}
                            </div>
                        </div>
                        <div className="min-w-3/4 p-6 rounded-2xl shadow-lg bg-white">
                            <div className="mb-4">
                                <span className="text-lg font-semibold text-gray-700">Clinic Scheduling</span>
                            </div>
                            <div className="flex-col">
                                <label className="font-semibold text-gray-700">
                                    Opening Days
                                </label>
                                <Box className="mt-2">
                                    <FormControl fullWidth>
                                        <InputLabel id="opening-days">Opening Days</InputLabel>
                                        <Select
                                            labelId="opening-days"
                                            label="Opening Days"
                                            name="openingDays"
                                            margin="dense"
                                            variant="outlined"
                                            onChange={handleTextFieldChange}
                                            className="w-full"
                                            value={clinicFormData.openingDays}
                                            autoComplete="off"
                                        >
                                            {clinicDays.map((day, index) => (
                                                <MenuItem key={index} value={day}>
                                                    {day}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldErrors.openingDays && (
                                            <FormHelperText error>
                                                {fieldErrors.openingDays}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Box>
                            </div>
                            <div className="flex-col">
                                <label className="font-semibold text-gray-700">
                                    Closing Days
                                </label>
                                <Box className="mt-2">
                                    <FormControl fullWidth>
                                        <InputLabel id="closing-days">Closing Days</InputLabel>
                                        <Select
                                            labelId="closing-days"
                                            label="Closing Days"
                                            onChange={handleTextFieldChange}
                                            className="w-full"
                                            name="closingDays"
                                            value={clinicFormData.closingDays}
                                            margin="dense"
                                            variant="outlined"
                                            autoComplete="off"
                                        >
                                            {clinicDays.map((day, index) => (
                                                <MenuItem key={index} value={day}>
                                                    {day}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldErrors.closingDays && (
                                            <FormHelperText error>
                                                {fieldErrors.closingDays}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Box>
                            </div>
                            <div className="flex-col">
                                <label className="font-semibold text-gray-700">
                                    Opening Hours
                                </label>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['TimePicker']}>
                                        <TimePicker
                                            label="Opening Hours"
                                            className="w-full"
                                            name="openingHours"
                                            value={clinicFormData.openingHours}
                                            onChange={(value) => handleTimePickerChange("openingHours", value)}
                                            slotProps={{
                                                textField: {
                                                    margin: "dense",
                                                    autoComplete: "off",
                                                    error: !!fieldErrors.openingHours,
                                                    helperText: fieldErrors.openingHours || ""
                                                }
                                            }}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </div>
                            <div className="flex-col">
                                <label className="font-semibold text-gray-700">
                                    Closing Hours
                                </label>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['TimePicker']}>
                                        <TimePicker
                                            label="Closing Hours"
                                            className="w-full"
                                            onChange={(value) => handleTimePickerChange("closingHours", value)}
                                            value={clinicFormData.closingHours}
                                            name="closingHours"
                                            slotProps={{
                                                textField: {
                                                    margin: "dense",
                                                    error: !!fieldErrors.closingHours,
                                                    helperText: fieldErrors.closingHours || "",
                                                    autoComplete: "off"
                                                }
                                            }}
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </div>
                            <div className="flex-col">
                                <label className="font-semibold text-gray-700">
                                    Consultation Fee
                                </label>
                                <Box className="mt-2">
                                    <FormControl fullWidth>
                                        <InputLabel id="consultation-fee">Consultation Fee</InputLabel>
                                        <Select
                                            labelId="consultation-fee"
                                            label="Consultation Fee"
                                            onChange={handleTextFieldChange}
                                            name="consultationFee"
                                            margin="dense"
                                            value={clinicFormData.consultationFee}
                                            className="w-full"
                                            variant="outlined"
                                            autoComplete="off"
                                        >
                                            {consultationFee.map((fee, index) => (
                                                <MenuItem key={index} value={fee}>
                                                    ₱ {fee}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldErrors.consultationFee && (
                                            <FormHelperText error>
                                                {fieldErrors.consultationFee}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Box>
                            </div>
                            <div className="flex-col">
                                <label className="font-semibold text-gray-700">
                                    Clinic Type
                                </label>
                                <Box className="mt-2">
                                    <FormControl fullWidth>
                                        <InputLabel id="clinic-type">Clinic Type</InputLabel>
                                        <Select
                                            labelId="clinic-type"
                                            label="Clinic Type"
                                            name="clinicType"
                                            value={clinicFormData.clinicType}
                                            className="w-full"
                                            margin="dense"
                                            variant="outlined"
                                            onChange={handleTextFieldChange}
                                            autoComplete="off"
                                        >
                                            {clinicType.map((type, index) => (
                                                <MenuItem key={index} value={type}>
                                                    {type}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldErrors.clinicType && (
                                            <FormHelperText error>
                                                {fieldErrors.clinicType}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Box>
                            </div>
                        </div>
                        <div className="min-w-3/4 p-6 rounded-2xl shadow-lg bg-white">
                            <div className="mb-4">
                                <span className="text-lg font-semibold text-gray-700">Create Password</span>
                            </div>
                            <div className="flex-col">
                                <label className="font-semibold text-gray-700">
                                    Password
                                </label>
                                <FormControl variant="outlined" className="w-full" sx={{ marginTop: "0.5rem" }}>
                                    <InputLabel htmlFor="create-clinic-account-1">Password</InputLabel>
                                    <OutlinedInput
                                        placeholder="Enter password"
                                        id="create-clinic-account"
                                        name="password"
                                        autoComplete="off"
                                        onChange={handleTextFieldChange}
                                        value={clinicFormData.password}
                                        margin="dense"
                                        error={Boolean(fieldErrors.password)}
                                        type={showPassword ? "text" : "password"}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label={
                                                        showPassword ? 'hide the password' : 'display the password'
                                                    }
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    onMouseUp={handleMouseUpPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        fullWidth
                                        label="Password"
                                    />
                                    {fieldErrors.password && <FormHelperText error>{fieldErrors.password}</FormHelperText>}
                                </FormControl>
                            </div>
                            <div className="flex-col">
                                <label className="font-semibold text-gray-700">
                                    Confirm Password
                                </label>
                                <FormControl variant="outlined" className="w-full" sx={{ marginTop: "0.5rem" }}>
                                    <InputLabel htmlFor="clinic-account-2">Confirm Password</InputLabel>
                                    <OutlinedInput
                                        placeholder="Enter confirm password"
                                        id="clinic-account-2"
                                        name="confirmPassword"
                                        autoComplete="off"
                                        value={clinicFormData.confirmPassword}
                                        margin="dense"
                                        onChange={handleTextFieldChange}
                                        error={Boolean(fieldErrors.confirmPassword)}
                                        type={showConfirmPassword ? "text" : "password"}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label={
                                                        showConfirmPassword ? 'hide the password' : 'display the password'
                                                    }
                                                    onClick={handleClickConfirmShowPassword}
                                                    onMouseDown={handleMouseDownConfirmPassword}
                                                    onMouseUp={handleMouseUpConfirmPassword}
                                                    edge="end"
                                                >
                                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        fullWidth
                                        label="Confirm Password"
                                    />
                                    {fieldErrors.confirmPassword && <FormHelperText error>{fieldErrors.confirmPassword}</FormHelperText>}
                                </FormControl>
                            </div>
                        </div>
                        <div className="block">
                            <button
                                type="submit"
                                className="cursor-pointer w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                <span className="text-white">{submitting ? "Loading..." : "Register Account"}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateClinicAccount;