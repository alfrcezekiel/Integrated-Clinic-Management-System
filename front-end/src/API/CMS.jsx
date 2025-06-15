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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
}

CMS.interceptors.response.use((response) => response,
    async (error) => {
        const { config, response} = error;

        const originalRequest = config;
        if(response && response.status === 401 && !originalRequest._retry) {
            if(isRefreshing){
                return new Promise((resolve, reject) => {
                    failedQueue.push({resolve, reject})
                })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return CMS(originalRequest);
                })
                .catch((error) => Promise.reject(error));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshTokenResponse = await CMS.get(`/CMS/refreshAccessToken`, {
                    withCredentials: true,
                });

                if(response.status === 401 && refreshTokenResponse.status === 200) {
                    const newAccessToken = refreshTokenResponse.data.token;
                    localStorage.setItem("authToken", newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    
                    // Process the queue with the new token
                    processQueue(null, newAccessToken);
                    
                    return CMS(originalRequest);
                } else {    
                    // If the refresh token request fails, reject the queue
                    processQueue(new Error("Refresh token request failed"), null);
                    return Promise.reject(new Error("Refresh token request failed"));
                }
            } catch (refreshTokenError)  {
                isRefreshing = false;
                processQueue(refreshTokenError, null);
                localStorage.removeItem("authToken");
                window.location.href = "/cms"
                return Promise.reject(refreshTokenError);
            } finally {
                isRefreshing = false;
            }
        }

        // return Promise.reject(error);

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