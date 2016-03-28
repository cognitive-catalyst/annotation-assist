
var

React = require('react/addons'),
LogoImg = require('img/watson-logo.svg'),

Logo  = React.createClass({

	render: function(){
		return (
			<div className='logo'>
				<img src={LogoImg} />
				<span>Annotation Assistant</span>
			</div>
		);
	}
});

module.exports = Logo;