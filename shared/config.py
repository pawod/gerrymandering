import os

import profig


class Config:
    PATH_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.realpath(__file__))) + "/"
    PATH_DATA = os.path.join(PATH_PROJECT_ROOT, "data/")

    _config_source = os.path.join(PATH_PROJECT_ROOT, "config.cfg")
    _instance = profig.Config(_config_source)
    _instance.sync(_config_source)

    CARTO_USER = _instance['carto.USER']
    CARTO_PASSWORD = _instance['carto.PASSWORD']
    CARTO_API_KEY = _instance['carto.API_KEY']

    @staticmethod
    def set_value(key, value):
        Config._instance[key] = value
        Config._instance.sync()
