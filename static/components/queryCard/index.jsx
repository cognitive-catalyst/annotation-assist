var

React = require('react/addons'),
Button = require('../button'),
AccuracyPopUp = require('../accuracyPopUp'),

WatsonThinking   = require('img/watson-thinking.svg'),


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
        on_topic ? this.props.onTopic() : this.props.offTopic();
    },

    render: function() {
        return (
            <div className='query_card_background' style={{background: this.props.on_topic & !this.props.loading? 'rgba(255,255,255, 0.5)' : 'white'}}>
                <div className='card'>
                    <p className='heading'>User queried...</p>
                    <img className="loading" style={{height:'70px',width:'70px',display: this.props.question ? 'none':''}}src={WatsonThinking}/>
                    <p className='question'>{this.props.question}</p>
                    <div className="purview" style= {this.props.new_questions ?  {display: 'block'} : {display: 'none'}}>
                        <Button onClick={this.withinPurview.bind(this, true, 0)} label="WITHIN PURVIEW" color='within-purview' loading={this.props.loading} active={this.props.on_topic}/>
                        <Button onClick={this.withinPurview.bind(this, false, 1)} label="OUTSIDE OF PURVIEW" color='outside-of-purview' loading={this.props.loading} active={false}/>
                        <AccuracyPopUp loading={this.props.loading}/>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = QueryCard;
