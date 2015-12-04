var

React 			 = require('react/addons'),
ReactRouter      = require('react-router'),
Router           = ReactRouter.Router,
Route 	         = ReactRouter.Route,
History          = require('history/lib/createBrowserHistory.js'),
IndexRoute       = ReactRouter.IndexRoute,
Upload           = require('./upload'),
Queries          = require('./queries'),
AnnotationAssist = require('./annotationAssist'),
AccuracyPopUp    = require('./accuracyPopUp'),
App 		     = require('./app'),
Display          = require('./visualization');

var
Routes = (
    <Route path="/"  component={App} >
        <IndexRoute component={AnnotationAssist} />
        <Route path="test" component={AccuracyPopUp} />
        <Route path="uploading" component={Upload} />
        <Route path="downloading" component={Queries} />
        <Route path="vis" component={Display} />
    </Route>
);



React.render(
    <Router routes={Routes} history={History()} />, document.body

);
