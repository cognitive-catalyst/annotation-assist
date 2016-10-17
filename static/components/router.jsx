import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
// import History from 'history/lib/createBrowserHistory.js';
import Upload from 'upload';
import Queries from 'queries';
import AnnotationAssist from 'annotationAssist';
import App from 'app';
import Display from 'visualization';


const
Routes = (
    <Route path="/" component={App} >
        <IndexRoute component={AnnotationAssist} />
        <Route path="uploading" component={Upload} />
        <Route path="downloading" component={Queries} />
        <Route path="vis" component={Display} />
    </Route>
);


render(
    <Router routes={Routes} history={browserHistory} />, document.getElementById('root')

);
