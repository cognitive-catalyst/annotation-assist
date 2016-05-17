import React from 'react';
import Button from 'button';
import './style.scss';

const SimilarQuestions = () => (
    <ol className="other-question-container">
        {this.props.questions.map((item, i) => <li key={i} className="other-question">{item}</li>)}
    </ol>
);

const Questions = (props) => (

    <div>
        <p className="heading">Watson thinks these are related queries...</p>
        <SimilarQuestions questions={props.questions} />
        <p className="user-question">Does this question rephrase any of the above?</p>

        <div className="similar-questions">
            <Button onClick={props.similar} label="YES, THEY ARE SIMILAR" color="similar" />
            <Button onClick={props.notSimilar} label="NO, NOT RELATED" color="not-similar" />
        </div>
    </div>
);

class Answers extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            score: undefined,
        };
    }

    submit = () => {
        this.props.submit(this.state.score);
        this.setState({
            score: undefined,
        });
    }

    render() {
        const labels = [
            ['Wrong', 0],
            ['Poor', 20],
            ['Decent', 80],
            ['Perfect', 100],
        ];

        let judgementButtons = labels.map((label) => (
            <Button key={label} label={label[0]} active={label[1] === this.state.score} onClick={() => this.setState({ score: label[1] })} />
        ));

        const answer = this.props.answer;

        return (

            <div>
                <p className="heading">Watson responded...</p>
                <div className="answer" dangerouslySetInnerHTML={{ __html: answer }}></div>

                <div className="button-group">
                    {judgementButtons}
                    <Button onClick={this.submit} label="Submit" color="Submit" disabled={this.state.score === undefined} />
                </div>
            </div>
        );
    }
}

const ResponseCard = (props) => (
    <div className="response-card">

        <div className="card">
            {props.other_questions.length ?
                <Questions questions={props.other_questions} similar={props.similar} notSimilar={props.notSimilar} /> :
                <Answers answer={props.answer} perf={props.changePerformance} submit={props.submitToDB} />}
        </div>
    </div>
)
;
export default ResponseCard;
