
var 

React = require('react/addons'),

Button = React.createClass({

	classes: function(){

		var color 	  = this.props.color,
			disabled  = this.props.disabled,
			active    = this.props.active;

			if(disabled){
				return 'btn disabled';
			}

			else if(active){
				return 'btn active';
			}

			else {
				return 'btn ' + color;
			}
	},

    render: function() {

        return (
            <button className={this.classes()} 
            		onClick={this.props.onClick} 
            		disabled={this.props.disabled} 
            		style={this.props.loading ? {display: 'none'} : {display: ''}}> {this.props.label}</button>
        );
    }
});

module.exports = Button;