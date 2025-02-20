import axios from "axios";

const EndpointURI = axios.create({
    baseURL: "http://localhost:2140",
    timeout: 1000,
    headers: {
        "Content-Type": "application/json",
    }
});

EndpointURI.interceptors.request.use((config) => {
    console.log(`Request send to ${config.url} with method ${config.method}`);
    return config;
    },
    (error) => {
        console.error(`Error in sending request: ${error}`);
        return Promise.reject(error);
    }
)

EndpointURI.interceptors.response.use((response) => {
    console.log(`Response received from the server ${response.config.url}`);
    return response;
}, (error) => {
    console.error(`Error in receiving response: ${error}`);
    return Promise.reject(error);
})

export default EndpointURI;