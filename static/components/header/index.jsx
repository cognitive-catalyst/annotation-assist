
var

React  = require('react/addons'),
Nav    = require('./nav'),
Logo   = require('./logo'),

Header = React.createClass({

	render: function(){

		return (
			<header className='header'>
				<Logo />
				<Nav path={this.props.path}/>
			</header>
		);
	}
});

module.exports = Header;
