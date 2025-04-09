<<<<<<< HEAD
import styled, { keyframes } from "styled-components";
import PropTypes from "prop-types";

export default function Button({name}) {
    return (
        <ButtonBox
            className="btn">
            {name}
        </ButtonBox>
=======
import styled from "styled-components";
import PropTypes from "prop-types";
import "../App.css";
export default function Button({name}) {
    return (
        <div className="button-login">
            <ButtonBox
                className="btn">
                {name}
            </ButtonBox>
        </div>
>>>>>>> 9d3c371969277c2fa7b4fdfff5fa530d00f31763
    )
}

Button.propTypes = {
    name: PropTypes.string.isRequired
}

<<<<<<< HEAD
const ButtonAnimation = keyframes`
    0%{
        transform: translateX(-5%);
        opacity: -5;
    }
    20%{
        transform: translateX(-1%);
        opacity: -5;
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
    width: 15rem;
    height: 4rem;
    border-radius: 2rem;
    border: none;
    color: white;
    background-color: #7350f0;
    position: absolute;
    top: 1rem;
<<<<<<< HEAD
    left: 9.50rem;
    animation: ${ButtonAnimation} 1s ease-in
=======
>>>>>>> 9d3c371969277c2fa7b4fdfff5fa530d00f31763
`;
