import React from 'react';
import Header from '../header';
import './style.scss';
import 'sass/main.scss';

const app = ({ location, children }) => (
    <div className="app">
        <Header path={location.pathname} />
        {children}
    </div>
);

export default app;
