import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';


export default function RegisterSubmitButton({ label }) {
    return (
        <ButtonBox
            className="register-button">
            {label}
        </ButtonBox>
    )
}

const ButtonAnimation = keyframes`
    0%{
        transform: translateX(-5%);
        opacity: -5;
    }
    50%{
        transform: translateX(-1%);
        opacity: -1;
    }
    100%{
        transform: translateX(0);
        opacity: 1;
    }
`
const ButtonBox = styled.button`
    display: block;
    padding: 1rem;
    width: 60%;
    height: 4rem;
    border-radius: 2rem;
    border: none;
    color: white;
    background-color: #7350f0;
    animation: ${ButtonAnimation} 1s ease-in;
    margin-left: 20%;
`;

RegisterSubmitButton.propTypes = {
    label: PropTypes.string.isRequired,
}
