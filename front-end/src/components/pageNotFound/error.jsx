import { useNavigate } from "react-router-dom"
function PageNotFound(){
    const navigate = useNavigate();
    
    return (
        <div className="flex justify-center items-center flex-col">
            <h1 className="text-center text-black italic">404 Page Not Found</h1>
            <p>Sorry, the page you are looking for does not exist.</p>
            <button onClick={() => navigate("/cms")}>Back to Home</button>
        </div>  
    )
}

export default PageNotFound;