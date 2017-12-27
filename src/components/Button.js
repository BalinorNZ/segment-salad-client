import React from 'react';

const Button = ({buttonText, onClick, onClickParams}) => (
  <button className="btn" onClick={() => onClick(onClickParams)}>
    {buttonText}
  </button>
);

export default Button;