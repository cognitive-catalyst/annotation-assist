
var

React = require('react/addons'),
Button = require('../button'),
Form = require('./form'),
Header = require('../header'),
Calendar         = require('../calendar'),

Queries = React.createClass({

    getInitialState: function() {
        return { percentage: '...',
                 start_time: 0,
                 end_time: 0,
                 threshold: 70
                }
    },

    componentDidMount: function() {
        this.get_percent_annotated();
    },

    export_gt: function() {
        $.ajax({
            url: '/api/export_gt',
            type: "POST",
            data: {start_time:this.state.start_time,
                    end_time: this.state.end_time,
                    threshold: this.state.threshold
                  }
        })
    },

    get_percent_annotated: function() {
        $.ajax({
            url: '/api/get_percent',
            type: "POST",
            data: {start_time:this.state.start_time,
                    end_time: this.state.end_time
                  },
            success: function(percent){
                this.showPercentAnnotated(percent);
            }.bind(this)
        })
    },

    showPercentAnnotated: function(percent) {
        this.setState({ percentage: percent });
    },

    changeDate: function(startDate, endDate) {
        this.setState({
            start_time: startDate,
            end_time: endDate,
            percentage: '...'
        })
        this.get_percent_annotated();
    },

    render: function() {
            return (

                <div className='downloads'>
                    <div className = 'time_period'>
                        <h3>Create a report of all the annotations for questions in this time period:</h3>
                        <div className="query-cal">
                            <Calendar startDate={this.state.start_time}
                                endDate={this.state.end_time}
                                changeDate={this.changeDate}/>
                        </div>
                        <div className='percent-annotated'>(Percent Annotated: {this.state.percentage})</div>

                    </div>
                    <Form loc="/api/export_gt" val="Get New Ground Truth" start_time={this.state.start_time} end_time={this.state.end_time} threshold={this.state.threshold} />
                </div>
            );
        }

});

module.exports = Queries;
