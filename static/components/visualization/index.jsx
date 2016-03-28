import React from 'react'
import Display from './visd3'
import Thinking from '../watson-thinking'

export default class Sample extends React.Component{

    constructor(props){
        super(props)
        this.state = {labels:['WPEF Output'],data:undefined}
    }


    componentDidMount(){

        this.getData();
    }

    getData(){

        $.ajax({
                url:  '/api/get_all_gt',
                type: "GET",

                success: function(resp){
                    this.setState({
                        data:JSON.parse(resp)
                    })
            }.bind(this),
            error: function() {
                this.noAnnotations();
            }.bind(this)
        });
    }


    render(){
        if (this.state.data != undefined){
            return (
                <Display data={this.state.data} />
            )
        }
        else{
            return (
                <div className="display">
                    <Thinking loading={true} height='100px' width='100px' />
                </div>
            )
        }

    }
}