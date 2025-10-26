const config = {
    api: {
        baseURL: import.meta.env.VITE_ENV === "production"
            ?  import.meta.env.VITE_BASE_API_URL || "https://integratedclinicmanagement.vercel.app"
            : "http://localhost:7506"
    }
}

export default config