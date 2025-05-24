import axios from "axios";

// create an axios instance named CMS
const CMS = axios.create({
    baseURL: "http://localhost:7506",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    withCredentials: true
});

// Add a request interceptor to include the token in the headers
CMS.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
)

CMS.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;

        if (response && response.status === 401) {
            console.warn(`Unauthorized access - ${response.statusText}`);
        } else if (response && response.status === 403) {
            console.warn(`Forbidden access - ${response.statusText}`);
        } else if (response && response.status === 404) {
            console.warn(`Not Found - ${response.statusText}`);
        } else if (response && response.status === 400) {
            console.warn(`Bad Request - ${response.statusText}`);
        } else {
            console.error(`Error - ${response.statusText}`);
        }

        return Promise.reject(error);
    }
)
export default CMS;