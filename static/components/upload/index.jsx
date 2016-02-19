
var
React = require('react'),
Header = require('../header'),
Thinking = require('../watson-thinking'),

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
                upload_status:"not started"
               };
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

    handleSubmit: function(e) {
        e.preventDefault();

        this.setState({upload_status:'started'});

        var fData = new FormData(React.findDOMNode(this.refs.form));

        console.log(fData)
        console.log($("#file")[0].files[0])

        var xhr = new XMLHttpRequest();

        xhr.open("POST", '/api/upload', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState==4){
                if (xhr.status == 200) {
                    this.setState({upload_status:'complete'});
                }
                else{
                    this.setState({upload_status:'failed'});
                }
            }

        }.bind(this);

        xhr.send(fData);
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

        return (
            <div className='container'>
                <div className='uploads'>
                    <p>Upload QuestionsData.csv</p>
                    <form className="upload_form" method="post" action="/api/upload" encType="multipart/form-data" ref='form' onSubmit={this.handleSubmit} >
                        <input type="hidden" name="gt" value="Logs"/>
                        <div className="btn-container">
                            <label className="btn">Choose File
                                <input id="file" className="upload_file" type="file" onChange={this.handleLogFile} name="data" required/>
                            </label>
                            {(() => {
                                switch(this.state.upload_status) {
                                    case 'not started':
                                        return (<span className="filename" >{this.state.log_uri}</span>)
                                    case 'started':
                                        return (<img className="loading" src='static/img/watson-thinking-white.svg'/>)
                                    case 'complete':
                                        return (<span className="filename" >&#10003; Upload Succeeded</span>)
                                    case 'failed':
                                        return (<span className="filename" >&#10007; Upload Failed</span>)
                                    default:
                                        return 'no match'
                                }
                            })()}
                            <input className="btn" type="submit" value="Submit" />
                        </div>
                    </form>

                    <p>Note: You may upload multiple QuestionsData.csv files as you wish</p>
                    <div className="btn-container">
                     <label className='btn' style={first_button} onClick={this.wantsToDelete.bind(this)}>Delete Database</label>
                     <label className='btn' style={second_button} onClick={this.deleteDB.bind(this)}>Are You Sure? This Cannot Be Undone.</label>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = Upload;
