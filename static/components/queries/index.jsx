
var

React = require('react/addons'),
Button = require('../button'),
Form = require('./form'),
Header = require('../header'),
SystemSelector = require('../systemSelector'),

Queries = React.createClass({

    getInitialState: function() {
        return { percentage: '...',
                 start_time: 0,
                 end_time: 0,
                 threshold: 70,
                 systems: [],
                 current_system: 'ALL SYSTEMS'
                }
    },

    componentDidMount: function() {
        this.getSystems();
        this.get_percent_annotated();
    },

    get_percent_annotated: function() {
        $.ajax({
            url: '/api/get_percent',
            type: "POST",
            data: {system_name: (this.state.current_system=="ALL SYSTEMS") ? '':this.state.current_system},
            success: function(percent){
                this.showPercentAnnotated(percent);
            }.bind(this)
        })
    },

    showPercentAnnotated: function(percent) {
        this.setState({ percentage: percent });
    },

    getSystems: function(){
        $.ajax({
            url: '/api/get_systems',
            type: "GET",
            success: function(resp) {
                var systems = ['ALL SYSTEMS'].concat(JSON.parse(resp).systems);
                this.setState({systems:systems});
            }.bind(this)
        })
    },

    changeActiveSystem: function(new_system){
        this.setState({current_system:new_system,percentage:'...'},this.get_percent_annotated)
    },

    render: function() {
            return (

                <div className='downloads'>
                    <div className = 'time_period'>
                        <h3>Create a report of all the annotations for questions in this time period:</h3>
                        <div className="query-cal">
                            <SystemSelector
                                    current_system={this.state.current_system}
                                    options={this.state.systems}
                                    updateSystem={this.changeActiveSystem}/>
                        </div>
                        <div className='percent-annotated'>(Percent Annotated: {this.state.percentage})</div>

                    </div>
                    <Form loc="/api/export_gt" val="Get New Ground Truth" onSubmit={this.export_gt} system={this.state.current_system=="ALL SYSTEMS" ? '':this.state.current_system}/>
                </div>
            );
        }

});

module.exports = Queries;
