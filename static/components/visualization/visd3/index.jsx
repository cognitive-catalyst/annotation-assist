import React from 'react'
import 'd3'
import ReactSlider from 'react-slider'
import D3Chart from './d3chart'

import './style.scss'

class ChartPrec extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        var properties = {
                data_key : 'precision_data',
                interval_key : 'prec_conf',
                title : "Precision Curve",
                label_x : "Questions Answered (%)",
                label_y : "Precision (%)",
                learn_more: 'https://w3-connections.ibm.com/wikis/home?lang=en-us#!/wiki/W275e0efd7a28_471a_b358_c3c99eeabfcc/page/Precision%20Curves',
        };

        return (
            <D3Chart  data={this.props.data}
                        learn_more={properties.learn_more}
                        resize={this.props.resize}
                        draw_interval={this.props.draw_interval}
                        onIndexChange={this.props.onIndexChange}
                        data_key={properties.data_key}
                        interval_key = {properties.interval_key}
                        title={properties.title}
                        label_x={properties.label_x}
                        label_y={properties.label_y}
                        fields={properties.fields}
                        index={this.props.index}
                        indices={this.props.indices} />
        )
    }
}

class ChartROC extends React.Component{

    constructor(props){
        super(props)
    }

    render(){

        var properties = {
                data_key : 'roc_data',
                interval_key : 'roc_conf',
                title : "NLP ROC Curve",
                label_x : "Probability of False Answer (%)",
                label_y : "Probability of True Answer (%)",
                learn_more:'https://w3-connections.ibm.com/wikis/home?lang=en-us#!/wiki/W275e0efd7a28_471a_b358_c3c99eeabfcc/page/NLP%20ROC%20Curves',
        };

        return(
            <D3Chart data={this.props.data}
                learn_more={properties.learn_more}
                resize={this.props.resize}
                draw_interval={this.props.draw_interval}
                onIndexChange={this.props.onIndexChange}
                data_key={properties.data_key}
                interval_key = {properties.interval_key}
                title={properties.title}
                label_x={properties.label_x}
                label_y={properties.label_y}
                fields={properties.fields}
                index={this.props.index}
                indices={this.props.indices} />
        )
    }
}

class HeaderValue extends React.Component{
  render(){
    var l = 0;
    var values = this.props.values.map(function(val){
        l+=1;
        return (
            <span className={'line'+(l-1)}>{val.toFixed(1)}% </span>
        )
    })

    return (
        <div className='section'>
            <h3 className='header'>{this.props.header}</h3>
            <h4 className='value'>{values} </h4>
        </div>
    )
  }
};

class Legend extends React.Component{
    render(){
        var l = 0;
        var values = this.props.names.map(function(val){
            l= l+1;
            return (
                <span className={'line'+(l-1)}>{val} </span>
            )
        })

        return(
            <div className='section'>
                <h3 className='header'>Legend</h3>
                <h4 className='value'>{values}</h4>
            </div>
        )
    }
}

class ControlPanel extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            pta: [],
            pfa: [],
            prec: [],
            attempt: [],
            names: [],
            mouseHeldInterval: undefined
        };
    }

    setConf(value) {
        this.props.onConfChange(value);
    }

    mouseUp(){
        clearInterval(this.state.mouseHeldInterval);
    }

    incrementConf(increment){
        var conf = this.props.confidence + increment;
        var conf_round = Math.min(1.00,Math.max(0,parseFloat(conf.toFixed(2))));
        this.setConf(conf_round);
    }

    confDown(){
        var increment = -0.01
        this.incrementConf(increment)
        this.setState({mouseHeldInterval:setInterval(function(){this.incrementConf(increment) }.bind(this), 400)})
    }

    confUp(){
        var increment = 0.01;
        this.incrementConf(0.01)
        this.setState({mouseHeldInterval:setInterval(function(){this.incrementConf(increment) }.bind(this), 400)})
    }

    componentWillReceiveProps(nextProps) {
        var state_values={};

        state_values.pta = [];
        state_values.pfa = [];
        state_values.prec = [];
        state_values.attempt = [];

        for (var line in nextProps.indices){
            var line_data = nextProps.data[line];

            state_values.pta.push(line_data['roc_data'][nextProps.indices[line]][1]);
            state_values.pfa.push(line_data['roc_data'][nextProps.indices[line]][0]);

            state_values.prec.push(line_data['precision_data'][nextProps.indices[line]][1]);
            state_values.attempt.push(line_data['precision_data'][nextProps.indices[line]][0]);
        }
        this.setState(state_values);
    }

    componentDidMount(){
        this.componentWillReceiveProps(this.props)

        var names = []
        for (var line in this.props.indices){
            names.push(this.props.data[line]['curve'])
        }

        this.setState({'names':names})
    }

    render() {
        return (
            <div className="control-panel">
                <div className='section'>
                    <h3 className='header'>Current Threshold</h3>
                    <div className='conf-row'>
                        <div className='arrow-down' onMouseDown={this.confDown.bind(this)} onMouseUp={this.mouseUp.bind(this)} onMouseOut={this.mouseUp.bind(this)}/>
                        <h4 className='value'>{parseFloat(this.props.confidence).toFixed(2)}</h4>
                        <div className='arrow-up' onMouseDown={this.confUp.bind(this)}  onMouseUp={this.mouseUp.bind(this)} onMouseOut={this.mouseUp.bind(this)}/>
                    </div>
                    <ReactSlider min={0} max={1} value={parseFloat(this.props.confidence)} step={0.01} onChange={this.setConf.bind(this)} />
                </div>
                <HeaderValue header='On Topic Prob' values={this.state.pta} />
                <HeaderValue header='Off Topic Prob' values={this.state.pfa} />
                <HeaderValue header='On Topic Prec' values={this.state.prec} />
                <HeaderValue header='On Topic Attempted' values={this.state.attempt} />
                <Legend names={this.state.names} />
                <div className='section'>
                    <h3 className='header' onClick={this.props.toggleCI}>Chart Options</h3>
                    <div className='chart-option'>
                        <input className="conf-int" type="checkbox" onChange={this.props.toggleCI}>
                            <span className='option-label'>Confidence Interval</span>
                        </input>
                    </div>
                </div>
            </div>
        );
    }
};


export default class Display extends React.Component{

    constructor(props){
        super(props);

        var confidence = this.props.data[0]['default'];
        this.state = { indices: this.getIndices(confidence), confidence: confidence, draw_interval:false, resize_toggle:true};
    };

    getConfIndex(value, line_id){
        var confidences = this.props.data[line_id]['confidences']
        for (var i=0; i<confidences.length; i++){
            if (confidences[i]>=value){
                return i;
            };
        };
        return confidences.length-1;
    };

    getIndices(new_value){
        var indices = [];
        for (var line_id in this.props.data){
          var index = this.getConfIndex(new_value, line_id)
          indices.push(index)
        }
        return indices
    };

    onConfChange(new_value){
        var state_values = {};

        var indices = this.getIndices(new_value);

        state_values.indices = indices;
        state_values.confidence = new_value;
        this.setState(state_values);
    };

    onIndexChange(index, line_id){
        var confidence = this.props.data[line_id]['confidences'][index]
        this.onConfChange(confidence)
    };

    resize(){
        var new_val = !(this.state.resize_toggle)
        this.setState({resize_toggle:new_val})
    }
    componentDidMount(){
        window.onresize = this.resize.bind(this)
    }

    toggleCI(){
        var new_val = !(this.state.draw_interval)
        this.setState({draw_interval:new_val})
    }

    render(){
        return (
            <div className="display">
                <ChartROC   data={this.props.data}
                            resize={this.state.resize_toggle}
                            draw_interval={this.state.draw_interval}
                            indices={this.state.indices}
                            index={this.state.index}
                            onIndexChange={this.onIndexChange.bind(this)}/>

                <ControlPanel   data={this.props.data}
                                toggleCI={this.toggleCI.bind(this)}
                                onConfChange={this.onConfChange.bind(this)}
                                confidence={this.state.confidence}
                                indices={this.state.indices} />

                <ChartPrec  data={this.props.data}
                            resize={this.state.resize_toggle}
                            draw_interval={this.state.draw_interval}
                            indices={this.state.indices}
                            index={this.state.index}
                            onIndexChange={this.onIndexChange.bind(this)} />
            </div>
      );
    }
}
