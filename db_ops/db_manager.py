from abc import ABCMeta, abstractmethod


class DBManager:
    __metaclass__ = ABCMeta

    def __init__(self, hostname, dbname, username, password):
        pass

    @abstractmethod
    def delete_all(self):
        pass

    @abstractmethod
    def get_percent(self):
        pass

    @abstractmethod
    def get_annotated(self):
        pass

    @abstractmethod
    def get_similar(self):
        pass

    @abstractmethod
    def get_systems(self):
        pass

    @abstractmethod
    def get_exact_match(self):
        pass

    @abstractmethod
    def get_question(self):
        pass

    @abstractmethod
    def get_question_from_id(self):
        pass

    @abstractmethod
    def update_question(self):
        pass

    @abstractmethod
    def upload_questions(self):
        pass
