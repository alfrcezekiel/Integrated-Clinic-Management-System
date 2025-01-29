import { Link } from 'react-router-dom';
import "../App.css";

function PageNotAvailable() {
    return (
        <div>
            <h1>Page Not Available</h1>
            
            <Link to="/ICMS">Go to Home</Link>
        </div>
    )
}

export default PageNotAvailable;