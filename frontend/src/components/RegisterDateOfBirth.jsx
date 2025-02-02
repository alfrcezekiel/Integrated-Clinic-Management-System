import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DemoItem, DemoContainer} from "@mui/x-date-pickers/internals/demo";
import "../App.css";

function RegisterDateOfBirth(){
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker']}>
                <DemoItem>
                    <DatePicker label="Enter Date of Birth" id="date-of-birth"/>
                </DemoItem>
            </DemoContainer>
        </LocalizationProvider>
    )
}

export default RegisterDateOfBirth;