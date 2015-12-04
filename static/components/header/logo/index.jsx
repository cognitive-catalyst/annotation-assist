
var

React = require('react/addons'),

Logo  = React.createClass({

	render: function(){

		return (
			<div className='logo'>
				<img src='static/img/watson-logo.svg' />
				<span>Annotation Assistant</span>
			</div>
		);
	}
});

module.exports = Logo;