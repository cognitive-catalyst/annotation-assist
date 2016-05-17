import React from 'react';
import Button from 'button';
import AccuracyPopUp from 'accuracyPopUp';
import WatsonThinking from 'img/watson-thinking.svg';
import './style.scss';

export default (props) => (
    <div className="query_card_background" style={{ background: props.on_topic & !props.loading ? 'rgba(255,255,255, 0.5)' : 'white' }}>
        <div className="card">
            <p className="heading">User queried...</p>
            <img className="loading" style={{ height: '70px', width: '70px', display: props.question ? 'none' : '' }} src={WatsonThinking} alt="loading" />
            <p className="question">{props.question}</p>
            <div className="purview" style={props.new_questions ? { display: 'block' } : { display: 'none' }}>
                <Button onClick={props.onTopic} label="WITHIN PURVIEW" color="within-purview" loading={props.loading} active={props.on_topic} />
                <Button onClick={props.offTopic} label="OUTSIDE OF PURVIEW" color="outside-of-purview" loading={props.loading} active={false} />
                <AccuracyPopUp loading={props.loading} />
            </div>
        </div>
    </div>
);
