var map;
var backgroundLayer;
var bezirkeLayer;

function renderMap() {
    if (map) {
        map.off();
        map.remove();
    }
    map = L.map('container-cartomap', {
        zoomControl: true,
        center: [52.5, 13.4],
        zoom: 10
    });

    backgroundLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png');
    backgroundLayer.addTo(map);

    var sql = new cartodb.SQL({user: 'daryafirsttest', format: 'geojson'});

    var bezirkeStyle = {
         color: '#000063',
         weight: 3,
         opacity: 1,
         fillOpacity: 0,
         fillColor: "#0000ff"
    };
    var bezirkeFillStyle = {
         color: '#000063',
         weight: 3,
         opacity: 1,
         fillOpacity: 0.2,
         fillColor: "#0000ff"
    };

    sql.execute("SELECT * FROM bezirke")
        .done(function (data) {
            bezirkeLayer = L.geoJson(data.features, {style: bezirkeStyle}).addTo(map);
            var bezirkeFillLayer = L.geoJson(data.features, {style: bezirkeFillStyle}).addTo(map);
    });
}

/**
 * removes all layers from the map frame except for the backgroundLayer
 */
function clearMap() {
    for (var i in map._layers) {
        var layer = map._layers[i];
        if (layer != backgroundLayer) {
            map.removeLayer(layer);
        }
    }
    $(".legend").remove();
}

function getColor(value, minValue, maxValue) {
    var range = maxValue - minValue;
    var normVal = (value - minValue) / range;
    var hue = 120 - (normVal * 180);
    if (hue < 0) hue = 360 + hue;
    return 'hsl(' + hue + ', 90%, 50%)';
}

function getPolygonStyle(score, minScore, maxScore) {
    return {
        color: '#000000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.65,
        fillColor: getColor(score, minScore, maxScore)
    };
}

function setColorsForDatasetMetrics(datasetName, scores, absoluteScores) {
    var sql = new cartodb.SQL({user: 'daryafirsttest', format: 'geojson'});
    sql.execute("SELECT * FROM {name}".format({name: datasetName}))
        .done(function (data) {
            setColorsForMetrics(data, scores, absoluteScores)
        });
}

function setColorsForMetrics(data, scores, absoluteScores) {
    clearMap();
    var scoreList = Object.keys(scores).map(function (key) {
        return scores[key];
    }).sort(function (a, b) {
        return a - b
    });

    var minScore = _.first(scoreList);
    var maxScore = _.last(scoreList);

    for (var i = 0; i < data.features.length; i++) {
        var kreisId = data.features[i].properties["kreisidnum"];

        L.geoJson(data.features[i], {
            style: function () {
                return getPolygonStyle(scores[kreisId], minScore, maxScore);
            }
        }).addTo(map);
    }
    bezirkeLayer.addTo(map);

    renderLegend(map, scoreList, minScore, maxScore, absoluteScores)
}

function renderLegend(map, scores, minScore, maxScore, absoluteScores) {
    var legend = L.control({position: 'bottomright'});
    var pickedScores = scores.sort(function (a, b) {
        return a - b
    }).filter(function (value, index, arr) {
        return (index % 10 == 0);
    });
    pickedScores.push(maxScore);

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < pickedScores.length; i++) {
            if (absoluteScores) {
                var score1 = parseFloat(pickedScores[i]).toFixed(3);
                var score2 = parseFloat(pickedScores[i + 1]).toFixed(3);
                div.innerHTML +=
                    '<i style="background:' + getColor(pickedScores[i], minScore, maxScore) + '"></i> ' + score1 + (!isNaN(score2) ? ' &ndash; ' + score2 + '<br>' : '');
            }
            else {
                var score1 = (parseFloat(pickedScores[i]) * 100).toFixed(3);
                var score2 = (parseFloat(pickedScores[i + 1]) * 100).toFixed(3);
                div.innerHTML +=
                    '<i style="background:' + getColor(pickedScores[i], minScore, maxScore) + '"></i> ' + score1 + '&#37;' + (!isNaN(score2) ? ' &ndash; ' + score2 + '&#37;<br>' : '');
            }
        }
        return div;
    };

    legend.addTo(map);
}

function renderVotes(datasetName, selectedParty) {
    var sql = new cartodb.SQL({user: 'daryafirsttest', format: 'geojson'});
    sql.execute("SELECT * FROM {name}".format({name: datasetName}))
        .done(function (data) {
            clearMap();
            var results = {};
            if (selectedParty == "GRÜNE") selectedParty = "grune";
            if (selectedParty == "DIE LINKE") selectedParty = "die_linke";
            data.features.forEach(function (feature) {
                var votes = parseFloat(feature.properties[selectedParty.toLowerCase()]);
                var validVotes = parseFloat(feature.properties["gultige_s"]);
                var kreisid = parseInt(feature.properties["kreisid"]);
                var percentage = votes / validVotes;
                return results[kreisid] = percentage;
            });
            setColorsForMetrics(data, results);
            bezirkeLayer.addTo(map);
        })
        .error(function (errors) {
            console.log("errors:" + errors);
        });
}