import math

from sympy import symbols, integrate

from shared import columnnames as cn

MEASURE_MOMENTUM_AREA = "Area Momentum"
MEASURE_MOMENTUM_POPULATION = "Population Momentum"
MEASURE_BOUNDARY_COMPLEXITY = "Boundary Complexity"
MEASURE_CH_AREA = "Convex Hull Area"


def momentum_area(x_centroid, y_centroid, x_start, x_end, y_start, y_end, area):
    x, y = symbols("x y")
    f = ((x - x_centroid) ** 2 + (y - y_centroid) ** 2)
    I = integrate(f, (x, x_start, x_end), (y, y_start, y_end))
    return 1 - (area / math.sqrt(2 * math.pi * I))


def old_momentum_population(x_centroid, y_centroid, x_start, x_end, y_start, y_end, area, population):
    I = momentum_area(x_centroid, y_centroid, x_start, x_end, y_start, y_end, area)
    I_p = I * (population / area)
    return (area * 290000) / math.sqrt(2 * math.pi * I_p)


def momentum_population(block, urns):
    I_p = 0

    for index, urn in urns.iterrows():
        I_p += ((urn[cn.MEASURE_XCENTR] - block[cn.MEASURE_XCENTR]) ** 2 + (
            urn[cn.MEASURE_XCENTR] - block[cn.MEASURE_XCENTR]) ** 2) * urn[cn.NUM_ELECTORATES]

    return (block[cn.MEASURE_AREA] * block[cn.NUM_ELECTORATES]) / (2 * math.pi * I_p)


def boundary_complexity(area, perimeter):
    return 1 - (4 * math.pi * area) / (perimeter ** 2)


def cha_ratio(cha, area):
    return 1 - (area / cha)
