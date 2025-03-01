import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import "../../assets/css/main.css";
import {Link} from "react-router-dom";

const PatientsPortals = () => {
    return (
        <section className="m-8 flex">
            <div className="w-2/5 h-full hidden lg:block">
                <img
                    className="h-full w-full object-cover rounded-3xl"
                    src="/img/pattern.png"
                />
            </div>
            <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
                <div className="text-center">
                    <Typography variant="h2" className="font-bold mb-4">Patients Register Portal</Typography>
                </div>
                <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
                    <div className="mb-1 flex flex-col gap-6">
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">First Name</Typography>
                        <TextField
                            size="lg"
                            label="Enter your First Name"
                            variant="outlined"
                            type="text"
                        />
                    </div>
                    <div className="mb-1 flex flex-col gap-6">
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">Last Name</Typography>
                        <TextField
                            size="lg"
                            label="Enter your Last Name"
                            variant="outlined"
                            type="text"
                        />
                    </div>
                    <div className="mb-1 flex flex-col gap-6">
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">Email</Typography>
                        <TextField
                            size="lg"
                            label="Enter your Email"
                            variant="outlined"
                            type="text"
                        />
                    </div>
                    <div className="mb-1 flex flex-col gap-6">
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">Phone Number</Typography>
                        <TextField
                            size="lg"
                            label="Enter your Phone Number"
                            variant="outlined"
                            type="number"
                        />
                    </div>
                    <div className="mb-1 flex flex-col gap-6">
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">Password</Typography>
                        <TextField
                            size="lg"
                            label="Enter your Password"
                            variant="outlined"
                            type="password"
                        />
                    </div>
                    <div className="mb-1 flex flex-col gap-6">
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">Confirm Password</Typography>
                        <TextField
                            size="lg"
                            label="Confirm your Password"
                            variant="outlined"
                            type="password"
                        />
                    </div>
                    <div className="mt-8 flex flex-col gap-6 bg-black rounded-2xl p-[0.50rem] text-red-200">
                        <Button className="mt-9" fullWidth size="lg">
                            Register
                        </Button>
                    </div>
                    <div className="space-y-4 mt-8">
                        <Button className="flex items-center gap-2 justify-center shadow-md" fullWidth variant="outlined" size="lg" color="white">
                            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_1156_824)">
                                    <path d="M16.3442 8.18429C16.3442 7.64047 16.3001 7.09371 16.206 6.55872H8.66016V9.63937H12.9813C12.802 10.6329 12.2258 11.5119 11.3822 12.0704V14.0693H13.9602C15.4741 12.6759 16.3442 10.6182 16.3442 8.18429Z" fill="#4285F4" />
                                    <path d="M8.65974 16.0006C10.8174 16.0006 12.637 15.2922 13.9627 14.0693L11.3847 12.0704C10.6675 12.5584 9.7415 12.8347 8.66268 12.8347C6.5756 12.8347 4.80598 11.4266 4.17104 9.53357H1.51074V11.5942C2.86882 14.2956 5.63494 16.0006 8.65974 16.0006Z" fill="#34A853" />
                                    <path d="M4.16852 9.53356C3.83341 8.53999 3.83341 7.46411 4.16852 6.47054V4.40991H1.51116C0.376489 6.67043 0.376489 9.33367 1.51116 11.5942L4.16852 9.53356Z" fill="#FBBC04" />
                                    <path d="M8.65974 3.16644C9.80029 3.1488 10.9026 3.57798 11.7286 4.36578L14.0127 2.08174C12.5664 0.72367 10.6469 -0.0229773 8.65974 0.000539111C5.63494 0.000539111 2.86882 1.70548 1.51074 4.40987L4.1681 6.4705C4.8001 4.57449 6.57266 3.16644 8.65974 3.16644Z" fill="#EA4335" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_1156_824">
                                        <rect width="16" height="16" fill="white" transform="translate(0.5)" />
                                    </clipPath>
                                </defs>
                            </svg>
                            <span>Sign in with Google</span>
                        </Button>
                    </div>
                    <div className="space-y-4 mt-8">
                        <Button size="lg" color="white" className="flex items-center gap-2 justify-center shadow-md" fullWidth variant="outlined">
                            <img src="/img/twitter-logo.svg" height={24} width={24} alt="" />
                            <span>Sign in With Twitter</span>
                        </Button>
                    </div>
                    <Typography className="text-center text-blue-gray-500 font-medium mt-4" variant="paragraph">
                        Already have an account?
                        <Link to={"/cms"} className="text-gray-900 ml-1">Sign in</Link>
                    </Typography>
                </form>
            </div>
        </section>
    );
}

export default PatientsPortals;