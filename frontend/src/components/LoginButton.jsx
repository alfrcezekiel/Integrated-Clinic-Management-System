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
    )
}

Button.propTypes = {
    name: PropTypes.string.isRequired
}

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
`;
