from application.database import query_db

class cache(object):

    @staticmethod
    def exists(domain):
        return query_db('SELECT COUNT(filename) FROM screenshots WHERE url = ? AND strftime("%s", "now") - strftime("%s", created_at) <= 15', (domain, ), one=True)

    @staticmethod
    def old(domain):
        return query_db('SELECT filename FROM screenshots WHERE url = ? ORDER BY created_at DESC', (domain, ), one=True)

    @staticmethod
    def new(domain, filename):
        return query_db('INSERT INTO screenshots (url, filename) VALUES (?, ?)', (domain, filename))