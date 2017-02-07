import os
import sys

from flask import Flask, render_template, jsonify
from flask import request

from preprocessing import csvprocessor as csvproc
from shared.config import Config

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + '/')

app = Flask(__name__)


########################################################################################################################
# ROUTES
########################################################################################################################


@app.route('/')
def start():
    return render_template('index.html')


@app.route('/datasets')
def datasets():
    ls = []
    for filename in os.listdir(Config.PATH_DATA):
        if not filename.startswith('_') and filename.endswith(".csv"):
            ls.append(os.path.splitext(filename)[0])
    return jsonify(ls)


@app.route('/partynames')
def partynames():
    blocks = csvproc.get_blockDataSet(getParam("filename"))
    parties = csvproc.get_partyNames(blocks)
    return jsonify(parties)


@app.route('/election-results')
def electionResults():
    summary = csvproc.election_summary(getParam("filename"))
    return jsonify(summary)


@app.route('/compactness')
def compactness():
    measure = getParam('measure')
    fileName = getParam("filename")

    result = csvproc.compactness(fileName, measure)
    return jsonify(result)


def getParam(name):
    value = request.args.get(name, None)
    if not value:
        raise Exception("The parameter '{0}' was not provided.".format(name))
    return value


if __name__ == '__main__':
    app.debug = True
    app.run()
