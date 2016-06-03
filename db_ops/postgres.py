import csv
import tempfile

# from psycopg2 import pool
import psycopg2
import sqlalchemy.pool as pool
from psycopg2.extras import RealDictCursor

from db_manager import DBManager

psycopg2 = pool.manage(psycopg2)

MAX_ANS_LEN = 30000


class Postgres(DBManager):

    def __init__(self, hostname, dbname, username, password):
        self.hostname = hostname
        self.dbname = dbname
        self.username = username
        self.password = password
        tables = self._get_tables_in_db()
        if 'uploads' not in tables:
            self._create_uploads_table()
        if 'questions' not in tables:
            self._create_questions_table()

    def connected(func):
        def reconnect(self, *args, **kwargs):
            close_conn = False
            conn = kwargs.get('conn')

            if conn is None:
                close_conn = True
                conn = self._get_conn()
                kwargs['conn'] = conn
            retval = func(self, *args, **kwargs)

            if close_conn:
                conn.commit()
                conn.close()
            return retval

        return reconnect

    def _get_conn(self):
        return psycopg2.connect(host=self.hostname, user=self.username, password=self.password, dbname=self.dbname)

    @connected
    def _get_tables_in_db(self, conn=None):
        cmd = '''
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema='public'
        '''

        with conn.cursor() as c:
            c.execute(cmd)
            tables = c.fetchall()

        return [t[0] for t in tables]

    @connected
    def _create_uploads_table(self, conn=None):
        '''Creates the systems table in the database'''
        cmd = '''
            CREATE TABLE uploads(
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT(now() at time zone 'EST'),
                system_name VARCHAR(15)
            )
        '''

        with conn.cursor() as c:
            c.execute(cmd)

    @connected
    def _create_questions_table(self, conn=None):
        '''Creates the questions table in the database'''
        cmd = '''
            CREATE TABLE questions(
                id SERIAL PRIMARY KEY,
                question_text VARCHAR(800) NOT NULL,
                system_answer VARCHAR(30000) NOT NULL,
                confidence FLOAT,
                is_in_purview BOOLEAN,
                annotation_score INT,
                is_annotated BOOLEAN DEFAULT FALSE,
                upload_id INT REFERENCES uploads(id)
            )
        '''

        with conn.cursor() as c:
            c.execute(cmd)

    @connected
    def delete_all(self, conn=None):
        with conn.cursor() as c:
            c.execute("TRUNCATE uploads CASCADE")

    @connected
    def get_percent(self, system_name, conn=None):
        params = None
        if system_name != '':
            cmd = '''
                SELECT
                    1.0 * count(CASE WHEN is_annotated THEN 1 END) / COUNT(*)
                FROM uploads, questions
                WHERE uploads.id = questions.upload_id AND system_name = %s
            '''
            params = [system_name.upper()]

        else:
            cmd = '''
                SELECT 1.0 * COUNT(CASE WHEN is_annotated THEN 1 END) / COUNT(*)
                FROM questions
            '''
        with conn.cursor() as c:
            c.execute(cmd, params)
            percentage = float(c.fetchone()[0]) * 100
        return percentage

    @connected
    def get_similar(self, answer, conn=None):
        acceptable_annotation_score = 60
        cmd = '''
            SELECT question_text, annotation_score
            FROM questions
            WHERE system_answer=%s AND is_annotated=true AND annotation_score>%s
        '''

        params = answer, acceptable_annotation_score - 1
        with conn.cursor() as c:
            c.execute(cmd, params)
            questions = c.fetchall()
        return questions

    @connected
    def get_annotated(self, system_name, conn=None):
        params = None
        if system_name != '':
            cmd = '''
                SELECT *
                FROM uploads, questions
                WHERE uploads.id = questions.upload_id AND is_annotated=true AND system_name=%s
            '''
            params = [system_name.upper()]
        else:
            cmd = '''
                SELECT *
                FROM uploads, questions
                WHERE uploads.id = questions.upload_id AND is_annotated=true
            '''
        with conn.cursor(cursor_factory=RealDictCursor) as c:
            c.execute(cmd, params)
            judged = c.fetchall()

        return judged

    @connected
    def get_systems(self, conn=None):
        cmd = '''SELECT system_name FROM uploads GROUP BY system_name'''
        with conn.cursor() as c:
            c.execute(cmd)
            systems = [system[0] for system in c.fetchall()]
        return systems

    @connected
    def get_exact_match(self, question, answer, conn=None):
        cmd = '''   SELECT is_in_purview, annotation_score
                    FROM questions
                    WHERE question_text=%s and system_answer=%s and is_annotated=true'''

        params = question, answer

        with conn.cursor() as c:
            c.execute(cmd, params)
            res = c.fetchall()
        return res

    @connected
    def get_question(self, system_name, conn=None):
        params = None
        if system_name and system_name != '':
            cmd = '''
                SELECT question_text, questions.id, system_answer
                FROM uploads, questions
                WHERE uploads.id=questions.upload_id AND system_name=%s AND is_annotated=false
                ORDER BY RANDOM() LIMIT 1
            '''
            params = [system_name.upper()]
        else:
            cmd = '''
                SELECT question_text, id, system_answer
                FROM questions
                WHERE is_annotated=false
                ORDER BY RANDOM() LIMIT 1
            '''

        with conn.cursor() as c:
            c.execute(cmd, params)
            qdata = c.fetchone()

        if qdata:
            exact_match = self.get_exact_match(qdata[0], qdata[2], conn=conn)
            if len(exact_match) != 0:
                self.update_question(qdata[1], exact_match[0][0], exact_match[0][1], conn=conn)
                return self.get_question(system_name, conn=conn)
            question = {'text': qdata[0], 'id': qdata[1], 'answer': qdata[2]}
            try:
                return {'question': question, "similar": self.get_similar(qdata[2], conn=conn)}
            except:
                return {'question': question, "similar": []}
        return False

    @connected
    def get_question_from_id(self, q_id, conn=None):
        cmd = '''SELECT question_text, id, system_answer from questions WHERE id=%s'''
        with conn.cursor() as c:
            c.execute(cmd, [q_id])
            qdata = c.fetchone()
        if qdata:
            question = {'text': qdata[0], 'id': qdata[1], 'answer': qdata[2]}
            try:
                return {'question': question, "similar": self.get_similar(qdata[2], conn=conn)}
            except:
                return {'question': question, "similar": []}
        return False

    @connected
    def update_question(self, question_id, is_on_topic, human_performance_rating=0, conn=None):
        cmd = '''
            UPDATE questions
            SET is_annotated=true,
                is_in_purview=%s,
                annotation_score=%s
            WHERE id=%s
        '''
        params = is_on_topic, human_performance_rating, question_id
        with conn.cursor() as c:
            c.execute(cmd, params)

    @connected
    def _add_upload(self, system_name, conn=None):
        '''Adds a new upload to the database and returns the id'''
        cmd = '''INSERT INTO uploads (system_name) VALUES(%s) RETURNING id'''
        with conn.cursor() as c:
            c.execute(cmd, [system_name.upper()])
            upload_id = c.fetchone()[0]
        return upload_id

    @connected
    def upload_questions(self, system_name, file, conn=None):
        '''Upload the questions in the file and link them to the given system'''
        upload_id = self._add_upload(system_name, conn=conn)

        with tempfile.TemporaryFile(mode='U+w') as tmp:
            tmp.write(file.read())
            tmp.seek(0)
            reader = csv.DictReader(tmp)

            params = []
            for i, row in enumerate(reader):

                if len(row['TopAnswerText']) > MAX_ANS_LEN:
                    return 'TopAnswerText field too long'

                par = row['QuestionText'].decode('latin-1'), row['TopAnswerText'].decode('latin-1'), row['TopAnswerConfidence'], upload_id
                params.append(par)

        cmd = ''' INSERT INTO questions
                    (question_text, system_answer, confidence, upload_id)
                    VALUES (%s, %s, %s, %s)'''

        with conn.cursor() as c:
            c.executemany(cmd, params)
        return True
