import React from 'react'
import Display from './visd3'
import Thinking from '../watson-thinking'

export default class Sample extends React.Component{

    constructor(props){
        super(props)
        this.state = {labels:['WPEF Output'],data:undefined}
    }


    componentDidMount(){
        // this.setState({data:'tru'});

        this.getData();
    }

    getData(){
        // var uri = 'http://wpef_backend.mybluemix.net/sample_data';
        // var uri = '/api/get_all_gt'
        // var xhr = new XMLHttpRequest();

        // xhr.open("GET", uri, false);
        // xhr.send();

        // return JSON.parse(xhr.responseText)

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
        console.log(this.state.data)
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