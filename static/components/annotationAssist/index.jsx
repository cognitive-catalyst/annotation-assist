import React from 'react/addons';
import Button from 'button';
import QueryCard from 'queryCard';
import ResponseCard from 'responseCard';
import SystemSelector from 'systemSelector';
import Header from 'header';
import $ from 'jquery';

const ON_TOPIC_INITIALIZED = false;

export default class AnnotationAssist extends React.Component{

    constructor(props){
        super(props)

        this.state = {
            previousQuestionId:undefined,
            questionId:'',
            questionText : '',
            answer: '',

            similarQuestions:[],
            similarConf: undefined,
            new_questions: true,
            onTopicClicked: ON_TOPIC_INITIALIZED,
            current_system: 'ALL SYSTEMS',
            systems: [],

            loading: false
        }
    }

    getSystems(){
        $.ajax({
            url: '/api/get_systems',
            type: "GET",
            success: function(resp) {
                var systems = ['ALL SYSTEMS'].concat(JSON.parse(resp).systems);
                this.setState({systems:systems});
            }.bind(this)
        })
    }

    noAnnotations() {
        this.setState({
            new_questions: false,
            loading: false,
            QuestionText: "NO QUESTIONS TO ANNOTATE"
        });
    }

    setNewQuestion(resp){
        const q_data = JSON.parse(resp);

        let similar_questions = []
        let similar_conf = 0
        for (var q in q_data.similar){
            similar_questions.push(q_data.similar[q][0])
            similar_conf = Math.max(similar_conf, q_data.similar[q][1])
        }

        this.setState({
            new_questions: true,
            QuestionText: q_data.question.text,
            similarQuestions: similar_questions,
            questionId: q_data.question.id,
            answer: q_data.question.answer,
            loading: false,
            similarConf:similar_conf
        })
    }

    getPreviousQuestion() {
        $.ajax({
                url:  '/api/get_question/' + this.state.previousQuestionId,
                type: "GET",
                statusCode:{
                    200: (resp) => this.setNewQuestion(resp),
                    204: () => this.noAnnotations()
                }
        });
        this.setState({
            previousQuestionId:undefined,
            answer: '',
            QuestionText : '',
            similarQuestions:[],
            onTopicClicked: ON_TOPIC_INITIALIZED,
            loading: true
        });

    }

    newQuestion() {
        $.ajax({
                url:  '/api/get_question',
                type: "POST",
                data: {system_name: (this.state.current_system=="ALL SYSTEMS") ? '':this.state.current_system},
                statusCode:{
                    200: (resp) => this.setNewQuestion(resp),
                    204: () => this.noAnnotations()
                }
        });
        this.setState({
            answer: '',
            QuestionText : '',
            similarQuestions:[],
            onTopicClicked: ON_TOPIC_INITIALIZED,
            loading: true
        });
    }

    componentWillMount() {
        this.getSystems();
        this.newQuestion();
    }

    notSimilar() {
        this.setState({similarQuestions: []});
    }

    similarToOthers(perf) {
        this.submitToDB(perf)
    }

    onTopic(){
        this.setState({
            onTopicClicked:true,
        });
    }

    offTopic() {
        this.setState({
            previousQuestionId:this.state.questionId
        })

        $.ajax({
            url: '/api/update',
            type: "POST",
            data: {_id:this.state.questionId,
                    on_topic: false,
                    human_performance: 0,
                  },
            error: function(){
                console.log("there has been an error") //TODO: DISPLAY ERRORS?
            }.bind(this)
        });

        this.newQuestion();

    }

    submitToDB(performance) {
        this.setState({
            previousQuestionId:this.state.questionId
        })
        $.ajax({
            url: '/api/update',
            type: "POST",
            data: {_id:this.state.questionId,
                    on_topic: this.state.onTopicClicked,
                    human_performance: performance,
                  },
            error: function(data){
                console.log("there has been an error") //TODO: DISPLAY ERRORS?
            }.bind(this)
        });

        this.newQuestion();
    }

    changeActiveSystem(new_system){
        this.setState({current_system:new_system},this.newQuestion)
    }

    render() {
        return (

            <div className='annotation-assist'>
                <div className='top-row'>
                    <a className={this.state.previousQuestionId!=undefined?'get-previous active':'get-previous'}onClick={this.state.previousQuestionId != undefined ? this.getPreviousQuestion.bind(this):''}>&#8592; See Previous</a>
                    <SystemSelector
                        current_system={this.state.current_system}
                        options={this.state.systems}
                        updateSystem={this.changeActiveSystem.bind(this)}/>
                </div>
                <QueryCard question={this.state.QuestionText}
                    onTopic={this.onTopic.bind(this)}
                    offTopic={this.offTopic.bind(this)}
                    on_topic={this.state.onTopicClicked}
                    loading={this.state.loading}
                    new_questions={this.state.new_questions}/>
                <div style= {this.state.onTopicClicked & !this.state.loading?  {zIndex: -1} : {display: 'none'}}>
                    <ResponseCard answer={this.state.answer}
                                  other_questions={this.state.similarQuestions}
                                  similar={this.similarToOthers.bind(this)}
                                  notSimilar={this.notSimilar.bind(this)}
                                  submitToDB={this.submitToDB.bind(this)}/>
                </div>
                <div className='skip-query' onClick={this.newQuestion.bind(this)} style={this.state.loading ? {display: 'none'} : {display: 'block'}}>Skip This Query</div>
            </div>

        );
    }
};
