import React from 'react';
import Thinking from 'img/watson-thinking-white.svg';
import $ from 'jquery';
import 'jquery-ui'
import 'jquery-ui/themes/smoothness/jquery-ui.css';
import './style.scss';

export default class Upload extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            log_uri: 'No File Found',
            trying_to_delete: false,
            upload_status: 'not started',
            upload_message: '',
            systems: [],
        };
    }
    componentDidMount() {
        this.getSystems();
    }

    getSystems() {
        $.ajax({
            url: '/api/get_systems',
            type: 'GET',
            success: (resp) => {
                const systems = JSON.parse(resp).systems;
                this.setState({ systems });
            },
        });
    }


    handleLogFile = (e) => {
        const reader = new FileReader();
        const file = e.target.files[0];
        reader.onload = () => {
            this.setState({
                upload_status: 'not started',
                log_uri: file.name,
            });
        };

        reader.readAsDataURL(file);
    }

    deleteDB = () => {
        $.ajax({
            url: '/api/delete_db',
            type: 'POST',
            success: () => {
                location.reload();
            },
        });
    }


    wantsToDelete = () => {
        this.setState({ trying_to_delete: true });
    }

    handleSubmit = (e) => {
        e.preventDefault();

        this.setState({ upload_status: 'started' });

        const form = this.refs.form;
        const fData = new FormData(form);
        const xhr = new XMLHttpRequest();

        xhr.open('POST', '/api/upload', true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    this.setState({ upload_status: 'complete' });

                    form.reset();
                } else {
                    let message;
                    try {
                        message = JSON.parse(xhr.responseText).message;
                    } catch (error) {
                        message = 'Upload Failed';
                    }
                    this.setState({ upload_status: 'failed', upload_message: message });
                }

                form.reset();
            }
        };

        xhr.send(fData);
    }

    render() {
        let firstButton;
        let secondButton;
        if (this.state.trying_to_delete) {
            firstButton = { display: 'none' };
            secondButton = { display: 'block' };
        } else {
            firstButton = { display: 'block' };
            secondButton = { display: 'none' };
        }

        const sys = $('#system-name');
        sys.autocomplete({
            source: this.state.systems,
        });

        return (
            <div className="container">
                <div className="uploads">
                    <p>Upload QuestionsData.csv</p>
                    <form className="upload_form" method="post" action="/api/upload" encType="multipart/form-data" ref="form" onSubmit={this.handleSubmit} >
                        <div className="btn-container">
                            <input id="system-name" placeholder="Select System Name" className="system-name" type="text" name="system-name" ref="sys_name" autoComplete="off" required />

                            <label className="btn">Choose File
                                <input className="upload_file" type="file" onChange={this.handleLogFile} name="data" required />
                            </label>

                            <span className="filename" style={{ display: this.state.upload_status === 'not started' ? '' : 'none' }}>{this.state.log_uri}</span>
                            <img className="loading" style={{ display: this.state.upload_status === 'started' ? '' : 'none' }} src={Thinking} alt="uploading..." />
                            <span className="filename" style={{ display: this.state.upload_status === 'complete' ? '' : 'none' }} >&#10003; Upload Succeeded</span>
                            <span className="filename" style={{ display: this.state.upload_status === 'failed' ? '' : 'none' }}>&#10007; &nbsp; {this.state.upload_message}</span>

                            <input className="btn" type="submit" value="Submit" />
                        </div>
                    </form>

                    <p>Note: You may upload multiple QuestionsData.csv files as you wish</p>
                    <div className="btn-container">
                        <label className="btn" style={firstButton} onClick={this.wantsToDelete}>Delete Database</label>
                        <label className="btn" style={secondButton} onClick={this.deleteDB}>Are You Sure? This Cannot Be Undone.</label>
                    </div>
                </div>
            </div>
        );
    }
}
