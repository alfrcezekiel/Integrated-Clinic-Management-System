import PropTypes from 'prop-types';
<<<<<<< HEAD
import styled, { keyframes } from 'styled-components';

=======
import styled  from 'styled-components';
>>>>>>> 9d3c371969277c2fa7b4fdfff5fa530d00f31763

export default function RegisterSubmitButton({ label }) {
    return (
        <ButtonBox
            className="register-button">
            {label}
        </ButtonBox>
    )
}

<<<<<<< HEAD
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
=======
>>>>>>> 9d3c371969277c2fa7b4fdfff5fa530d00f31763
const ButtonBox = styled.button`
    display: block;
    padding: 1rem;
    width: 60%;
    height: 4rem;
    border-radius: 2rem;
    border: none;
    color: white;
    background-color: #7350f0;
<<<<<<< HEAD
    animation: ${ButtonAnimation} 1s ease-in;
=======
>>>>>>> 9d3c371969277c2fa7b4fdfff5fa530d00f31763
    margin-left: 20%;
`;

RegisterSubmitButton.propTypes = {
    label: PropTypes.string.isRequired,
}
