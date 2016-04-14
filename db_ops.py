import json
import csv
import ibm_db
import ibm_db_dbi
import datetime
import os
import ConfigParser
from StringIO import StringIO
import tempfile

# TODO: export needs to consider the checkbox variables

config = ConfigParser.ConfigParser()
config.read('config/properties.ini')


table_names = ["Systems", "Uploads", "Questions"]

tables = {
    'Systems': {
        'columns': [
            {
                'title': 'Name',
                'type': 'VARCHAR(15)',
                'options': 'NOT NULL PRIMARY KEY'
            }
        ],
        'foreign_keys': []
    },
    'Uploads': {
        'columns': [
            {
                'title': 'Upload_ID',
                'type': 'INT',
                'options': ' NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1)'
            },
            {
                'title': 'Timestamp',
                'type': 'TIMESTAMP',
                'options': 'NOT NULL with DEFAULT'
            },
            {
                'title': 'System_Name',
                'type': 'VARCHAR(15)',
                'options': 'NOT NULL'
            },
        ],
        'foreign_keys': [
            {
                'field': 'System_Name',
                'reference_table': 'Systems',
                'reference_column': 'Name'
            }
        ]
    },
    'Questions': {
        'columns': [
            {
                'title': 'Question_ID',
                'type': 'INT',
                'options': ' NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1)'
            },
            {
                'title': 'Question_Text',
                'type': 'VARCHAR(500)',
                'options': 'NOT NULL'
            },
            {
                'title': 'System_Answer',
                'type': 'VARCHAR(12000)',
                'options': 'NOT NULL'
            },
            {
                'title': 'Confidence',
                'type': 'DOUBLE',
                'options': ''
            }, {
                'title': 'Is_In_Purview',
                'type': 'SMALLINT',
                'options': ''
            }, {
                'title': 'Annotation_Score',
                'type': 'INT',
                'options': ''
            }, {
                'title': 'Is_Annotated',
                'type': 'SMALLINT',
                'options': 'NOT NULL with DEFAULT'
            }, {
                'title': 'Upload_ID',
                'type': 'INT',
                'options': 'NOT NULL'
            },
        ],
        'foreign_keys': [
            {
                'field': 'Upload_ID',
                'reference_table': 'Uploads',
                'reference_column': 'Upload_ID'
            }
        ]
    },
}


def init_database():
    '''Initializes the database'''
    for name in table_names:
        _create_table(name, tables[name])


def _create_table(name, options):
    '''Creates a db2 table with the specified name and options (columns & foreign keys)'''
    columns = options['columns']
    foreign_keys = options['foreign_keys']

    prefix = ''
    col_string = ''

    for column in columns:
        col_string += prefix
        col_string += '{0} {1} {2}'.format(column['title'], column['type'], column['options'])
        prefix = ','

    f_key_string = ''
    for f_key in foreign_keys:
        f_key_string += prefix
        f_key_string += 'FOREIGN KEY ({0}) REFERENCES "{1}"({2})'.format(f_key['field'], f_key['reference_table'], f_key['reference_column'])

    cmd = 'CREATE TABLE "{0}" ({1}{2})'.format(name, col_string, f_key_string)
    execute_cmd(cmd)


def delete_all():
    '''Clears the database, reinitializes empty tables'''
    for name in table_names:
        try:
            cmd = 'DROP TABLE "{0}";'.format(name)
            execute_cmd(cmd)
        except:
            print 'failed ' + name
    init_database()


def _add_system(system_name):
    '''Adds a new system to the database'''
    cmd = "INSERT INTO \"Systems\" (NAME) VALUES('{0}');".format(system_name.upper())
    execute_cmd(cmd)


def _add_upload(system_name):
    '''Adds an upload to the database. Adds the system if it does not already exist. Returns the upload_id of the new upload row'''
    if not _system_does_exist(system_name):
        _add_system(system_name)

    timestamp = datetime.datetime.now()
    cmd = "INSERT INTO \"Uploads\" (System_Name, Timestamp) VALUES('{0}','{1}');".format(system_name.upper(), timestamp)
    execute_cmd(cmd)

    cmd = "SELECT Upload_ID FROM \"Uploads\" WHERE Timestamp='{0}'".format(timestamp)
    results = execute_cmd(cmd, True)[0]

    upload_id = results[0]
    return upload_id


def _add_question(question, upload_id):
    '''Add the given question to the table with foreign key upload_id'''

    try:
        cmd = "INSERT INTO \"Questions\" (Question_Text,System_Answer,Confidence,Upload_ID) Values('{0}','{1}','{2}','{3}')" \
            .format(question['QuestionText'].replace("'", "''"), question['TopAnswerText'].replace("'", "''"), question['TopAnswerConfidence'], upload_id).decode('latin-1')

        execute_cmd(cmd)
    except:
        raise


def _system_does_exist(system_name):
    '''Check if the given system exists in the table'''

    cmd = 'SELECT COUNT(1) FROM "Systems" WHERE Name=\'{0}\''.format(system_name.upper())
    res = execute_cmd(cmd, True)[0][0]

    return bool(res)


def get_percent(system_name=None):
    if system_name != '':
        cmd1 = 'SELECT COUNT(*) FROM "Uploads","Questions" WHERE "Uploads".Upload_id="Questions".Upload_id AND System_Name=\'{0}\''.format(system_name.upper())
        cmd2 = 'SELECT COUNT(*) FROM "Uploads","Questions" WHERE "Uploads".Upload_id="Questions".Upload_id AND System_Name=\'{0}\' AND IS_ANNOTATED=\'1\''.format(system_name.upper())
    else:
        cmd1 = 'SELECT COUNT(*) FROM "Uploads","Questions" WHERE "Uploads".Upload_id="Questions".Upload_id'
        cmd2 = 'SELECT COUNT(*) FROM "Uploads","Questions" WHERE "Uploads".Upload_id="Questions".Upload_id AND IS_ANNOTATED=\'1\''

    total = execute_cmd(cmd1, True)[0][0]
    annotated = execute_cmd(cmd2, True)[0][0]
    return float(annotated) / total * 100


def get_annotated(system_name):

    output_fields = ["Question_ID", "Question_Text", "System_Answer", "Is_In_Purview", "Annotation_Score", "System_Name", "Confidence"]

    if system_name != '':
        cmd = 'SELECT {0} FROM "Uploads","Questions" WHERE "Uploads".Upload_id="Questions".Upload_id AND System_Name=\'{1}\' AND IS_ANNOTATED=\'1\''.format(','.join(output_fields), system_name.upper())
    else:
        cmd = 'SELECT {0} FROM "Uploads","Questions" WHERE "Uploads".Upload_id="Questions".Upload_id AND IS_ANNOTATED=\'1\''.format(','.join(output_fields))

    results = execute_cmd(cmd, True)
    gt = [dict(zip(output_fields, q)) for q in results]
    return gt


def get_similar(answer):  # TODO: write this method
    acceptable_annotation_score = 60

    output_fields = ["Question_Text", "Annotation_Score"]

    cmd = "Select {0} FROM \"Questions\" WHERE System_Answer='{1}' AND IS_ANNOTATED ='1' AND ANNOTATION_SCORE>'{2}' ".format(','.join(output_fields), answer.replace("'", "''"), acceptable_annotation_score - 1)

    questions = execute_cmd(cmd, True)
    return questions


def get_systems():
    cmd = 'SELECT Name FROM "Systems" '
    results = execute_cmd(cmd, True)
    systems = [system[0] for system in results]
    return systems


def get_exact_match(question, answer):
    cmd = u"SELECT Is_In_Purview, Annotation_Score FROM \"Questions\" WHERE Question_Text='{0}' AND System_Answer='{1}' AND IS_ANNOTATED='1' ".format(question.replace("'", "''"), answer.replace("'", "''"))

    return execute_cmd(cmd, True)


def get_question(system_name=None):
    '''Get a random question from the given system'''

    if system_name and system_name != '':
        cmd = 'SELECT Question_Text, Question_ID, System_Answer FROM "Uploads","Questions" WHERE "Uploads".Upload_id="Questions".Upload_id AND System_Name=\'{0}\' AND IS_ANNOTATED=\'0\' ORDER BY RAND() FETCH FIRST 1 ROWS ONLY'.format(system_name.upper())
    else:
        cmd = 'SELECT Question_Text, Question_ID, System_Answer FROM "Uploads","Questions" WHERE "Uploads".Upload_id="Questions".Upload_id AND IS_ANNOTATED=\'0\' ORDER BY RAND() FETCH FIRST 1 ROWS ONLY'

    qdata = execute_cmd(cmd, True)[0]

    exact_match = get_exact_match(qdata[0], qdata[2])
    if len(exact_match) != 0:
        update_question(qdata[1], exact_match[0][0], exact_match[0][1])
        return get_question(system_name)

    question = {'text': qdata[0], 'id': qdata[1], 'answer': qdata[2]}
    return {'question': question, "similar": get_similar(qdata[2])}


def update_question(question_id, is_on_topic, human_performance_rating=0):
    '''Update the annotation scores for the give question id'''

    cmd = "UPDATE(SELECT * FROM \"Questions\" WHERE Question_ID='{0}') \
        SET IS_ANNOTATED='{1}', IS_IN_PURVIEW='{2}', Annotation_Score='{3}'" \
        .format(question_id, int(True), int(is_on_topic), human_performance_rating)

    execute_cmd(cmd)


def upload_questions(system_name, file):
    '''Upload the questions in the file and link them to the given system'''
    try:
        init_database()
    except:
        pass
    upload_id = _add_upload(system_name)

    tmp = tempfile.TemporaryFile(mode='U+w')
    tmp.write(file.read())
    tmp.seek(0)
    reader = csv.DictReader(tmp)

    params = []
    for i, row in enumerate(reader):
        par = row['QuestionText'].decode('latin-1'), row['TopAnswerText'].decode('latin-1'), row['TopAnswerConfidence'], upload_id
        params.append(par)

    cmd = "INSERT INTO \"Questions\" (Question_Text, System_Answer, Confidence, Upload_ID) Values(?, ?, ?, ?)"

    tmp.close()
    execute_many(cmd, params)


def execute_cmd(cmd, fetch_results=False):
    cursor = connect_to_db()
    cursor.execute(cmd)
    results = True
    if fetch_results:
        results = cursor.fetchall()
    cursor.close()
    return results


def execute_many(cmd, parameters):

    cursor = connect_to_db()
    cursor.executemany(cmd, parameters)
    cursor.close()


def connect_to_db():
    db = config.get('db2', 'db')
    hostname = config.get('db2', 'hostname')
    port = config.get('db2', 'port')
    user = config.get('db2', 'username')
    pw = config.get('db2', 'password')

    connect_string = "DATABASE=" + db + ";HOSTNAME=" + hostname + ";PORT=" + port + ";UID=" + user + ";PWD=" + pw + ";"

    db2conn = ibm_db.connect(connect_string, "", "")
    conn = ibm_db_dbi.Connection(db2conn)

    cursor = conn.cursor()
    return cursor

try:
    init_database()
except:
    pass
