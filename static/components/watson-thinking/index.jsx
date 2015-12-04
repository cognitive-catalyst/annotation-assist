
var React = require('react/addons');

module.exports = React.createClass({

	render: function(){
		var loading = this.props.loading, height = this.props.height, width = this.props.width;

		return (
			<div className='loading' 
				 style={loading ? {display: 'block', height: height, width: width} : {display: 'none'}}>
				<img src='static/img/watson-thinking.svg'/>
			</div>
		);
	}
});

