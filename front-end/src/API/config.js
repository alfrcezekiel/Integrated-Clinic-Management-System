// Ensure environment variables are properly loaded
const env = import.meta.env;

const config = {
    api: {
        baseURL: env.VITE_ENV === "production"
            ? env.VITE_BASE_API_URL || window.location.origin
            : "http://localhost:7506"
    }
};

// Log the config in development for debugging
if (env.VITE_ENV !== "production") {
    console.log("API Configuration:", config);
}

export default config;