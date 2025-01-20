import { useEffect } from "react";

function About(){
    useEffect(() => {
        document.title = "About";
    }, []);
    
    return (
        <div>
            <h1>About Integrated Clinic Management System</h1>
        </div>
    )
}

export default About;