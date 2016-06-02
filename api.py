import ConfigParser
import csv
import datetime
import json
import logging
import math
import os
import StringIO

from flask import Blueprint, Response, request, send_file

from db_ops import get_manager

# import db_ops_db2 as db_ops

blueprint = Blueprint("api", __name__)
config = ConfigParser.ConfigParser()
config.read('config/properties.ini')

db_ops = get_manager(
    config.get('database', 'database_type'),
    config.get('database', 'hostname'),
    config.get('database', 'db'),
    config.get('database', 'username'),
    config.get('database', 'password'),
)


@blueprint.route('/delete_db', methods=['POST'])
def delete():

    db_ops.delete_all()
    return 'done'


@blueprint.route('/upload', methods=['POST'])
def upload():
    data = request.files['data']
    system_name = request.form['system-name']
    filename = data.filename
    name, ext = os.path.splitext(filename)
    if ext not in ['.csv']:
        return Response(json.dumps({'message': 'Invalid File Type'}), status=400)

    upload_status = db_ops.upload_questions(system_name, data)

    if upload_status is not True:
        return Response(json.dumps({'message': upload_status}), status=400)

    return Response(json.dumps({'message': 'Upload Successful'}), status=200)


@blueprint.route('/get_question', methods=["POST"])
def annotate():
    system_name = request.form['system_name']
    question_data = db_ops.get_question(system_name)
    if question_data:
        return Response(json.dumps(question_data), status=200)
    else:
        return Response(json.dumps({'message': 'no questions found'}), status=204)


@blueprint.route('/get_question/<path:q_id>', methods=["GET"])
def get_question_from_id(q_id):
    question_data = db_ops.get_question_from_id(q_id)
    if question_data:
        return Response(json.dumps(question_data), status=200)
    else:
        return Response(json.dumps({'message': 'no questions found'}), status=204)


@blueprint.route('/get_systems', methods=["POST", "GET"])
def get_systems():
    systems = db_ops.get_systems()
    return json.dumps({'systems': systems})


@blueprint.route('/update', methods=["POST", "GET"])
def topic():
    question_id = request.form['_id']
    is_on_topic = request.form['on_topic']
    if(is_on_topic) == 'true':
        is_on_topic = True
        human_performance = request.form['human_performance']
    else:
        is_on_topic = False
        human_performance = 0
    db_ops.update_question(question_id, is_on_topic, human_performance)
    return 'done'


@blueprint.route('/get_all_gt', methods=["POST", "GET"])
def get_all_gt():
    vis_data = []
    for system in db_ops.get_systems():
        questions = db_ops.get_annotated(system)
        if questions != []:
            on_good = []
            on_bad = []
            off_topic = []
            for q in questions:
                if q['Is_In_Purview'] == 0:
                    off_topic.append(q['Confidence'])
                elif q['Annotation_Score'] > 50:
                    on_good.append(q['Confidence'])
                else:
                    on_bad.append(q['Confidence'])

            vis_data.append(compute_roc_json(on_good, on_bad, off_topic, system))

    return json.dumps(vis_data)


def _encode_me(d):
    for key in d:
        if type(d[key]) not in [int, bool, datetime.datetime, float]:
            d[key] = d[key].encode('latin-1')
    return d


@blueprint.route('/export_gt', methods=["POST", "GET"])
def export_gt():
    gt = db_ops.get_annotated(request.form['system-name'])

    buf = StringIO.StringIO()
    headers = gt[0].keys()
    f = csv.DictWriter(buf, fieldnames=headers)
    f.writeheader()

    for line in gt:
        f.writerow(_encode_me(line))

    buf.seek(0)

    sys_name = request.form['system-name']
    if sys_name == '':
        sys_name = 'all'

    return send_file(buf, as_attachment=True, attachment_filename='annotated_qa_{0}.csv'.format(sys_name))


@blueprint.route('/get_percent', methods=["POST", "GET"])
def get_percent():
    system_name = request.form['system_name']

    return str(db_ops.get_percent(system_name))


@blueprint.route('/get_purview_qs', methods=["GET"])
def get_purview():
    in_purview = [config.get('properties', 'in_purview1'), config.get('properties', 'in_purview2')]
    out_purview = [config.get('properties', 'out_purview1'), config.get('properties', 'out_purview2')]
    purview_descriptions = [config.get('properties', 'in_purview_description'), config.get('properties', 'out_purview_description')]
    return json.dumps({"out_sample": out_purview, "in_sample": in_purview, "descriptions": purview_descriptions})


def compute_roc_json(on_topic_good, on_topic_bad, off_topic, file_name=''):
    '''The inputs are lists of confidence numbers.
    Returns the data points for the ROC and Precisision curves.
    '''

    off_topic = sorted(off_topic)
    on_topic_good = sorted(on_topic_good)
    on_topic_bad = sorted(on_topic_bad)

    num_on_topic = len(on_topic_bad) + len(on_topic_good)

    roc_data = []
    roc_conf_interval = []
    prec_data = []
    prec_conf_interval = []

    answered_correct = len(on_topic_good)
    answered_incorrect = len(on_topic_bad)
    answered_off_topic = len(off_topic)

    unique_confidences = set(off_topic + on_topic_good + on_topic_bad)

    # check to make sure values between 0 and 1...assumes it is 0 to 100 if false
    if max(unique_confidences) > 1:
        off_topic = [i / 100 for i in off_topic]
        on_topic_good = [i / 100 for i in on_topic_good]
        on_topic_bad = [i / 100 for i in on_topic_bad]
        unique_confidences = set(off_topic + on_topic_good + on_topic_bad)
    unique_confidences = sorted(unique_confidences)

    for i in unique_confidences:

        answered_correct = amountAnswered(on_topic_good, i, answered_correct)
        answered_incorrect = amountAnswered(on_topic_bad, i, answered_incorrect)
        answered_off_topic = amountAnswered(off_topic, i, answered_off_topic)

        try:
            pta = 100.0 * answered_correct / num_on_topic
        except:
            pta = 100.0
        try:
            pfa = 100.0 * answered_off_topic / len(off_topic)
        except:
            pfa = 100.0

        roc_data.append([pfa, pta])

        roc_interval = compute_interval(pta, num_on_topic + len(off_topic))
        roc_conf_interval.append([pfa, pta + roc_interval, pta - roc_interval])

        answered_total = answered_correct + answered_incorrect

        try:
            precision = 100.0 * answered_correct / answered_total
        except:
            precision = 100.0
        try:
            questions_answered = 100.0 * answered_total / num_on_topic
        except:
            questions_answered = 0.0

        prec_data.append([questions_answered, precision])
        prec_interval = compute_interval(precision, answered_correct + answered_incorrect)
        if prec_interval is not None:
            prec_conf_interval.append([questions_answered, precision + prec_interval, precision - prec_interval])

    x_axis = []
    y_axis = []
    for i in roc_data:
        x_axis.append(i[0])
        y_axis.append(i[1])
    min_x = min(x_axis)
    max_x = max(x_axis)
    min_y = min(y_axis)
    max_y = max(y_axis)
    default = 0.0
    for i in range(0, len(x_axis)):
        try:
            temp = abs((y_axis[i] - min_y) / (max_y - min_y) - (x_axis[i] - min_x) / (max_x - min_x))
        except:
            temp = 0.0
        if temp > default:
            default = temp

    return {'roc_data': roc_data,
            'roc_conf': roc_conf_interval,
            'precision_data': prec_data,
            'prec_conf': prec_conf_interval,
            'confidences': unique_confidences,
            'curve': file_name,
            'default': default}


def compute_interval(val, n):
    try:
        perc = val / 100
        squared = perc * (1 - perc) / n
        interval = 1.96 * math.sqrt(squared) * 100
    except:
        return None
    return interval


def amountAnswered(array, threshold, last_value):
    '''Given an array and a confidence threshold.
    Returns the number of questions that will be answered
    '''
    start_index = (len(array) - last_value)
    array_to_search = array[start_index:]
    for i, confidence in enumerate(array_to_search):
        if (confidence > threshold):
            return len(array_to_search) - i
    return 0
