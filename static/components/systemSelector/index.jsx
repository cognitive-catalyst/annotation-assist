import React from 'react';
import './style.scss';

const SelectOption = (props) => (
    <div
      className={props.isActive ? 'select-option clickable active' : 'select-option clickable'}
      onClick={() => props.onClick(props.button_text)}
    >
        {props.button_text}
    </div>
);

export default class SystemSelector extends React.Component {

    constructor(props) {
        super(props);

        const overlay = document.createElement('div');
        overlay.setAttribute('class', 'overlay');

        this.state = { popUp: false,
                       systems: [],
                       overlay };
    }

    componentDidMount() {
        const component = this.refs.component_wrapper;
        const dropdown = this.refs.dropdown;

        document.addEventListener('mouseup', this.closePopUp);
        component.addEventListener('mouseup', (event) => { event.stopPropagation(); });
        dropdown.addEventListener('mouseup', this.togglePopUp);
    }

    componentWillUnmount() {
        const component = this.refs.component_wrapper;
        const dropdown = this.refs.dropdown;

        document.removeEventListener('mouseup', this.closePopUp);
        component.removeEventListener('mouseup', (event) => { event.stopPropagation(); });
        dropdown.removeEventListener('mouseup', this.togglePopUp);
    }

    setActiveState = (newState) => {
        this.props.updateSystem(newState);
        this.closePopUp();
    }

    togglePopUp = () => {
        if (this.state.popUp) {
            this.closePopUp();
        } else {
            this.openPopUp();
        }
    }

    openPopUp() {
        document.body.appendChild(this.state.overlay);
        this.setState({ popUp: true });
    }

    closePopUp = () => {
        this.setState({ popUp: false });
        this.state.overlay.remove();
    }


    render() {
        const timeStateSelections = this.props.options;
        const timeSelectButtons = timeStateSelections.map((state) => (
            <SelectOption
              key={state}
              button_text={state}
              isActive={this.state.activeState === state}
              onClick={this.setActiveState}
            />
        ));

        return (
            <div className="system-selector-wrapper" ref="component_wrapper" tabIndex="-1">
                <div className="system-selector-dropdown" ref="dropdown">
                    <span className="icon-calendar icon"></span>
                    {this.props.current_system}
                    <span className="icon-down-open-big icon"></span>
                </div>
                <div className="system-selector" style={{ display: this.state.popUp ? '' : 'none' }}>
                    <div className="calendar-component-right">
                        <div className="button-container">
                            {timeSelectButtons}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
