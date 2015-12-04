
var
React = require('react/addons'),
Header = require('../header'),
LinearProgress = require('material-ui/lib/linear-progress'),

Upload = React.createClass({
    uploadProgress: function() {
        $.ajax({
            url: '/api/pau_status',
            type: "GET",
            success: function(data){
                this.setState({pau_progress: parseFloat(data)});
            }.bind(this)
        });
    },

    componentDidMount: function() {
        console.log('made it');
        this.uploadProgress();
        setInterval(this.uploadProgress, 1000);
    },

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
                pau_uri  : "No File Found",
                gt_uri  : "No File Found",
                pau_progress: 100,
                trying_to_delete: false
               };
    },

    handleSubmit: function(e) {
        e.preventDefault();
    },

    handlePAUFile: function(e) {
        var self = this;
        var reader = new FileReader();
        var file = e.target.files[0];

        reader.onload = function(upload) {
            self.setState({
                pau_uri: file.name,
            });
        }

    reader.readAsDataURL(file);

    },

    handleGroundTruthFile: function(e) {
        var self = this;
        var reader = new FileReader();
        var file = e.target.files[0];

        reader.onload = function(upload) {
            self.setState({
                gt_uri: file.name,
            });
        }

    reader.readAsDataURL(file);

    },

    handleLogFile: function(e) {
        var self = this;
        var reader = new FileReader();
        var file = e.target.files[0];

        reader.onload = function(upload) {
            self.setState({
                log_uri: file.name,
            });
        }

    reader.readAsDataURL(file);

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
                    <p>Step 1 (optional): Upload JSON file with entire corpus of PAU IDs</p>
                    <form className="upload_form" method="post" action="/api/pau_upload" encType="multipart/form-data">
                        <div className="btn-container">
                            <label className="btn">Choose File
                                <input className="upload_file" type="file" onChange={this.handlePAUFile} name="data"/>
                            </label>
                            <span className="filename"> {this.state.pau_uri}</span>
                            <input className="btn" type="submit" value="Submit" />
                        </div>
                    </form>
                    <div style= {this.state.pau_progress < 100 ?  {display: 'block'} : {display: 'none'}}>
                        <LinearProgress mode="determinate" value={this.state.pau_progress} />
                    </div>
                    <p>Step 2 (optional): Upload CSV containing all approved question/answer pairs (aka Ground Truth)</p>
                    <form className="upload_form" method="post" action="/api/upload" encType="multipart/form-data">
                        <input type="hidden" name="gt" value="Ground Truth"/>
                        <div className="btn-container">
                            <label className="btn">Choose File
                                <input className="upload_file" type="file" onChange={this.handleGroundTruthFile} name="data"/>
                            </label>
                            <span className="filename"> {this.state.gt_uri}</span>
                            <input className="btn" type="submit" value="Submit"/>
                        </div>
                    </form>
                    <p>Step 3 (mandatory): Upload QuestionsData.csv</p>
                    <form className="upload_form" method="post" action="/api/upload" encType="multipart/form-data">
                        <input type="hidden" name="gt" value="Logs"/>
                        <div className="btn-container">
                            <label className="btn">Choose File
                                <input className="upload_file" type="file" onChange={this.handleLogFile} name="data"/>
                            </label>
                            <span className="filename"> {this.state.log_uri}</span>
                            <input className="btn" type="submit" value="Submit"/>
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
