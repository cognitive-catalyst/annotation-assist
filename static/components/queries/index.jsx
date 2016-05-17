import React from 'react';
import Form from './form';
import SystemSelector from 'systemSelector';
import $ from 'jquery';
import './style.scss';

export default class Queries extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            percentage: '...',
            start_time: 0,
            end_time: 0,
            threshold: 70,
            systems: [],
            current_system: 'ALL SYSTEMS',
        };
    }

    componentDidMount() {
        this.getSystems();
        this.getPercentAnnotated();
    }

    getPercentAnnotated() {
        $.ajax({
            url: '/api/get_percent',
            type: 'POST',
            data: { system_name: (this.state.current_system === 'ALL SYSTEMS') ? '' : this.state.current_system },
            success: (percent) => {
                this.showPercentAnnotated(percent);
            },
        });
    }

    getSystems() {
        $.ajax({
            url: '/api/get_systems',
            type: 'GET',
            success: (resp) => {
                const systems = ['ALL SYSTEMS'].concat(JSON.parse(resp).systems);
                this.setState({ systems });
            },
        });
    }

    showPercentAnnotated(percent) {
        this.setState({ percentage: percent });
    }

    changeActiveSystem = (newSystem) => {
        this.setState({ current_system: newSystem, percentage: '...' }, this.getPercentAnnotated);
    }

    render() {
        return (
            <div className="downloads">
                <div className="time_period">
                    <h3>Create a report of all the annotations for questions in this time period:</h3>
                    <div className="query-cal">
                        <SystemSelector
                          current_system={this.state.current_system}
                          options={this.state.systems}
                          updateSystem={this.changeActiveSystem}
                        />
                    </div>
                    <div className="percent-annotated">(Percent Annotated: {this.state.percentage})</div>

                </div>
                <Form loc="/api/export_gt" val="Get New Ground Truth" system={this.state.current_system === 'ALL SYSTEMS' ? '' : this.state.current_system} />
            </div>
        );
    }

}
