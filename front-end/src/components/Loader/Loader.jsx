import { useState, useEffect, useRef} from "react";

export default function Loader() {
    const [loading, setLoading] = useState(true);
    const ref = useRef(0);

    useEffect(() => {
        const scrollToTop = () => {
            ref.current = window.scrollY;
            document.body.style.overflow = "hidden";

            const timer = setTimeout(() => {
                document.body.style.overflow = "auto";
                window.scrollTo(0, ref.current);
            }, 2000);
    
            return () => {
                clearTimeout(timer);
            }
        }
        scrollToTop();

        const timer = setTimeout(() => setLoading(false), 2000);
        return () => {
            clearTimeout(timer);
        }
        

    }, [])

    return (
        <>
            <div className="flex items-center justify-center h-screen bg-purple-400">
                {loading ? (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent border-solid rounded-full animate-spin"></div>
                        <p className="mt-2 text-purple-500">Loading</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent border-solid rounded-full"></div>
                        <p className="mt-2 text-white-200">Loading</p>
                    </div>
                )}
            </div>
        </>
    )
}