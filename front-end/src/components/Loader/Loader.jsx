import { useState, useEffect } from "react";

export default function Loader() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, [])

    return (
        <>
            <div className="flex items-center justify-center h-screen bg-purple-100">
                {loading ? (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent border-solid rounded-full animate-spin"></div>
                        <p className="mt-2 text-purple-500">Loading</p>
                    </div>
                ) : (
                    <div className="text-xl font-semibold">Content Data Loaded</div>
                )}
            </div>
        </>
    )
}