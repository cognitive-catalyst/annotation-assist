var

React            = require('react/addons'),
Button           = require('../button'),
QueryCard        = require('../queryCard'),
ResponseCard     = require('../responseCard'),
SystemSelector   = require('../systemSelector'),
Header           = require('../header'),
$                = require('jquery'),

AnnotationAssist =

React.createClass({

    getInitialState: function() {

        return {
            initial_question : '',
            other_questions:[],
            new_questions: true,
            answer: '',
            human_performance: 'null',
            on_topic: false,
            loading: false,
            systems: [],
            current_system: 'ALL SYSTEMS',

        };
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

    noAnnotations: function() {
        this.setState({
            new_questions: false,
            loading: false,
            initial_question: "NO QUESTIONS TO ANNOTATE"
        });
    },

    newQuestion: function() {
        this.setState({
            answer: '',
            initial_question : '',
            other_questions:[],
            on_topic: false,
            loading: true
        });
        $.ajax({
                url:  '/api/get_question',
                type: "POST",
                data: {system_name: (this.state.current_system=="ALL SYSTEMS") ? '':this.state.current_system},
                statusCode:{
                    200: (resp) => {
                        const q_data = JSON.parse(resp);

                        let similar_questions = []
                        let similar_conf = 0
                        for (var q in q_data.similar){
                            similar_questions.push(q_data.similar[q][0])
                            similar_conf = Math.max(similar_conf, q_data.similar[q][1])
                        }

                        this.setState({
                            new_questions: true,
                            initial_question: q_data.question.text,
                            other_questions: similar_questions,
                            question_id: q_data.question.id,
                            answer: q_data.question.answer,
                            loading: false,
                            similar_conf:similar_conf
                        })
                    },
                    204: () =>this.noAnnotations()
                }
                // success: function(resp){
                //     console.log(resp)
                //     const q_data = JSON.parse(resp);

                //     let similar_questions = []
                //     let similar_conf = 0
                //     for (var q in q_data.similar){
                //         similar_questions.push(q_data.similar[q][0])
                //         similar_conf = Math.max(similar_conf, q_data.similar[q][1])
                //     }

                //     this.setState({
                //         new_questions: true,
                //         initial_question: q_data.question.text,
                //         other_questions: similar_questions,
                //         question_id: q_data.question.id,
                //         answer: q_data.question.answer,
                //         loading: false,
                //         similar_conf:similar_conf
                //     })
                // }.bind(this),
                // error: function() {
                //     this.noAnnotations();
                // }.bind(this)
        });
    },

    componentWillMount: function () {
        this.getSystems();
        this.newQuestion();
    },

    changePerformance: function (perf){
        this.setState({ human_performance: perf });
    },

    notSimilar: function() {
        this.setState({other_questions: []});
    },

    similarToOthers: function(perf) {
        this.newQuestion();
        $.ajax({
            url: '/api/topic',
            type: "POST",
            data: {_id:this.state.question_id,
                    on_topic: true,
                    human_performance: this.state.similar_conf,
                  },
            success: function(data){
                // this.newQuestion();
            }.bind(this)
        });
    },

    onTopic: function(){
        this.setState({
            on_topic:true,
        });
    },

    offTopic: function() {
        $.ajax({
            url: '/api/topic',
            type: "POST",
            data: {_id:this.state.question_id,
                    on_topic: false,
                    human_performance: 0,
                  },
            success: function(data){
                this.newQuestion();
            }.bind(this)
        });
    },

    submitToDB: function() {
        $.ajax({
            url: '/api/topic',
            type: "POST",
            data: {_id:this.state.question_id,
                    on_topic: this.state.on_topic,
                    human_performance: this.state.human_performance,
                  },
            success: function(data){
                this.newQuestion();
            }.bind(this)
        });
    },

    changeActiveSystem: function(new_system){
        this.setState({current_system:new_system},this.newQuestion)
    },

    render: function() {
        return (

            <div className='annotation-assist'>
                <SystemSelector
                        current_system={this.state.current_system}
                        options={this.state.systems}
                        updateSystem={this.changeActiveSystem}/>
                <QueryCard question={this.state.initial_question}
                           onTopic={this.onTopic}
                           offTopic={this.offTopic}
                           on_topic={this.state.on_topic}
                           loading={this.state.loading}
                           new_questions={this.state.new_questions}/>
                <div style= {this.state.on_topic ?  {zIndex: -1} : {display: 'none'}}>
                    <ResponseCard answer={this.state.answer}
                                  other_questions={this.state.other_questions}
                                  similar={this.similarToOthers}
                                  notSimilar={this.notSimilar}
                                  changePerformance={this.changePerformance}
                                  submitToDB={this.submitToDB}/>
                </div>
                <div className='skip-query' onClick={this.newQuestion} style={this.state.loading ? {display: 'none'} : {display: 'block'}}>Skip This Query</div>
            </div>

        );
    }
});

module.exports = AnnotationAssist;
