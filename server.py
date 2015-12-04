from flask import Flask, request, send_file, redirect, render_template, send_from_directory
import os
import json
import StringIO
import db_ops
import datetime
import time
import pandas as pd
import ConfigParser
from xmgr import write_to_xmgr
import math


app = Flask(__name__, template_folder='.')
config = ConfigParser.ConfigParser()
config.read('properties.ini')

try:
    vcap = json.loads(os.getenv('VCAP_SERVICES'))

except:
    vcap = {
        "cloudantNoSQLDB": [
            {
                "credentials": {
                    "url": config.get('properties', 'cloudant_auth_url')
                }
            }
        ]
    }

db_creds = vcap['cloudantNoSQLDB'][0]['credentials']


def format_date(initial_format):
    return time.mktime(datetime.datetime.strptime(initial_format, "%Y-%m-%d").timetuple())

check_start_time = lambda timearg: 0 if timearg == '0' else format_date(timearg)
check_end_time = lambda timearg: time.time() if timearg == '0' else format_date(timearg)


@app.route("/static/build/bundle.js")
def bundle():
    return send_from_directory("static/build", "bundle.js")


@app.route('/vis')
def vis():
    return render_template("index.html")


@app.route('/')
def index():
    return render_template("index.html")


@app.route('/uploading')
def index1():
    return render_template("index.html")


@app.route('/downloading')
def index2():
    return render_template("index.html")


@app.route('/api/delete_db', methods=['POST'])
def delete():
    db_ops.delete(db_creds)
    return 'done'


@app.route('/api/upload', methods=['POST'])
def upload():
    data = request.files['data']
    if(request.form['gt'] == "Ground Truth"):
        gt = True
    else:
        gt = False
    if data:
        filename = data.filename
        name, ext = os.path.splitext(filename)
        if ext not in ['.csv']:
            return "File extension not allowed."
        db_ops.upload_docs(db_creds, data.read(), gt)
    return redirect("/uploading")


@app.route('/api/pau_status', methods=['GET'])
def pau_status():
    return json.dumps(db_ops.pau_stat())


@app.route('/api/pau_upload', methods=['POST'])
def upload_paus():
    data = request.files['data']
    if data:
        filename = data.filename
        name, ext = os.path.splitext(filename)
        if ext not in ['.json']:
            return "File extension not allowed."
        db_ops.upload_paus(db_creds, data.read())
    return redirect("/uploading")


@app.route('/api/get_question', methods=["POST", "GET"])
def annotate():
    st = check_start_time(request.form['start_time'])
    et = check_end_time(request.form['end_time'])

    questions = db_ops.get_question(db_creds, st, et)
    return json.dumps(questions)


@app.route('/api/topic', methods=["POST", "GET"])
def topic():
    question_id = request.form['_id']
    on_topic = request.form['on_topic']
    if(on_topic):
        human_performance = request.form['human_performance']
    else:
        human_performance = "null"
    db_ops.update_question(db_creds, question_id, on_topic, human_performance)
    return 'done'


def _get_gt(form):
    try:
        st = check_start_time(form['start_time'])
        et = check_end_time(form['end_time'])
    except:
        st = 0
        et = time.time()

    if et == 0:
        et = time.time()

    payload = {"annotated_good": ("annotated_good" in form.keys()),
               "annotated_bad": ("annotated_bad" in form.keys()),
               "off_topic": ("off_topic" in form.keys()),
               "st": st,
               "et": et,
               "threshold": 70}

    print payload

    return db_ops.get_gt(db_creds, payload)


@app.route('/api/get_all_gt', methods=["POST", "GET"])
def get_all_gt():

    t1 = time.time()
    annotated = _get_gt({"annotated_good": True,
                         "annotated_bad": True,
                         "off_topic": True})
    t2 = time.time()

    on_topic = [(float(q['confidence']), int(q['judgement'])) for q in annotated if q['judgement'].isdigit()]
    off_topic = [float(q['confidence']) for q in annotated if q['judgement'] == "off topic"]

    on_good = [q[0] for q in on_topic if q[1] > 50]
    on_bad = [q[0] for q in on_topic if q[1] < 50]

    t3 = time.time()

    returned = json.dumps([compute_roc_json(on_good, on_bad, off_topic)])
    t4 = time.time()

    print "1: " + str(t2 - t1)
    print "2: " + str(t3 - t2)
    print "3: " + str(t4 - t3)

    return returned


@app.route('/api/export_gt', methods=["POST", "GET"])
def export_gt():
    print 'here'
    # st = check_start_time(request.form['start_time'])
    # et = check_end_time(request.form['end_time'])
    # if et == 0:
    #     et = time.time()

    # try:
    #     if request.form['annotated_good']:
    #         annotated_good = True
    # except:
    #     annotated_good = False

    # try:
    #     if request.form['annotated_bad']:
    #         annotated_bad = True
    # except:
    #     annotated_bad = False

    # try:
    #     if request.form['off_topic']:
    #         off_topic = True
    # except:
    #     off_topic = False

    # payload = {"annotated_good": annotated_good,
    #            "annotated_bad": annotated_bad,
    #            "off_topic": off_topic,
    #            "st": st,
    #            "et": et,
    #            "threshold": 70}

    # print payload

    # jr = db_ops.get_gt(db_creds, payload)

    jr = _get_gt(request.form)

    df = pd.DataFrame(columns=['question', 'PAU', 'answer', 'on_topic', "confidence", "judgement", "datetime"])

    for index, doc in enumerate(jr):
        if 'PAU' not in doc:
            doc['PAU'] = ""
        if 'queryTime' not in doc:
            doc['queryTime'] = ''
        # df.loc[index] = [doc['question'].encode('ascii', 'ignore'), doc['PAU'], doc['answer'].encode('ascii', 'ignore'), doc['on_topic'], doc["confidence"], doc["judgement"]]
        df.loc[index] = [doc['question'].encode('utf-8'), doc['PAU'], doc['answer'].encode('utf-8'), doc['on_topic'], doc["confidence"], doc["judgement"], doc["queryTime"]]

        if 'gt_box' in request.form.keys():
            write_to_xmgr(doc, request.form['url'], request.form['user'], request.form['password'])
            break

    buf = StringIO.StringIO()
    df.to_csv(buf, index=None)
    buf.seek(0)
    return send_file(buf, as_attachment=True, attachment_filename='new_ground_truth.csv')


@app.route('/api/get_percent', methods=["POST", "GET"])
def get_percent():
    st = check_start_time(request.form['start_time'])
    et = check_end_time(request.form['end_time'])
    if et == 0:
        et = time.time()

    return str(db_ops.percent(db_creds, st, et) * 100)


@app.route('/api/get_purview_qs', methods=["GET"])
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


if __name__ == '__main__':
    port = os.getenv('VCAP_APP_PORT', '8000')
    app.run(host='0.0.0.0', port=int(port), debug=True, threaded=True)
