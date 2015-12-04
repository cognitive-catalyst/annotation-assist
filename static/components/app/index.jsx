import React from 'react'
import Header from '../header'
import "../../sass/main.scss"
export default class App extends React.Component{

    constructor(props){
        super(props)
        this.state={route: window.history};
    }


    render() {
        return (
            <div className='app'>
                <Header path={this.props.location.pathname}/>
                {this.props.children}
            </div>
        )
    }
}

