import React from 'react';
import Button from 'button';

class SimilarQuestions extends React.Component{

    render() {

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
}

class Questions extends React.Component{

    render() {

        return (

            <div>
                <p className='heading'>Watson thinks these are related queries...</p>
                <SimilarQuestions questions={this.props.questions} />
                <p className='user-question'>Does this question rephrase any of the above?</p>

                <div className="similar-questions">
                   <Button onClick={this.props.similar} label="YES, THEY ARE SIMILAR" color='similar' />
                   <Button onClick={this.props.notSimilar} label="NO, NOT RELATED" color='not-similar' />
                </div>
            </div>
        );
    }
}

class Answers extends React.Component{

    constructor(props){
        super(props)

        this.state = {
            score:undefined
        }
    }

     submit() {
        this.props.submit(this.state.score);
        this.setState({
            score: undefined
        })
     }

    render(){

        let labels = [
            ['Wrong',0],
            ['Poor',20],
            ['Decent',80],
            ['Perfect',100]
        ]

        let judgementButtons = labels.map((label) => {
            return (
                <Button label={label[0]} active ={label[1] == this.state.score} onClick={() => this.setState({score:label[1]}) }/>
            )
        })

        var answer = this.props.answer;

        return (

            <div>
                <p className='heading'>Watson responded...</p>
                <div className='answer' dangerouslySetInnerHTML={{__html: answer}}></div>

                <div className='button-group'>
                    {judgementButtons}
                    <Button onClick={this.submit.bind(this)} label='Submit'  color='Submit' disabled={this.state.score == undefined}/>
                </div>
            </div>
        );
    }
}

export default class ResponseCard extends React.Component{

    render() {
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
};
