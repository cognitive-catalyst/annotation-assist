from postgres import Postgres
import db2


def get_manager(dbtype, hostname, dbname, username, password):
    if dbtype == 'postgres':
        return Postgres(hostname, dbname, username, password)
    elif dbtype == 'db2':
        return db2
