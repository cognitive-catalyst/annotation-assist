import React from 'react';
import './style.scss';
import classNames from 'classnames';

export default (props) => {
    const buttonClass = classNames('btn', { active: props.active }, props.color, { disabled: props.disabled });

    return (
        <button
          className={buttonClass}
          onClick={props.onClick}
          disabled={props.disabled}
          style={props.loading ? { display: 'none' } : { display: '' }}
        >
			{props.label}
        </button>
    );
};
