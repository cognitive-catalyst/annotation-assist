import ConfigParser
import csv
import tempfile

import psycopg2

config = ConfigParser.ConfigParser()
config.read('config/properties.ini')

global conn


def connected(func):
    # @wraps
    def reconnect(*args, **kwargs):
        global conn
    # db = config.get('db2', 'db')
    # hostname = config.get('db2', 'hostname')
    # port = config.get('db2', 'port')
    # user = config.get('db2', 'username')
    # pw = config.get('db2', 'password')
        conn = psycopg2.connect("dbname='aa' user='postgres' host='169.44.113.220' password='password'")
        retval = func(*args, **kwargs)
        return retval
    return reconnect


@connected
def _create_uploads_table():
    '''Creates the systems table in the database'''
    cmd = '''   CREATE TABLE uploads (
                    id SERIAL PRIMARY KEY,
                    timestamp TIMESTAMP DEFAULT (now() at time zone 'EST'),
                    system_name VARCHAR(15)
                )'''
    with conn.cursor() as c:
        c.execute(cmd)


@connected
def _add_upload(system_name):
    '''Adds a new upload to the database and returns the id'''

    cmd = '''INSERT INTO uploads (system_name) VALUES(%s) RETURNING id'''
    with conn.cursor() as c:
        c.execute(cmd, [system_name.upper()])
        upload_id = c.fetchone()[0]
    print upload_id
    return upload_id


@connected
def _create_questions_table():
    '''Creates the questions table in the database'''
    cmd = ''' CREATE TABLE questions (
                id SERIAL PRIMARY KEY,
                question_text VARCHAR(800) NOT NULL,
                system_answer VARCHAR(30000) NOT NULL,
                confidence FLOAT,
                is_in_purview BOOLEAN,
                annotation_score INT,
                is_annotated BOOLEAN DEFAULT FALSE,
                upload_id INT REFERENCES uploads (id)

                )'''

    with conn.cursor() as c:
        c.execute(cmd)


@connected
def upload_questions(system_name, file):
    '''Upload the questions in the file and link them to the given system'''
    upload_id = _add_upload(system_name)
    print upload_id
    with tempfile.TemporaryFile(mode='U+w') as tmp:
        tmp.write(file.read())
        tmp.seek(0)
        reader = csv.DictReader(tmp)

        params = []
        for i, row in enumerate(reader):
            par = row['QuestionText'].decode('latin-1'), row['TopAnswerText'].decode('latin-1'), row['TopAnswerConfidence'], upload_id
            params.append(par)

    cmd = ''' INSERT INTO questions
                (question_text, system_answer, confidence, upload_id)
                VALUES (%s, %s, %s, %s)'''

    with conn.cursor() as c:
        c.executemany(cmd, params)

    conn.commit()


@connected
def delete_all():
    with conn.cursor() as c:
        # c.execute("TRUNCATE questions")
        c.execute("TRUNCATE uploads CASCADE")

    conn.commit()


@connected
def execute_cmd(cmd, parameters=None, fetch_results=False):
    results = None
    with conn.cursor() as c:
        c.execute(cmd, parameters)
        if fetch_results:
            results = c.fetchall()
            print results
    return results
