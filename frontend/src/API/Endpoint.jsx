import axios from "axios";

const EndpointURI = axios.create({
    baseURL: "http://localhost:2140",
    timeout: 1000,
    headers: {
        "Content-Type": "application/json",
    }
});

export default EndpointURI;