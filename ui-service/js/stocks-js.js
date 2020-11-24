const STOCKS_URL = `http://localhost:4000`;
const USERS_URL = `http://localhost:3000`;
const PREDICTION_URL = `http://localhost:6000`;
let stockname = "";
let firstname = "";
let stockprice = 0;

window.onload = function () {
    var url = document.location.href,
        params = url.split('?')[1].split('&'),
        data = {}, tmp;
    for (var i = 0, l = params.length; i < l; i++) {
        tmp = params[i].split('=')
        data[tmp[0]] = tmp[1].replace(/[^a-zA-Z ]/g, "");;
    }
    // console.log(data);
    firstname = data.Firstname;
    stockname = data.stockname;

    if (firstname && stockname){
        setUserStocks(firstname);
        setStockMetaData(stockname);
        setStockCharts(stockname);
    }
};

async function setUserStocks(firstname){
    const result = await fetch(`${USERS_URL}/getUserStocks?Firstname=${firstname}`);
    const response = await result.json();
    $("#username").html(response.Name);
    let dropdown="";

    for (const [key, value] of Object.entries(response.Stocks)) {
        dropdown+=`<a href="./stocks.html?Firstname=${firstname}&stockname=${key}" class="dash-nav-dropdown-item">${key}</a>`;
    }
    $("#stocksOwned").append(dropdown);
}

async function setStockMetaData(symbol){
    const result = await fetch(`${STOCKS_URL}/getSingleStockInfo/${symbol}`);
    const data = await result.json();
    stockprice = data.regularMarketPrice;
    displayData(data);

    const now = new Date();
    const nineAm = new Date().setHours(9,0,0,0);
    const fivePm = new Date().setHours(17, 0, 0, 0, 0);
    if(now >= nineAm && now <= fivePm){
        let time = setInterval(updateRealtimeStock, 750);
    }
    else {
        $('#abc').removeClass('stats-success');
        $('#abc').removeClass('stats-danger');
        $('#abc').addClass('stats-dark');
        $(`.stats-timeframe`).html('');
        $(`#realtimeStockPrice`).html(`Realtime Price - ${stockname}`);
        $(`#stockRate`).html(`$${stockprice}`);
        $(`#percentChange`).html(``);
    }
}

function displayData(data){
    $(`#longName`).html(data.longName);

    $(`#displayName`).html(`${data.displayName}`);
    $(`#fullExchangeName`).html(`${data.fullExchangeName}`);
    $(`#currency`).html(`${data.currency} - ${data.region}`);
    $(`#volume`).html(`${data.regularMarketVolume}`);

    $(`#regMarketHigh`).html(`$${data.regularMarketDayHigh}`);
    $(`#regMarketLow`).html(`$${data.regularMarketDayLow}`);
    $(`#fiftyTwoWeekHigh`).html(`$${data.fiftyTwoWeekHigh}`);
    $(`#fiftyTwoWeekLow`).html(`$${data.fiftyTwoWeekLow}`);
}

function updateRealtimeStock(){
    const price = stockprice;
    const currentPrice = generateRandomNumbers(price);
    let percChange = getPercentageChange(price, currentPrice);
    if (percChange > 0){
        percChange = `+${percChange}`;
    }
    $(`#realtimeStockPrice`).html(`Realtime Price - ${stockname}`);
    $(`#stockRate`).html(`$${currentPrice}`);
    $(`#percentChange`).html(`${percChange}`);
    $(`.stats-timeframe`).html('from Avg. Price');
    if (currentPrice <= price){
        if ( $('#abc').hasClass('stats-success') || $('#abc').hasClass('stats-dark')){
            $('#abc').removeClass('stats-success');
            $('#abc').addClass('stats-danger');
        }
    }else{
        $('#abc').removeClass('stats-danger');
        $('#abc').addClass('stats-success');
    }

}
// setInterval(updateRealtimeStock, 750);

async function setStockCharts(stockname){
    let y = 1000;
    let data1, data2, data3;
    data1 = data2 = data3 = [];
    let dataSeries = { type: "spline", yValueFormatString: "$#,###.##" };
    let dataPoints = [];

    // Chart 1 - Current Chart
    const result1 = await fetch(`${STOCKS_URL}/getIntraDayQuotes/${stockname}`);
    const currentChartData = await result1.json();
    delete currentChartData._id;
    for(const [key, value] of Object.entries(currentChartData)){
        dataPoints.push({
            x: new Date(Date.parse(key)),
            y: Number(value["2. high"])
        });
    }
    dataSeries.dataPoints = dataPoints;
    data1.push(dataSeries);
    const stockChart1 = new CanvasJS.StockChart("chartContainer1",{
        title:{ text:`${stockname} - IntraDay` },
        animationEnabled: true,
        rangeSelector:{ enabled: false },
        charts: [{
            data: data1,
            axisX: {
                crosshair: {
                    enabled: true,
                    snapToDataPoint: true
                }
            },
            axisY: {
                title: "USD",
                prefix: "$",
                crosshair: { enabled: true }
            },
        }],
    });
    stockChart1.render();

    dataPoints = [];
    // Chart 2 - Past Chart
    const result2 = await fetch(`${STOCKS_URL}/getDailyQuotes/${stockname}`);
    const pastChartData = await result2.json();
    delete pastChartData._id;
    for(const [key, value] of Object.entries(pastChartData)){
        dataPoints.push({
            x: new Date(Date.parse(key)),
            y: Number(value["2. high"])
        });
    }
    dataSeries.dataPoints = dataPoints;
    data2.push(dataSeries);
    const stockChart2 = new CanvasJS.StockChart("chartContainer2",{
        title:{ text:`${stockname} - Daily` },
        animationEnabled: true,
        rangeSelector:{ enabled: false },
        charts: [{
            data: data2,
            axisX: {
                crosshair: {
                    enabled: true,
                    snapToDataPoint: true
                }
            },
            axisY: {
                title: "USD",
                prefix: "$",
                crosshair: { enabled: true }
            },
        }],
    });
    stockChart2.render();

    dataPoints = [];
    // Chart 3 - Predicted Chart
    /*const result3 = await fetch(`${PREDICTION_URL}/${stockname}`);
    const predictedChartData = await result3.json();
    delete predictedChartData._id;
    for(const [key, value] of Object.entries(predictedChartData)){
        dataPoints.push({
            x: new Date(Date.parse(key)),
            y: Number(value["2. high"])
        });
    }
    dataSeries.dataPoints = dataPoints;
    data3.push(dataSeries);
    const stockChart3 = new CanvasJS.StockChart("chartContainer3",{
        title:{ text:`${stockname} - IntraDay` },
        animationEnabled: true,
        rangeSelector:{ enabled: false },
        charts: [{
            data: data3,
            axisX: {
                crosshair: {
                    enabled: true,
                    snapToDataPoint: true
                }
            },
            axisY: {
                title: "USD",
                prefix: "$",
                crosshair: { enabled: true }
            },
        }],
    });
    stockChart3.render();*/
}

function generateRandomNumbers(price){
    return (Math.random() * ((price + 5) - (price - 5) + 1)+ (price - 5)).toFixed(2);
}

function getPercentageChange(price, currentPrice){
    return ((currentPrice/price - 1)*100.0).toFixed(2);
}
