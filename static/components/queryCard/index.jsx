
var

React = require('react/addons'),
Button = require('../button'),
AccuracyPopUp = require('../accuracyPopUp'),
WatsonThinking   = require('../watson-thinking'),


QueryCard = React.createClass({

    getInitialState: function(){
        return {
            allActive: [false, false]
        }
    },

    resetButtons: function(buttonId) {
        this.setState({allActive: [false, false]});
    },

    withinPurview: function(on_topic, buttonId){
        var activeButtons = [false, false];

        activeButtons[buttonId] = true;
        this.setState({allActive: activeButtons});

        on_topic ? this.props.onTopic() : this.props.offTopic();
    },

    render: function() {
        if(!this.props.on_topic) {
            var purview_active = false;
            var not_purview_active = false;
        }
        else {
            var purview_active = this.state.allActive[0];
            var not_purview_active = this.state.allActive[1];
        }

        return (
            <div className='query_card_background' style={{background: this.props.on_topic ? 'rgba(255,255,255, 0.5)' : 'white'}}>
                <div className='card'>
                    <p className='heading'>User queried...</p>
                    <WatsonThinking height='70' width='70' loading={this.props.loading}/>
                    <p className='question'>{this.props.question}</p>
                    <div className="purview" style= {this.props.new_questions ?  {display: 'block'} : {display: 'none'}}>
                        <Button onClick={this.withinPurview.bind(this, true, 0)} label="WITHIN PURVIEW" color='within-purview' loading={this.props.loading} active={purview_active}/>
                        <Button onClick={this.withinPurview.bind(this, false, 1)} label="OUTSIDE OF PURVIEW" color='outside-of-purview' loading={this.props.loading} active={not_purview_active}/>
                        <AccuracyPopUp loading={this.props.loading}/>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = QueryCard;