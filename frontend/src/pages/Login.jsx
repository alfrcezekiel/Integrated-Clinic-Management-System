import { useEffect } from "react";
function Login(){
    useEffect(() => {
        document.title = "Login Account";
    }, []);

    return (
        <div>
            <div>
                <h1>Login Account</h1>
            </div>
        </div>
    )
}

export default Login;