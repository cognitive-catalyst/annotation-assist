import json
import csv
import requests
import random
import time
import sys
import pandas as pd
import StringIO
import numpy as np
import ConfigParser
import threading

config = ConfigParser.ConfigParser()
config.read('properties.ini')

pau_status = 100


def _post(url, data):
    return requests.post(
        url,
        headers={'Content-type': 'application/json'},
        data=json.dumps(data)
    )


def _put(url, data):
    return requests.put(
        url,
        headers={'Content-type': 'application/json'},
        data=json.dumps(data)
    )


def _get(url):
    return requests.get(url)


def index_post(url, fields):
    _post(
        url,
        {
            "type": "json",
            "index": {
                "fields": fields
            }
        }
    )


def delete(db_creds):
    return requests.delete(db_creds['url'] + '/questionstore').json()


def percent(db_creds, time_start, time_end):
    annotated_url = db_creds['url'] + "/questionstore/_design/total_annotated/_view/annotated"
    not_annotated_url = db_creds['url'] + "/questionstore/_design/total_annotated/_view/not_annotated"

    annotated = requests.get(annotated_url).json()["rows"]
    not_annotated = requests.get(not_annotated_url).json()["rows"]

    total_annotated = 0
    total_not_annotated = 0

    for doc in annotated:
        if int(doc["value"]) >= time_start and int(doc["value"]) <= time_end:
            total_annotated += 1

    for doc in not_annotated:
        if int(doc["value"]) >= time_start and int(doc["value"]) <= time_end:
            total_not_annotated += 1

    try:
        percentage = float(total_annotated) / (total_not_annotated + total_annotated)
    except:
        return 0

    return percentage


def get_gt(db_creds, payload):
    query_post_url = db_creds['url'] + "/questionstore/_find"

    threshold = int(payload["threshold"])
    start_time = float(payload["st"])
    end_time = float(payload["et"]) + 86400
    good_selector_query = {
        "selector": {
            "annotated": True,
            "ground_truth": False,
            "timestamp": {
                "$gt": start_time,
                "$lt": end_time
            },
            "human_performance_rating": {
                "$gt": threshold
            }
        },
        "fields": [
            "question",
            "on_topic",
            "PAU",
            "confidence",
            "answer",
            "queryTime",
            "human_performance_rating"
        ]
    }

    bad_selector_query = {
        "selector": {
            "annotated": True,
            "ground_truth": False,
            "timestamp": {
                "$gt": start_time,
                "$lt": end_time
            },
            "human_performance_rating": {
                "$lt": threshold
            },
            "on_topic": "true"
        },
        "fields": [
            "question",
            "on_topic",
            "confidence",
            "answer",
            "queryTime",
            "human_performance_rating"
        ]
    }

    offTopic_selector_query = {
        "selector": {
            "annotated": True,
            "ground_truth": False,
            "timestamp": {
                "$gt": start_time,
                "$lt": end_time
            },
            "on_topic": "false"
        },
        "fields": [
            "question",
            "on_topic",
            "confidence",
            "answer",
            "queryTime"
        ]
    }

    payback = []
    if payload["annotated_good"]:
        docs = _post(query_post_url, good_selector_query).json()["docs"]
        for doc in docs:
            doc["judgement"] = str(doc["human_performance_rating"])
        payback.extend(docs)
    if payload["annotated_bad"]:
        docs = _post(query_post_url, bad_selector_query).json()["docs"]
        for doc in docs:
            doc["judgement"] = str(doc["human_performance_rating"])
        payback.extend(docs)
    if payload["off_topic"]:
        docs = _post(query_post_url, offTopic_selector_query).json()["docs"]
        for doc in docs:
            doc["judgement"] = "NaN"
        payback.extend(docs)

    return payback


def get_question(db_creds, time_start, time_end):  # ADD QUERY LOGIC HERE
    query_post_url = db_creds['url'] + "/questionstore/_find"

    selector_query = {
        "selector": {
            "annotated": False,
            "timestamp": {
                "$gt": time_start,
                "$lt": time_end
            }
        },
        "fields": ["_id", "question", "_rev", "answer", "confidence"],
        "limit": 10
    }
    r = _post(query_post_url, selector_query)

    docs = r.json()["docs"]
    if len(docs) > 0:
        doc = random.choice(docs)
        _question = doc['question']
        answer = doc['answer']
        _id = doc["_id"]
        confidence = doc["confidence"]
    else:
        return {"status": "FAILURE"}

    question = {"question": _question, "id": _id, "answer": answer, "confidence": confidence}

    r = _get(db_creds['url'] + "/questionstore/_design/similar-ground-truth/_view/similar-ground-truth")  # check to see if already in ground truth
    docs = r.json()["rows"]
    questions = []
    for doc in docs:
        gt_answer = doc["value"]["answer"].replace("\n", "").replace("\r", "")
        log_answer = answer.replace("\n", "").replace("\r", "")
        if doc["key"] == question["question"] and gt_answer == log_answer:
            update_question(db_creds, _id, doc["value"]["on_topic"], 100)
            return get_question(db_creds, time_start, time_end)

    r = _get(db_creds['url'] + "/questionstore/_design/similar-annotated/_view/similar-annotated")  # check to see if already annotated question with same answer
    docs = r.json()["rows"]
    questions = []
    for doc in docs:
        if len(questions) < 5 and doc["value"]["answer"] == answer and doc["id"] != _id and doc["value"]["performance"] > 70:
            questions.append(doc["key"])
    return {"question": question, "other_questions": questions, "status": "SUCCESS"}


def update_question(db_creds, question_id, on_topic, human_performance_rating):
    put_url = db_creds['url'] + "/questionstore/" + question_id
    r = requests.get(put_url)
    jr = r.json()
    jr["on_topic"] = on_topic
    jr["human_performance_rating"] = int(human_performance_rating)
    jr["annotated"] = True

    r = _put(put_url, jr)

    return json.dumps(r.json())


def pau_stat():
    return pau_status


def upload_docs(db_creds, file):
    requests.put(db_creds["url"] + "/questionstore")
    csv.field_size_limit(sys.maxsize)
    post_url = db_creds['url'] + "/questionstore/_bulk_docs"
    query_post_url = db_creds['url'] + "/questionstore/_find"

    bulkdocs = {"docs": []}
    bulk_maindocs = {"docs": []}

    all_lines = str(file).splitlines()
    headers = all_lines[0].split(",")
    _reader = pd.read_csv(StringIO.StringIO(file), sep=",", names=headers)

    for row in range(1, len(_reader["QuestionText"])):
        if _reader["UserName"][row] != "wcts_api_test":
            mapped_question = ' '.join(_reader["QuestionText"][row].split())
            bulk_maindocs["docs"].append({"_id": mapped_question})

            bulkdocs["docs"].append(
                {
                    "mapped_question": mapped_question,
                    "question": unicode(str(_reader['QuestionText'][row]), 'utf-8'),
                    "answer": unicode(str(_reader['TopAnswerText'][row]), 'utf-8'),
                    "timestamp": time.time(),
                    "human_performance_rating": 0,
                    "annotated": False,
                    "ground_truth": False,
                    "confidence": _reader["TopAnswerConfidence"][row],
                    "on_topic": "null",
                    "queryTime": _reader["DateTime"][row]

                }
            )

    for doc in bulkdocs["docs"]:
        try:
            doc["PAU"] = pau_ids[pau_answers.index(doc["answer"])]
        except:
            continue

    _post(post_url, bulkdocs)
    _post(post_url, bulk_maindocs)

    index_post_url = db_creds['url'] + "/questionstore/_index"

    index_post(index_post_url, ["annotated", "ground_truth", "timestamp", "human_performance_rating"])
    index_post(index_post_url, ["annotated", "ground_truth"])
    index_post(index_post_url, ["annotated", "timestamp"])
    index_post(index_post_url, ["annotated", "ground_truth", "timestamp", "on_topic"])
    index_post(index_post_url, ["annotated", "ground_truth", "timestamp", "human_performance_rating", "PAU"])
    index_post(index_post_url, ["answer", "ground_truth", "question"])
    index_post(index_post_url, ["answer", "timestamp", "_id", "annotated", "on_topic", "human_performance_rating"])

    _put(db_creds['url'] + "/questionstore/_design/total_annotated",
         {
        "_id": "total_annotated",
        "views": {
            "annotated": {
                "map": "function (doc) {if(doc.annotated===true && doc.ground_truth===false) { emit(doc.annotated, doc.timestamp)}}"
            },
            "not_annotated": {
                "map": "function (doc) {if(doc.annotated===false && doc.ground_truth===false) { emit(doc.annotated, doc.timestamp)}}"
            }
        }
    }
    )

    _put(db_creds['url'] + "/questionstore/_design/similar-annotated",
         {
        "_id": "similar-annotated",
        "views": {
            "similar-annotated": {
                "map": "function (doc) {if(doc.annotated===true && doc.on_topic=='true') {emit(doc.question, {'answer':doc.answer, 'performance':doc.human_performance_rating});}}"
            }
        }
    }
    )

    _put(db_creds['url'] + "/questionstore/_design/similar-ground-truth",
         {
        "_id": "similar-ground-truth",
        "views": {
            "similar-ground-truth": {
                "map": "function (doc) {if(doc.ground_truth===true) {emit(doc.question, {'answer':doc.answer, 'on_topic':doc.on_topic});}}"
            }
        }
    }
    )

    return 'hello'
