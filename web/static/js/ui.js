function initDropdownBehaviour() {
    $(function () {
        $(".dropdown-menu").not("#menu-dataset").on('click', 'li a', function (e) {
            $(e.target.closest("ul")).siblings("button").text(e.currentTarget.innerText);
            $(e.target.closest(".input-group")).find(".btn-info").removeClass("disabled");
        });
        $("#menu-dataset").on('click', 'li a', function (e) {
            $(e.target.closest("ul")).siblings("button").text(e.currentTarget.innerText);
            loadPartyDropdowns(enableDatasetButtons);
            renderElectionResults();
        });
    });
}


function initControlPanelButtons() {
    loadDataSetDropdown(initDropdownBehaviour);

    $("#btn-show-votes").click(function () {
        if ($(this).hasClass("disabled")) return;
        var datasetName = $("#btn-dataset-name").text();
        var partyName = $("#btn-votes").text();
        startLoadingAnimation();
        renderVotes(datasetName, partyName);
        endLoadingAnimation();
    });
    $("#btn-show-measure").click(function () {
        if ($(this).hasClass("disabled")) return;
        var datasetName = $("#btn-dataset-name").text();
        var measure = $("#btn-measure").text();
        startLoadingAnimation();
        $.getJSON('/compactness?', {filename: datasetName, measure: measure}, function (json) {
            setColorsForDatasetMetrics(datasetName, json, measure == "Population Momentum");
            endLoadingAnimation();
        });
    });

}

function initResetButton() {
    $("#button-reset").click(function () {
        resetControls();
    })
}

function initTooltips() {
    $('[data-toggle="tooltip"]').tooltip();
}

function loadDataSetDropdown(callback) {
    var dd = $("#menu-dataset");
    dd.text(null);
    $.getJSON('/datasets', function (names) {
        names.forEach(function (name) {
            var str = "<li><a href=\"#\">{name}</a></li>".format({name: name});
            dd.append(str);
        });

        if (callback) callback();
    });
}


function loadPartyDropdowns(callback) {
    var datasetName = $("#btn-dataset-name").text();
    var menus = $("#menu-votes, #menu-wasted-votes");

    menus.removeClass("disabled");
    menus.text(null);
    $.getJSON('/partynames', {filename: datasetName}, function (names) {
        names.forEach(function (name) {
            var str = "<li><a href=\"#\">{name}</a></li>".format({name: name});
            menus.append(str);
        });
        callback();
    });
}

function renderElectionResults() {
    var datasetName = $("#btn-dataset-name").text();
    $("#panel-results-row").fadeIn('fast');
    $("#panel-results-body-col").html("<h4>Loading...</h4>");

    $.getJSON('/election-results?', {filename: datasetName}, function (json) {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Party');
        data.addColumn('number', 'Votes)');

        Object.keys(json["parties"]).forEach(function (partyName) {
            var numStr = json["parties"][partyName]["sumVotes"];
            data.addRow([partyName, parseFloat(numStr)]);
        });

        var options = {
            title: 'Election Results (in Percent)',
            pieHole: 0.5,
            width: $(".sidepanel").width() - 20,
            height: 250,
            sliceVisibilityThreshold: 0.1,
            chartArea: {left: 10, top: 10, bottom: 10, right: 10}
        };

        var chart = new google.visualization.PieChart(document.getElementById('panel-results-body-col'));
        google.visualization.events.addListener(chart, 'ready', chartReadyHandler);
        chart.draw(data, options);
    });
}


function chartReadyHandler() {
    $("#panel-results-body-col").hide();
    $("#panel-results-body-col").fadeIn('fast');
}

function resetControls() {
    // var cartoMap = $("#container-cartomap");
    // cartoMap.removeClass();
    // cartoMap.hide();
    // cartoMap.html("");
    renderMap();
    // cartoMap.fadeIn();

    $("#panel-results-row").fadeOut();
    $("#container-results").html("");
    $(".dropdown-menu").not(":nth-child(2)").html("");
    loadDataSetDropdown();
    disableButtons();

    // quick and dirty
    var dropdowns = $("#menu-dataset").closest(".panel-body").find(".dropdown-toggle");
    $(dropdowns[0]).html("Select Data Set <span class=\"caret\"></span>");
    $(dropdowns[1]).html("Select Metric <span class=\"caret\"></span>");
    $(dropdowns[2]).html("Select Party <span class=\"caret\"></span>");
    $(dropdowns[3]).html("Select Party <span class=\"caret\"></span>");
    dropdowns.hide();
    dropdowns.toggle("highlight");
}

function enableDatasetButtons() {
    $(".dropdown-toggle").not("#btn-dataset-name").removeClass("disabled");
}

function disableButtons() {
    $(".btn-info").addClass("disabled");
    $(".dropdown-toggle").not("#btn-dataset-name").addClass("disabled");
}

function startLoadingAnimation() {
    $("#container-cartomap").addClass("loading");
    $("#loader").fadeIn();
}

function endLoadingAnimation() {
    $("#container-cartomap").removeClass("loading");
    $("#loader").fadeOut();
}