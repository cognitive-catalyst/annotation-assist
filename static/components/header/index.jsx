import React from 'react';
import Nav from './nav';
import Logo from './logo';
import './style.scss';

export default (props) => (
    <header className="header">
        <Logo />
        <Nav path={props.path} />
    </header>
);
