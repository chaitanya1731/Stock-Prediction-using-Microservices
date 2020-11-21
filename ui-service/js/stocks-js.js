const STOCKS_URL = `http://localhost:4000`;
const USERS_URL = `http://localhost:3000`;
let stockname = "";
let firstname = "";


function generateRandomNumebrs(price){
    return (Math.random() * ((price + 10) - (price - 10) + 1)+ (price - 10)).toFixed(2);
}

function getPercentageChange(price, currentPrice){
    return ((currentPrice/price - 1)*100.0).toFixed(2);
}

function updateRealtimeStock(){
    const price = 100;
    const currentPrice = generateRandomNumebrs(price);
    let percChange = getPercentageChange(price, currentPrice);
    if (percChange > 0){
        percChange = `+${percChange}`;
    }
    $(`#stockRate`).html(`$${currentPrice}`);
    $(`#percentChange`).html(`${percChange}`);
    if (currentPrice <= price){
        if ( $('#abc').hasClass('stats-success')){
            $('#abc').removeClass('stats-success');
            $('#abc').addClass('stats-danger');
        }
    }else{
        $('#abc').removeClass('stats-danger');
        $('#abc').addClass('stats-success');
    }

}

setInterval(updateRealtimeStock, 750);

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
  
  setStockData(stockname);
}


function setStockData(stockname){
  $.ajax({
    type: "GET",
    url: `${USERS_URL}/getUserStocks?Firstname=${firstname}`,
    dataType: "json",
    success: function(response){
        // console.log(response);
        $("#username").html(response.Name);
        let dropdown="";

        for (const [key, value] of Object.entries(response.Stocks)) {
            dropdown+=`<a href="./stocks.html?Firstname=${firstname}&stockname=${key}" class="dash-nav-dropdown-item">${key}</a>`;
        }
        $("#stocksOwned").append(dropdown);
      }
  });


  $.ajax({
    type: "GET",
    url: `${STOCKS_URL}/getIntraDayQuotes/${stockname}`,
    // data: {"type": "check"},
    dataType: "json",
    success: function(response){
        let y = 1000;
        let data = []; 
        let dataSeries = { type: "spline", yValueFormatString: "$#,###.##" };
        let dataPoints = [];

        delete response._id;
        for(const [key, value] of Object.entries(response)){
          dataPoints.push({
              x: new Date(Date.parse(key)), 
              y: Number(value["2. high"])
          })
        }

        dataSeries.dataPoints = dataPoints;
        
        data.push(dataSeries);
        
        var stockChart = new CanvasJS.StockChart("chartContainer1",{
        title:{ text:`${stockname} - IntraDay` },
        animationEnabled: true,
        rangeSelector:{ enabled: false },
        charts: [{
          data: data,
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
      stockChart.render();
    }
  });





  $.ajax({
  type: "GET",
  url: `${STOCKS_URL}/getDailyQuotes/${stockname}`,
  dataType: "json",
  success: function(response){
        let y = 1000;
        let data = []; 
        let dataSeries = { type: "spline", yValueFormatString: "$#,###.##" };
        let dataPoints = [];

        delete response._id;
        for(const [key, value] of Object.entries(response)){
          dataPoints.push({
              x: new Date(Date.parse(key)), 
              y: Number(value["2. high"])
            })
        }

        dataSeries.dataPoints = dataPoints;
        // console.log(dataPoints);
        
        data.push(dataSeries);
        
        var stockChart = new CanvasJS.StockChart("chartContainer2",{
        title:{ text:`${stockname} - Daily` },
        animationEnabled: true,
          rangeSelector:{ enabled: false },
          charts: [{
            data: data,
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
      stockChart.render();
    }
  });

}
