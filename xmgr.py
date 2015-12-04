import requests
import json


def write_to_xmgr(question, url, username, password):

    offTopic = False
    pau = ""

    if question['judgement'] == "off topic":
        offTopic = True
    elif question['judgement'] == "good":
        pau = question["PAU"]

    r = requests.post(url, auth=(username, password), headers={'content-type': "application/json"},
                      data=json.dumps({"value": question["question"],
                                       "offTopic": offTopic,
                                       "state": "NOT_REVIEWED",
                                       "predefinedAnswerUnit": pau
                                       })
                      )
