import React from 'react';
import QueryCard from 'queryCard';
import ResponseCard from 'responseCard';
import SystemSelector from 'systemSelector';
import $ from 'jquery';
import './style.scss';

const ON_TOPIC_INITIALIZED = false;

export default class AnnotationAssist extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            previousQuestionId: undefined,
            questionId: '',
            questionText: '',
            answer: '',

            similarQuestions: [],
            similarConf: undefined,
            new_questions: true,
            onTopicClicked: ON_TOPIC_INITIALIZED,
            current_system: 'ALL SYSTEMS',
            systems: [],

            loading: false,
        };
    }

    componentWillMount() {
        this.getSystems();
        this.newQuestion();
    }

    onTopic = () => {
        this.setState({
            onTopicClicked: true,
        });
    }

    setNewQuestion(resp) {
        const qData = JSON.parse(resp);

        const similarQuestions = [];
        let similarConf = 0;
        let q;
        for (q of qData.similar) {
            similarQuestions.push(q[0]);
            similarConf = Math.max(similarConf, q[1]);
        }

        this.setState({
            new_questions: true,
            QuestionText: qData.question.text,
            questionId: qData.question.id,
            answer: qData.question.answer,
            loading: false,
            similarQuestions,
            similarConf,
        });
    }

    getPreviousQuestion() {
        $.ajax({
            url: `/api/get_question/' ${this.state.previousQuestionId}`,
            type: 'GET',
            statusCode: {
                200: (resp) => this.setNewQuestion(resp),
                204: () => this.noAnnotations(),
            },
        });
        this.setState({
            previousQuestionId: undefined,
            answer: '',
            QuestionText: '',
            similarQuestions: [],
            onTopicClicked: ON_TOPIC_INITIALIZED,
            loading: true,
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

    submitToDB = (performance) => {
        this.setState({
            previousQuestionId: this.state.questionId,
        });
        $.ajax({
            url: '/api/update',
            type: 'POST',
            data: { _id: this.state.questionId,
                    on_topic: this.state.onTopicClicked,
                    human_performance: performance,
                  },
            error: () => {
                console.log('there has been an error'); // TODO: DISPLAY ERRORS?
            },
        });

        this.newQuestion();
    }

    offTopic = () => {
        this.setState({
            previousQuestionId: this.state.questionId,
        });

        $.ajax({
            url: '/api/update',
            type: 'POST',
            data: { _id: this.state.questionId,
                    on_topic: false,
                    human_performance: 0,
                  },
            error: () => {
                console.log('there has been an error'); // TODO: DISPLAY ERRORS?
            },
        });

        this.newQuestion();
    }

    similarToOthers = (perf) => {
        this.submitToDB(perf);
    }
    notSimilar = () => this.setState({ similarQuestions: [] });

    changeActiveSystem = (newSystem) => {
        this.setState({ current_system: newSystem }, this.newQuestion);
    }

    noAnnotations() {
        this.setState({
            new_questions: false,
            loading: false,
            QuestionText: 'NO QUESTIONS TO ANNOTATE',
            onTopicClicked: false,
        });
    }

    newQuestion = () => {
        $.ajax({
            url: '/api/get_question',
            type: 'POST',
            data: { system_name: (this.state.current_system === 'ALL SYSTEMS') ? '' : this.state.current_system },
            statusCode: {
                200: (resp) => this.setNewQuestion(resp),
                204: () => this.noAnnotations(),
            },
        });
        this.setState({
            answer: '',
            QuestionText: '',
            similarQuestions: [],
            onTopicClicked: ON_TOPIC_INITIALIZED,
            loading: true,
        });
    }

    render() {
        return (

            <div className="annotation-assist">
                <div className="top-row">
                    <a
                      className={this.state.previousQuestionId !== undefined ? 'get-previous active' : 'get-previous'}
                      onClick={this.state.previousQuestionId !== undefined ? this.getPreviousQuestion.bind(this) : ''}
                    >
                        ← See Previous
                    </a>
                    <SystemSelector
                      current_system={this.state.current_system}
                      options={this.state.systems}
                      updateSystem={this.changeActiveSystem}
                    />
                </div>
                <QueryCard
                  question={this.state.QuestionText}
                  onTopic={this.onTopic}
                  offTopic={this.offTopic}
                  on_topic={this.state.onTopicClicked}
                  loading={this.state.loading}
                  new_questions={this.state.new_questions}
                />
                <div style={this.state.onTopicClicked & !this.state.loading ? { zIndex: -1 } : { display: 'none' }}>
                    <ResponseCard
                      answer={this.state.answer}
                      other_questions={this.state.similarQuestions}
                      similar={this.similarToOthers}
                      notSimilar={this.notSimilar}
                      submitToDB={this.submitToDB}
                    />
                </div>
                <div className="skip-query" onClick={this.newQuestion} style={this.state.loading ? { display: 'none' } : { display: 'block' }}>Skip This Query</div>
            </div>

        );
    }
}
