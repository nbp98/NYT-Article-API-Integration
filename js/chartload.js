var responseFullData = {};
// show loading text in canvas
var canvas = document.getElementById("loadingChart");
var ctx = canvas.getContext("2d");
ctx.font = "30px Comic Sans MS";
ctx.fillStyle = "red";
ctx.textAlign = "center";
ctx.fillText("Loading", canvas.width / 2, canvas.height / 2);

function get_data_from_api(period = 1) {
    const API_KEY = "aG1OelFwTWxrTFNzVEd2blI4dHBBT21pYkdESHdpY1U="
    const endpoint = `https://api.nytimes.com/svc/mostpopular/v2/viewed/${period}.json?api-key=${atob(API_KEY)}`

    const request = new XMLHttpRequest();
    request.open("GET", endpoint);
    request.onload = () => {
        responseFullData = JSON.parse(request.responseText);
        const processedData = process_response_data(responseFullData);
        const [labels, data] = get_section_labels_data(processedData);
        setFilterList(labels, data);
        show_chart(labels, data, period, responseFullData);

        hide_all_loading();
    }
    request.send();
}

function get_section_labels_data(processedData) {
    const labels = Object.keys(processedData);
    const data = Object.values(processedData);
    return [labels, data]
}

function process_response_data(responseData) {
    const dataset = []
    responseData.results.forEach(result => {
        dataset.push(result.section);
    })

    var result = {}

    dataset.forEach(data => {
        if (data in result) {
            result[data] = result[data] + 1
        }
        else {
            result[data] = 1
        }
    })

    return result

}

function generate_random_color(number) {
    let i = 0;
    const colors = [];
    while (i < number) {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        color = "#" + randomColor;
        colors.push(color);
        i = i + 1
    }

    return colors;
}

function show_chart(labels, data, period, responseFullData = {}) {
    var option = {

        title: {
            display: true,
            fontSize: 18,
            text: [`Most Popular NY Times Articles the last ${period} day(s)`] // , "US / Sports / Technology"
        },

        responsive: true,
        legend: false,

        scales: {
            yAxes: [{
                stacked: false,
                gridLines: {
                    display: false,
                    color: "rgba(255,99,132,0.2)"
                },
                ticks: {
                    beginAtZero: true
                },
                scaleLabel: {
                    display: true,
                    labelString: "Scores"
                }

            }],
            xAxes: [{
                gridLines: {
                    display: false
                },
                scaleLabel: {
                    display: true,
                    labelString: "Sections"
                }
            }]
        },

        tooltips: {
            cornerRadius: 0,
            caretSize: 0,
            xPadding: 16,
            yPadding: 10,
            backgroundColor: 'grey',
            titleFontStyle: 'normal',
            titleMarginBottom: 15
        },

        onClick: function (e) {
            var activePointLabel = this.getElementsAtEvent(e)[0]._model.label;
            delete_and_recreate_details_table(responseFullData, [activePointLabel]);
            itemDetailsDivSelect = document.getElementById('itemDetailsDiv');
            itemDetailsDivSelect.style.display = "block";

        }
    };

    var multiColorData = {
        labels: labels,

        datasets: [{
            label: "Score",
            backgroundColor: generate_random_color(labels.length),
            borderColor: "rgba(255,99,132,1)",
            borderWidth: 0,
            hoverBackgroundColor: "cadetblue",
            hoverBorderColor: "rgba(255,99,132,1)",
            data: data
        }]
    };

    Chart.Bar('barChart', {
        options: option,
        data: multiColorData
    });
}

function get_processed_data(data, section) {
    console.log(section);
    const dataset = []
    data.results.forEach(result => {
        if (section.includes(result.section)) {
            d = []
            d.push(result.title);
            d.push(result.published_date);
            d.push(result.adx_keywords);
            d.push(result.url);
            dataset.push(d);
        }

    })

    return dataset;
}

function delete_and_recreate_details_table(data, section) {

    const tableCaption = document.getElementById("tableCaption");
    tableCaption.innerText = section

    const tbody = document.getElementById("detailsTableTbody")
    tbody.innerHTML = "";
    processed_data_list = get_processed_data(data, section);

    processed_data_list.forEach(dataItem => {
        const newTr = document.createElement('tr');
        const newTd1 = document.createElement('td')
        newTd1.innerText = dataItem[0];
        const newTd2 = document.createElement('td')
        newTd2.innerText = dataItem[1];
        const newTd3 = document.createElement('td')
        newTd3.innerText = dataItem[2];
        const newTd4 = document.createElement('td')
        newTd4.className = "text-center";

        const a = document.createElement('a')
        a.href = dataItem[3]
        a.target = "_blank"
        const img = document.createElement('img')
        img.src = "./icon/visit.png"
        img.alt = "visit"
        a.appendChild(img)
        newTd4.appendChild(a)

        newTr.appendChild(newTd1)
        newTr.appendChild(newTd2)
        newTr.appendChild(newTd3)
        newTr.appendChild(newTd4)
        tbody.appendChild(newTr)
    })


}

function delete_and_recreate_chart() {
    var barCanvasOld = document.getElementById("barChart");
    barCanvasOld.remove();

    // now create the element again
    const barCanvasNew = document.createElement("canvas");
    barCanvasNew.id = "barChart";
    barCanvasNew.style.display = "none";
    barCanvasNew.setAttribute('height', "500vw");
    barCanvasNew.setAttribute('width', "800vw");
    const chartBox = document.getElementById("chartBox");
    chartBox.appendChild(barCanvasNew);
}

function hide_all_loading() {
    document.getElementById('loadingFilter').style.display = "none";
    document.getElementById('loadingChart').style.display = "none";

    document.getElementById('filtersList').style.display = "block";
    document.getElementById('barChart').style.display = "block";
}

function show_all_loading() {
    document.getElementById('loadingFilter').style.display = "block";
    document.getElementById('loadingChart').style.display = "block";

    document.getElementById('filtersList').style.display = "none";
    document.getElementById('barChart').style.display = "none";
}

function selectChangedHandler(event) {
    const period = event.target.value;
    show_all_loading()
    delete_and_recreate_chart();

    get_data_from_api(period);
}

function filterListChangeHandler(event) {
    // console.log(event.target.parentNode);
    const value = event.target.checked;
    const name = event.target.name;
    delete_and_recreate_chart();
    const periodSelect = document.getElementById("periodSelect").value;

    // get labels and data
    const labels = []
    const data = []
    const filterList = document.getElementById('filtersList');
    const childs = filterList.childNodes;

    childs.forEach(child => {
        const checkInput = child.childNodes[1];
        if (checkInput.checked) {
            labels.push(child.getAttribute('data-section'));
            data.push(child.getAttribute('data-score'));
        }
    })

    show_chart(labels, data, periodSelect, responseFullData);
    hide_all_loading();
    delete_and_recreate_details_table(responseFullData, labels);
}

function setFilterList(labels, data) {
    const filterList = document.getElementById('filtersList');
    filterList.innerHTML = "";

    labels.forEach((l, index) => {
        const label = document.createElement('label');
        label.className = "container-input-checkbox";
        label.setAttribute("data-score", data[index]);
        label.setAttribute("data-section", l);

        const labelText = document.createTextNode(l);

        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = true;

        const span = document.createElement("span");
        span.className = "checkmark";
        span.innerHTML = "";

        label.appendChild(labelText);
        label.appendChild(input);
        label.appendChild(span);

        filterList.appendChild(label);

    })
    delete_and_recreate_details_table(responseFullData, labels);
}