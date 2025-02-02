import styled, { keyframes } from "styled-components";
import PropTypes from "prop-types";

export default function Button({name}) {
    return (
        <ButtonBox
            className="btn">
            {name}
        </ButtonBox>
    )
}

Button.propTypes = {
    name: PropTypes.string.isRequired
}

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
    left: 9.50rem;
    animation: ${ButtonAnimation} 1s ease-in
`;
