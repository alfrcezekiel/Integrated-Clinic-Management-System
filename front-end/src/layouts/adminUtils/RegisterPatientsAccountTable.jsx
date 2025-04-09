import {
    Card,
    CardHeader,
    CardContent,
    Table,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import {
    useEffect,
    useState
} from "react"
import CMS from "../../API/CMS.jsx";
import PatientsAccountsTableValue from "./PatientsAccountsTableValue.jsx";

const RegisterPatientsAccountTable = () => {
    const registerPatientColums = [
        "First Name",
        "Last Name",
        "Email",
        "Phone Number",
        "Status",
        "Edit"
    ]

    const [patientsAccountData, setPatientsAccountData] = useState([]);

    const retrievedPatientsAccountData = async () => {
        try {
            const response = await CMS.get("/CMS/admin-dashboard/registeredPatientAccount")

            if(!response.data){
                throw new Error("No response for registered patients account data");
            }
            
            if (response.status === 200) {
                setPatientsAccountData(response.data.registeredPatientsAccount);
            } else {
                console.error(`Failed to retrieve patients account data: ${response.status}`);
            }
        } catch (error){
            console.error("Error retrieving patients account data:", error);
        }
    }

    useEffect(() => {
        retrievedPatientsAccountData()
    }, [])
    
    return (
        <div className="mt-12 mb-1 flex justify-center items-center w-full">
            <Card className="shadow-lg rounded-2xl w-full">
                <CardHeader
                    title="Registerered Patients Account"
                    className="bg-blue-500 mb-8 p-6 rounded-2xl"
                    slotProps={{
                        title: {
                            variant: 'h6',
                            className: 'text-white text-center',
                        },
                    }}
                />
                <CardContent className="overflow-x-scroll px-0 pt-0 pb-2">
                    <Table className="w-full min-w-[640px] table-auto">
                        <TableHead>
                            <TableRow>
                                {registerPatientColums.map((header, i) => (
                                    <TableCell
                                        key={i}
                                        className="border-b border-blue-gray-50 text-center py-3 px-5"
                                        align="center"
                                    >
                                        <Typography
                                            variant="body2"
                                            className="text-[11px] font-bold uppercase text-blue-gray-400"
                                        >
                                            {header}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <PatientsAccountsTableValue
                            patientsAccountData={patientsAccountData}
                            registerPatientColums={registerPatientColums}
                        />
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default RegisterPatientsAccountTable;