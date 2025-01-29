import styled, {keyframes} from "styled-components";

export default function Button(){
    return(
        <ButtonBox 
            onClick={() => {
                alert("Appointment Requested!");
            }} 
            className="btn">
            Request Appointment
        </ButtonBox>
    );
}

const ButtonAnimation = keyframes`
    0%{
        transform: translateX(-10%);
        opacity: -5;
    }
    50%{
        transform: translateX(-5%);
        opacity: -2;
    }
    100%{
        transform: translateX(0);
        opacity: 1;
    }
`

const ButtonBox = styled.button`
    display: block;
    padding: 1rem;
    width: 15rem;
    height: 4rem;
    border-radius: 2rem;
    border: none;
    color: white;
    background-color: #7350f0;
    position: absolute;
    bottom: 0;
    right: 16rem;
    margin-bottom: 9rem;
    animation: ${ButtonAnimation} 1s ease-in
`;
