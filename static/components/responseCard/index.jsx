
var

React = require('react/addons'),
Button = require('../button'),

SimilarQuestions = React.createClass({

    render: function() {

        if(this.props.questions.length){
            var rows = this.props.questions.map(function(item, i){
                return (
                    <li className="other-question">{item}</li>
                );
            });
        }

        return (
            <ol className='other-question-container'>
                {rows}
            </ol>
        );
    }
}),

Questions = React.createClass({

    render: function() {

        return (

            <div>
                <p className='heading'>Watson thinks these are related queries...</p>
                <SimilarQuestions questions={this.props.questions} />
                <p className='user-question'>Is the users query similar to the questions above?</p>

                <div className="similar-questions">
                   <Button onClick={this.props.similar} label="YES, THEY ARE SIMILAR" color='similar' />
                   <Button onClick={this.props.notSimilar} label="NO, NOT RELATED" color='not-similar' />
                </div>
            </div>
        );
    }
}),

Answers = React.createClass({

    getInitialState: function(){
        return {
            disabled: true,
            allActive: [false, false, false, false]
        }
    },

     allActive: function(score, buttonId){

        var activeButtons = [false,false,false,false];
            activeButtons[buttonId] = true;
            this.props.perf(score)
            this.setState({allActive: activeButtons, disabled: false });
     },

     submitReset: function() {
        this.props.submit();
        this.setState({
            allActive: [false,false,false,false]
        })
     },

    render: function(){

        var answer = this.props.answer;

        return (

            <div>
                <p className='heading'>Watson responded...</p>
                <div className='answer' dangerouslySetInnerHTML={{__html: answer}}></div>

                <div className='button-group'>
                    <Button onClick={this.allActive.bind(this,0,0)} label='Wrong' color='wrong' active={this.state.allActive[0]}/>
                    <Button onClick={this.allActive.bind(this,20,1)} label='Poor' color='Poor' active={this.state.allActive[1]}/>
                    <Button onClick={this.allActive.bind(this,80,2)} label='Decent' color='Decent' active={this.state.allActive[2]}/>
                    <Button onClick={this.allActive.bind(this,100,3)} label='Perfect' color='Perfect' active={this.state.allActive[3]}/>
                    <Button onClick={this.submitReset.bind(this)} label='Submit'  color='Submit' disabled={this.state.disabled}/>
                </div>
            </div>
        );
    }
}),

ResponseCard = React.createClass({

    render: function() {
        console.log(this.props.other_questions.length);
        return (
            <div className='response-card'>

                <div className='card'>
                    {this.props.other_questions.length ?
                        <Questions questions={this.props.other_questions} similar={this.props.similar} notSimilar={this.props.notSimilar}/> :
                        <Answers answer={this.props.answer} perf={this.props.changePerformance} submit={this.props.submitToDB}/>}
                </div>
            </div>
        );
    }
});

module.exports = ResponseCard;
