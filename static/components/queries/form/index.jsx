import React from 'react';

export default class Form extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            gt_box: false,
        };
    }

    gtBoxChecked() {
        const gtBox = this.refs.gt_box;

        this.setState({ gt_box: gtBox.checked });
    }

    handleSubmit(e) {
        e.preventDefault();

        const form = this.refs.form;
        form.submit();
    }

    render() {
        return (
            <div className="buttons">
                <form className="exportForm" action={this.props.loc} method="post" ref="form">

                    <div className="checks">
                        <h3> Select the questions you would like to export! </h3>

                        <div className="check-wrapper">
                            <input className="check" type="checkbox" name="annotated_good" value="annotated_good" defaultChecked />
                            <span>In Purview Questions with Good/Perfect Answers</span>
                        </div>
                        <div className="check-wrapper">
                            <input className="check" type="checkbox" name="annotated_bad" value="annotated_bad" defaultChecked />
                            <span>In Purview Questions with Incorrect/Poor Answers</span>
                        </div>
                        <div className="check-wrapper">
                            <input className="check" type="checkbox" name="off_topic" value="off_topic" defaultChecked />
                            <span>Out of Purview Questions</span>
                        </div>
                    </div>
                    <input type="hidden" name="system-name" value={this.props.system} />

                    <input className="button" type="submit" value="Download" />
                </form>
            </div>
        );
    }
}
