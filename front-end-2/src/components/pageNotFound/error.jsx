import { useNavigate } from "react-router-dom"
function PageNotFound(){
    const navigate = useNavigate();
    
    return (
        <div>
            <h1>404 Page Not Found</h1>
            <p>Sorry, the page you are looking for does not exist.</p>
            <button onClick={() => navigate("/cms")}>Back to Home</button>
        </div>  
    )
}

export default PageNotFound;