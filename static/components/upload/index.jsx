
var
React = require('react'),
Header = require('../header'),
Thinking = require('../watson-thinking'),
$ = require('jquery'),
ui = require('jquery-ui'),
ui_style = require('jquery-ui/themes/smoothness/jquery-ui.css'),

Upload = React.createClass({

    wantsToDelete: function() {
        this.setState({trying_to_delete: true});
    },

    deleteDB: function() {
        $.ajax({
            url: '/api/delete_db',
            type: 'POST',
            success: function(){
                location.reload();
            }
        });
    },

    getInitialState: function() {
        return {log_uri : "No File Found",
                trying_to_delete: false,
                upload_status:"not started",
                systems:[]};
    },


    handleLogFile: function(e) {
        var self = this;
        var reader = new FileReader();
        var file = e.target.files[0];

        reader.onload = function(upload) {
            self.setState({
                upload_status:"not started",
                log_uri: file.name
            });
        }

        reader.readAsDataURL(file);
    },

    getSystems: function(){
        $.ajax({
            url: '/api/get_systems',
            type: "GET",
            success: function(resp) {
                var systems = JSON.parse(resp).systems;
                console.log(systems)
                this.setState({systems:systems});
            }.bind(this)
        })
    },

    handleSubmit: function(e) {
        e.preventDefault();

        this.setState({upload_status:'started'});

        var form = React.findDOMNode(this.refs.form);
        var fData = new FormData(form);
        var xhr = new XMLHttpRequest();

        xhr.open("POST", '/api/upload', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState==4){
                if (xhr.status == 200) {
                    this.setState({upload_status:'complete'});

                    form.reset()
                }
                else{
                    this.setState({upload_status:'failed'});
                }
            }

        }.bind(this);

        xhr.send(fData);
    },

    componentDidMount: function() {
          this.getSystems();
    },

    render: function() {
        let first_button;
        let second_button;
        if (this.state.trying_to_delete) {
            first_button = {display: 'none'};
            second_button = {display: 'block'};
        }
        else {
            first_button = {display: 'block'};
            second_button = {display: 'none'};
        }

        var sys = $( "#system-name" );
        sys.autocomplete({
          source: this.state.systems
        });

        console.log(this.state.upload_status)
        return (
            <div className='container'>
                <div className='uploads'>
                    <p>Upload QuestionsData.csv</p>
                    <form className="upload_form" method="post" action="/api/upload" encType="multipart/form-data" ref='form' onSubmit={this.handleSubmit} >
                        <div className="btn-container">
                            <input id='system-name' placeholder="Select System Name" className='system-name' type="text" name= "system-name" ref='sys_name' autoComplete='off' required/>

                            <label className="btn">Choose File
                                <input className="upload_file" type="file" onChange={this.handleLogFile} name="data" required/>
                            </label>

                            <span className="filename" style={{display: this.state.upload_status == 'not started' ? '':'none'}}>{this.state.log_uri}</span>
                            <img className="loading" style={{display: this.state.upload_status == 'started' ? '':'none'}} src='static/img/watson-thinking-white.svg'/>
                            <span className="filename" style={{display: this.state.upload_status == 'complete' ? '':'none'}} >&#10003; Upload Succeeded</span>
                            <span className="filename" style={{display: this.state.upload_status == 'failed' ? '':'none'}}>&#10007; Upload Failed</span>


                            {/**(() => {
                                switch(this.state.uploads_status) {
                                    case 'not started':
                                        return (<span className="filename" >{this.state.log_uri}</span>)
                                    case 'started':
                                        return (<img className="loading" src='static/img/watson-thinking-white.svg'/>)
                                    case 'complete':
                                        return (<span className="filename" >&#10003; Upload Succeeded</span>)
                                    case 'failed':
                                        return (<span className="filename" >&#10007; Upload Failed</span>)
                                }
                            })()*/}
                            <input className="btn" type="submit" value="Submit" />
                        </div>
                    </form>

                    <p>Note: You may upload multiple QuestionsData.csv files as you wish</p>
                    <div className="btn-container">
                     <label className='btn' style={first_button} onClick={this.wantsToDelete}>Delete Database</label>
                     <label className='btn' style={second_button} onClick={this.deleteDB}>Are You Sure? This Cannot Be Undone.</label>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = Upload;
