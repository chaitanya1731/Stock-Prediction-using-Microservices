const URL = `http://104.198.35.242:3000`;
let firstname = "";

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

    setData(firstname);

};


function setData(firstname){
    $.ajax({
        type: "GET",
        url: `${URL}/getUserStocks?Firstname=${firstname}`,
        dataType: "json",
        success: function(response){
            // console.log(response);
            $("#username").html(response.Name);
            let table="";
            let dropdown="";

            let i=1;
            for (const [key, value] of Object.entries(response.Stocks)) {
                table+=`<tr>`;
                table+=`<th scope="row">${i}</td>`;
                table+=`<td><a href="./stocks.html?Firstname=${firstname}&stockname=${key}">${key}</a></td>`;
                table+=`<td>${value.shares}</td>`;
                table+=`<td>${value.price}$</td>`;
                table+=`<td>${(value.price * value.shares).toFixed(2)}$</td>`;
                table+=`</tr>`;

                dropdown+=`<a href="./stocks.html?Firstname=${firstname}&stockname=${key}" class="dash-nav-dropdown-item">${key}</a>`;
                i++;
            }
            $("#stocksOwned").append(dropdown);
            $("#stocksTable tbody").append(table);
            setTotalAmount();
        }
    });
}

function setTotalAmount(){
    let totalInvestedAmount=0;
    const $tdElement = $("#stocksTable tbody tr td:nth-child(5)").toArray();
    $tdElement.forEach(element => {
        totalInvestedAmount += (Number((element.innerHTML.replace(/[^0-9.]/g,""))))
    });
    $("#totalInvestedAmount").html(`Investing = $${totalInvestedAmount.toFixed(4)}`);
}