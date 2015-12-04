var

React = require('react/addons'),
ReactCSSTransitionGroup = React.addons.CSSTransitionGroup,
ReactRouter = require('react-router'),
Link = ReactRouter.Link,

Nav   = React.createClass({

	render: function(){

		var active = this.props.path;

		return (
			<nav className="nav">
				<ul>
					<li>
						<Link to='/uploading'>
							<span className={ active === '/uploading' ? 'active icon-database' : 'icon-database' }></span>
						</Link>
					</li>
					<li>
						<Link to='/'>
							<span className={ active === '/' ? 'active icon-pencil' : 'icon-pencil' }></span>
						</Link>
					</li>
					<li>
						<Link to='/downloading'>
							<span className={ active === '/downloading' ? 'active icon-doc-text' : 'icon-doc-text' }></span>
						</Link>
					</li>
					<li>
						<Link to='/vis'>
							<span className={ active === '/vis' ? 'active icon-bar-chart' : 'icon-bar-chart' }></span>
						</Link>
					</li>
				</ul>
			</nav>

		);
	}
});

module.exports = Nav;