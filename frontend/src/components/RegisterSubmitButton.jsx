import PropTypes from 'prop-types';
import styled  from 'styled-components';

export default function RegisterSubmitButton({ label }) {
    return (
        <ButtonBox
            className="register-button">
            {label}
        </ButtonBox>
    )
}

const ButtonBox = styled.button`
    display: block;
    padding: 1rem;
    width: 60%;
    height: 4rem;
    border-radius: 2rem;
    border: none;
    color: white;
    background-color: #7350f0;
    margin-left: 20%;
`;

RegisterSubmitButton.propTypes = {
    label: PropTypes.string.isRequired,
}
