import pandas as pd

import analysis.compactess as cp
from shared import columnnames as cn
from shared.config import Config


def get_urnDataSet(filename):
    path = "{0}_uwb-{1}.csv".format(Config.PATH_DATA, filename)
    return pd.read_csv(path)


def get_blockDataSet(filename):
    path = Config.PATH_DATA + filename + ".csv"
    return pd.read_csv(path)


def get_partyNames(blocks):
    start = list(blocks).index(cn.NUM_VALID_VOTES) + 1
    end = list(blocks).index(cn.MEASURE_AREA)
    return list(blocks)[start:end]


def election_summary(filename):
    blocks = get_blockDataSet(filename)

    sumVoters = blocks[cn.NUM_VOTERS].sum()
    sumValidVotes = blocks[cn.NUM_VALID_VOTES].sum()
    sumElectorates = blocks[cn.NUM_ELECTORATES].sum()
    partynames = get_partyNames(blocks)

    summary = {
        "sumVoters": str(sumVoters), "sumValidVotes": str(sumValidVotes), "sumElectorates": str(sumElectorates)
    }

    parties = {}
    for name in partynames:
        sumVotes = blocks[name].sum()
        percentage = (sumVotes / sumElectorates) * 100
        parties[name] = {"sumVotes": str(sumVotes), "percentage": str(percentage)}

    summary["parties"] = parties
    return summary


def compactness(filename, measure):
    results = {}
    blocks = get_blockDataSet(filename)

    if measure == cp.MEASURE_BOUNDARY_COMPLEXITY:
        for index, block in blocks.iterrows():
            results[str(int(block[cn.ID_CENSUS_BLOCK]))] = str(
                cp.boundary_complexity(block[cn.MEASURE_AREA], block[cn.MEASURE_PERIM]))

    if measure == cp.MEASURE_CH_AREA:
        for index, block in blocks.iterrows():
            results[str(int(block[cn.ID_CENSUS_BLOCK]))] = str(
                cp.cha_ratio(block[cn.MEASURE_CHA], block[cn.MEASURE_AREA]))

    if measure == cp.MEASURE_MOMENTUM_AREA:
        for index, block in blocks.iterrows():
            results[str(int(block[cn.ID_CENSUS_BLOCK]))] = str(
                cp.momentum_area(block[cn.MEASURE_XCENTR], block[cn.MEASURE_YCENTR], block[cn.X_MIN], block[cn.X_MAX],
                                 block[cn.Y_MIN], block[cn.Y_MAX], block[cn.MEASURE_AREA]))

    if measure == cp.MEASURE_MOMENTUM_POPULATION:
        urns = get_urnDataSet(filename)

        for index, block in blocks.iterrows():
            block_urns = urns.loc[urns[cn.ID_CENSUS_BLOCK] == block[cn.ID_CENSUS_BLOCK]]
            results[str(int(block[cn.ID_CENSUS_BLOCK]))] = str(cp.momentum_population(block, block_urns))

    return results
