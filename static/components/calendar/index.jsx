import React from 'react'
var classNames = require('classnames');
var DatePicker = require('react-date-picker');


function isValidDate(dateString)
{
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};

class TimeSelectButton extends React.Component{
    constructor(props){
        super(props)
    }

    setTimeState(){
        this.props.onClick(this.props.button_text)
    }

    render(){
        return(
            <div className={this.props.isActive ? "time-range-button clickable active": "time-range-button clickable"}
                onClick={this.setTimeState.bind(this)}>
                {this.props.button_text}
            </div>
        )
    }
}

class DateIndicators extends React.Component{
    constructor(props){
        super(props)
        var date = this.props.date.split("-");
        this.state = {year:date[0],month:date[1],day:date[2], isValid:true}
    }

    handleChange(event) {
        var date = event.target.value.split("/");
        if (date.length == 3){
            if (isValidDate(event.target.value)){
                var dateString = date[2]+'-'+date[0]+'-'+date[1];
                this.props.onChange(dateString)
                this.setState({month:date[0],day:date[1],year:date[2],isValid:true})
            }
            else{
                this.setState({month:date[0],day:date[1],year:date[2],isValid:false})
            }
        }

    }

    componentWillReceiveProps(newProps) {
        var date = newProps.date.split("-");
        this.setState({year:date[0],month:date[1],day:date[2], isValid:true});
    }

    render(){
        var date = this.state.month + '/' + this.state.day + "/" + this.state.year;

        var textClass = classNames({
            date:true,
            active:this.props.isActive,
            invalid:!this.state.isValid
        });

        return(
            <div className="date-indicator">
                {this.props.text}
                <input type="text" className={textClass} onChange={this.handleChange.bind(this)} value={date} onClick={this.props.onClick}></input>
            </div>
        )
    }
}

export default class Calendar extends React.Component{

    constructor(props){
        super(props)

        var startString=this.props.startDate;
        var endString=this.props.endDate;

        if (startString==0){
            var today = new Date()
            var startString = today.toISOString().substring(0, 10)
        }
        if (endString==0){
            var today = new Date()
            var endString = today.toISOString().substring(0, 10)
        }

        var overlay = document.createElement("div");
        overlay.setAttribute("class","overlay");

        this.state = {  popUp:false,
                        startDate:startString,
                        startView:startString,
                        endDate:endString,
                        endView:endString,
                        activeState: "ALL TIME",
                        displayText:"ALL TIME",
                        overlay: overlay
                        }
    }

    onStartChange(dateString, moment){
        this.setState({startDate:dateString, startView:dateString})
    }

    onEndChange(dateString, moment){
        this.setState({endDate:dateString, endView:dateString})
    }

    submitSelection(){
        if (this.state.activeState=="CALENDAR"){
            this.setState({displayText:this.state.startDate + " TO " + this.state.endDate});
            this.props.changeDate(this.state.startDate,this.state.endDate);
        }
        else{
            this.setState({displayText:this.state.activeState})
            this.props.changeDate(0,0);
        }
        this.closePopUp();
    }

    setActiveState(state){
        this.setState({activeState:state,displayText:state});
        this.props.changeDate(0,0);
        this.closePopUp();
    }

    togglePopUp(){

        if (this.state.popUp){
            this.closePopUp()
        }
        else{
            this.openPopUp()
        }
    }

    openPopUp(){
        document.body.appendChild(this.state.overlay);

        this.setState({popUp:true});
    }

    closePopUp(){
        this.setState({popUp:false});
        this.state.overlay.remove()
    }

    showCalendar(){
        this.setState({activeState:"CALENDAR"});
    }

    onStartViewChange(dateText, moment , view){
        this.setState({startView:dateText})
    }

    onEndViewChange(dateText, moment , view){
        this.setState({endView:dateText})
    }

    componentDidMount() {
        var body = document.body,
            calendar = React.findDOMNode(this.refs.calendar),
            dropdown = React.findDOMNode(this.refs.dropdown);

        document.addEventListener("mouseup",this.closePopUp.bind(this));
        calendar.addEventListener("mouseup",function(event){event.stopPropagation()});
        dropdown.addEventListener("mouseup",this.togglePopUp.bind(this));
    }

    componentWillUnmount() {
        var body = document.body,
            calendar = React.findDOMNode(this.refs.calendar),
            dropdown = React.findDOMNode(this.refs.dropdown);

        document.removeEventListener("mouseup");
        calendar.removeEventListener("mouseup");
        dropdown.removeEventListener("mouseup");
    }

    render(){
        var timeStateSelections = ["LAST UPLOAD","LAST 3 UPLOADS","LAST 5 UPLOADS", "ALL TIME"]
        var timeSelectButtons = timeStateSelections.map(function(state){

            return (
                <TimeSelectButton button_text={state}
                                    isActive={this.state.activeState==state}
                                    onClick={this.setActiveState.bind(this)}/>
            )
        }.bind(this));


        return(
            <div className="calendar-component-wrapper" ref='calendar' tabIndex="-1">
                <div className="calendar-dropdown" ref='dropdown'>
                    <span className="icon-calendar icon"></span>
                    {this.state.displayText}
                    <span className="icon-down-open-big icon"></span>
                    </div>
                <div className='calendar-component' style={{display:this.state.popUp ? '':'none'}}>
                    <div className='calendar-component-left' style={{display:this.state.activeState=="CALENDAR" ? '':'none'}}>
                        <div className='calendar-component-left-top'>
                            <DatePicker
                                maxDate={this.state.endDate}
                                date={this.state.startDate}
                                onChange={this.onStartChange.bind(this)}
                                viewDate={this.state.startView}
                                onViewDateChange={this.onStartViewChange.bind(this)}/>
                            <DatePicker
                                minDate={this.state.startDate}
                                date={this.state.endDate}
                                onChange={this.onEndChange.bind(this)}
                                viewDate={this.state.endView}
                                onViewDateChange={this.onEndViewChange.bind(this)}/>
                        </div>
                        <div className='calendar-component-left-bottom'>
                            <div className='submit-button clickable' onClick={this.submitSelection.bind(this)}> SUBMIT </div>
                        </div>

                    </div>
                    <div className="calendar-component-right">
                        <div className='button-container'>
                            {timeSelectButtons}
                        </div>
                        <div className='date-indicator-container'>
                            <DateIndicators onClick={this.showCalendar.bind(this)} onChange={this.onStartChange.bind(this)} text="FROM" isActive={this.state.activeState=="CALENDAR"} date={this.state.startDate} />
                            <DateIndicators onClick={this.showCalendar.bind(this)} onChange={this.onEndChange.bind(this)} text="TO" isActive={this.state.activeState=="CALENDAR"} date={this.state.endDate}/>
                        </div>
                    </div>
                </div>
            </div>

        )
    }
}

