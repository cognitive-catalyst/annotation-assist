import React from 'react'

class SelectOption extends React.Component{
    constructor(props){
        super(props)
    }

    setTimeState(){
        this.props.onClick(this.props.button_text)
    }

    render(){
        return(
            <div className={this.props.isActive ? "select-option clickable active": "select-option clickable"}
                onClick={this.setTimeState.bind(this)}>
                {this.props.button_text}
            </div>
        )
    }
}

export default class SystemSelector extends React.Component{

    constructor(props){
        super(props)

        var overlay = document.createElement("div");
        overlay.setAttribute("class","overlay");

        this.state = {  popUp:false,
                        overlay: overlay,
                        systems: [] }
    }

    setActiveState(new_state){
        this.props.updateSystem(new_state);
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


    componentDidMount() {
        const body = document.body,
            component = React.findDOMNode(this.refs.component_wrapper),
            dropdown = React.findDOMNode(this.refs.dropdown);

        document.addEventListener("mouseup",this.closePopUp.bind(this));
        component.addEventListener("mouseup",function(event){event.stopPropagation()});
        dropdown.addEventListener("mouseup",this.togglePopUp.bind(this));
    }

    componentWillUnmount() {
        const body = document.body,
            component = React.findDOMNode(this.refs.component_wrapper),
            dropdown = React.findDOMNode(this.refs.dropdown);

        document.removeEventListener("mouseup",this.closePopUp.bind(this));
        component.removeEventListener("mouseup",function(event){event.stopPropagation()});
        dropdown.removeEventListener("mouseup",this.togglePopUp.bind(this));
    }

    render(){
        var timeStateSelections = this.props.options
        var timeSelectButtons = timeStateSelections.map(function(state){

            return (
                <SelectOption button_text={state}
                                    isActive={this.state.activeState==state}
                                    onClick={this.setActiveState.bind(this)}/>
            )
        }.bind(this));

        return(
            <div className="system-selector-wrapper" ref='component_wrapper' tabIndex="-1">
                <div className="system-selector-dropdown" ref='dropdown'>
                    <span className="icon-calendar icon"></span>
                    {this.props.current_system}
                    <span className="icon-down-open-big icon"></span>
                    </div>
                <div className='system-selector' style={{display:this.state.popUp ? '':'none'}}>
                    <div className="calendar-component-right">
                        <div className='button-container'>
                            {timeSelectButtons}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

