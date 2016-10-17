import React from 'react';
import { Link } from 'react-router';


export default ({ path }) => (
    <nav className="nav">
        <ul>
            <li>
                <Link to="/uploading">
                    <span className={path === '/uploading' ? 'active icon-database' : 'icon-database'}></span>
                </Link>
            </li>
            <li>
                <Link to="/">
                    <span className={path === '/' ? 'active icon-pencil' : 'icon-pencil'}></span>
                </Link>
            </li>
            <li>
                <Link to="/downloading">
                    <span className={path === '/downloading' ? 'active icon-doc-text' : 'icon-doc-text'}></span>
                </Link>
            </li>
            <li>
                <Link to="/vis">
                    <span className={path === '/vis' ? 'active icon-bar-chart' : 'icon-bar-chart'}></span>
                </Link>
            </li>
        </ul>
    </nav>
);
