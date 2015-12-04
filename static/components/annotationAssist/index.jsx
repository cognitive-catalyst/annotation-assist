var

React            = require('react/addons'),
Button           = require('../button'),
QueryCard        = require('../queryCard'),
ResponseCard     = require('../responseCard'),
Calendar         = require('../calendar'),
Header           = require('../header'),


AnnotationAssist =

React.createClass({

    getInitialState: function() {

        return {
            initial_question : '',
            other_questions:[],
            new_questions: true,
            answer: '',
            showSlider: 'none',
            showSubmit: 'none',
            human_performance: 'null',
            confidence: 0,
            start_time: 0,
            end_time: 0,
            on_topic: false,
            loading: false
        };
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
                data: {start_time:this.state.start_time,
                        end_time: this.state.end_time
                      },
                success: function(resp){
                    var q_data = JSON.parse(resp);
                    if (q_data.status == "SUCCESS") {
                        this.setState({
                            new_questions: true,
                            initial_question: q_data.question.question,
                            other_questions: q_data.other_questions,
                            question_id: q_data.question.id,
                            answer: q_data.question.answer,
                            confidence: parseFloat(q_data.question.confidence),
                            loading: false
                        })
                    }
                    else {
                        this.noAnnotations();
                    }
            }.bind(this),
            error: function() {
                this.noAnnotations();
            }.bind(this)
        });
    },

    componentWillMount: function () {
        this.newQuestion();
    },

    changePerformance: function (perf){
        this.setState({ human_performance: perf });
    },

    notSimilar: function() {
        this.setState({other_questions: []});
    },

    similarToOthers: function(perf) {
        $.ajax({
            url: '/api/topic',
            type: "POST",
            data: {_id:this.state.question_id,
                    on_topic: true,
                    human_performance: 100,
                  },
            success: function(data){
                this.newQuestion();
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

    changeDate: function(startDate, endDate) {
        this.setState({
            start_time: startDate,
            end_time: endDate
        });
    },

    render: function() {
        return (

            <div className='annotation-assist'>
                <Calendar startDate={this.state.start_time}
                        endDate={this.state.end_time}
                        changeDate={this.changeDate}/>
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
