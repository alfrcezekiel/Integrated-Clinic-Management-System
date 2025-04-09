import axios from "axios"

// create a axios instance name CMS
const CMS = axios.create({
    baseURL: "http://localhost:7506",
    timeout: 1000,
    headers: {
        "Content-Type": "application/json"
    }
})

export default CMS