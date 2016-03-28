import React from 'react'
import Logo from 'img/watson-logo-blue.svg'
import $ from 'jquery'

export default class AccuracyPopUp extends React.Component{

    constructor(props){
        super(props);
        this.state = {show:false,
                       out_sample_qs: ["",""],
                       in_sample_qs: ["",""],
                       descriptions: ["",""]
                    };
    }

    togglePopUp(){
        this.setState({show:!this.state.show});
    }

    closePopUp(){
        this.setState({show:false});
    }



    getPurviewConfig() {
        $.ajax({
            url: '/api/get_purview_qs',
            type: "GET",
            success: function(data){
                var qs = JSON.parse(data)
                this.setState({
                    out_sample_qs: qs["out_sample"],
                    in_sample_qs: qs["in_sample"],
                    descriptions: qs["descriptions"]
                });
            }.bind(this)
        });
    }

    componentDidMount() {
        this.getPurviewConfig();
    }

    render(){
        return(
            <div className="accuracy-pop-up" ref="popUp" tabIndex="-1" onBlur={this.closePopUp.bind(this)}>
                <div className="display-text" onClick={this.togglePopUp.bind(this)} ref="display_text" style={this.props.loading ? {display: 'none'} : {display: 'block'}}>What's this?</div>
                <div className="pop-up-wrapper" style={this.state.show ? {}:{display:'none'}}>
                    <div className="pop-up" >
                        <div className="close" onClick={this.closePopUp.bind(this)}> &#10005; </div>
                        <div className="top-row">
                            <img className="watson-logo" src={Logo} />
                            <div className="pop-up-header">Help Improve Watson's Accuracy</div>
                        </div>
                        <div className="bottom-row">
                            <div className="info-box component-left">
                                <p><span className="category-header">Determine queries outside of Watson's purview.</span> {this.state.descriptions[1]} </p>
                                <ul className="questions">
                                    <li> {this.state.out_sample_qs[0]} </li>
                                    <li> {this.state.out_sample_qs[1]} </li>
                                </ul>
                            </div>
                            <div className="info-box component-right">
                                <p><span className="category-header">Queries within Watson purview.</span> {this.state.descriptions[0]} </p>
                                <ul className="questions">
                                    <li> {this.state.in_sample_qs[0]} </li>
                                    <li> {this.state.in_sample_qs[1]} </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}