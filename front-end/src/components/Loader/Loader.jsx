import { useState, useEffect, useRef } from "react";
import "../../App.css";

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
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-700 via-purple-500 to-purple-700 z-[2000]">
                {loading && (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-amber-50 border-t-transparent border-solid rounded-full animate-spin"></div>
                        <p className="mt-2 text-white">Loading</p>
                    </div>
                )}
            </div>
        </>
    )
}