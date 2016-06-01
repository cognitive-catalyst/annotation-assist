from postgres import Postgres
# import db2


def get_manager(dbtype, hostname, dbname, username, password):
    return Postgres(hostname, dbname, username, password)
