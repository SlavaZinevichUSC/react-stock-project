
function AsUrl(path, ticker) {
  return path + '?' + new URLSearchParams({ticker_sym: ticker});
}

function onKeyUp(ev){
  if(ev == null){
    ev = window.event;
  }
  if (ev.keyCode === 13) {
    ev.preventDefault();
    onTickerSearch();
    return false;
  }
  return true;
}
function onTickerSearch () {
  var tickerIn = document.getElementsByName('ticker-search')[0].value.toUpperCase();
  if(tickerIn.length == 0){
    document.getElementsByName('ticker-search')[0].reportValidity();
    return;
  }

  event.preventDefault();
  var url = '/get_company_info?' + new URLSearchParams({ticker_sym: tickerIn});
  fetchAndDisplayJSON(url, createCompanyHTML);

  url = '/get_company_stock_summary?' + new URLSearchParams({ticker_sym: tickerIn});
  fetchAndDisplayJSON(url, createStockSummaryHTML);

  var url = '/get_stock_chart_data?' + new URLSearchParams({ticker_sym: tickerIn});
  fetchAndDisplayJSON(url, createAndSetChart);

  url = '/get_latest_news?' + new URLSearchParams({ticker_sym: tickerIn});
  fetchAndDisplayJSON(url, createLatestNewsHTML);
}

function fetchAndDisplayJSON(url, htmlFunc){
  var vars = { method: 'get', dataType: 'json',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }};
  fetch(url, vars)
  .then(function(response) {
      return response.json();
    })
  .then(function(data) {
    htmlFunc(data[0]['info']);
  })
  .catch(function(error) {
      console.log('error for ' + url + ' is: ' + error);
  });
}


function createLatestNewsHTML(stockjson){
  if(IsTickerInvalid(stockjson)){
    return;
  }

  var html = '<ul class="news-table">';
  for(let i = 0; i < 5; i++){
    var news_item = stockjson[i];
    html += '<li class="news-list-item"> <ul class="news-list-item-sub" style="display:block-inline;"> <li class="news-list-item-sub-item">';
    html += '<img style="display:inline;" onerror="replaceNewsImage(event)" src="' +  news_item['image'] + '" class="logo"/> </li> <li class="news-list-item-sub-item">';
     html += '<ul class="news-item"  style="font-weight: bold;"> <li> ' + news_item['headline'] + '</li>';
    var date = new Date(news_item['datetime'] * 1000);
    var datestr = (date.getUTCDate()) + ' ' + date.toLocaleString("en-US", { month: "long" }) + ', ' +  date.getUTCFullYear();
    html += '<li style="font-weight:normal;" >' +  datestr + '</li>';
    html += '<li> <a target="_blank" rel="noopener noreferrer" href="' + news_item['url'] + '"> See Original Post </a> </li> </ul> </li> </ul>';
  }
  html += "</ul>";
  document.getElementById('latest-news-tab').innerHTML = html;

  return;
  }

function replaceNewsImage(e){
  if(null == e){
    e = window.event;
  }
  e.onerror = null;
  e.target.src = 'static/assets/newspaper.png';
}

function createStockSummaryHTML(stockjson){
  if(IsTickerInvalid(stockjson)){
    return;
  }
  var tickerIn = document.getElementsByName('ticker-search')[0].value.toUpperCase();
  var html ='<ul>';
  html += AsLi('Stock Ticker Symbol', tickerIn);
  var toDisplay = { 'Trading Day': 't',
                'Previous Closing Price': 'pc',
                'Opening Price': 'o',
                'High Price': 'h',
                'Low Price': 'l'};
  for (const [key, value] of Object.entries(toDisplay)){
    html += AsLi(key, stockjson[value],false);
  }
  var toDisplay = {'Change': 'd','Change Percent': 'dp'};
  for (const [key, value] of Object.entries(toDisplay)){
    html += AsLi(key, stockjson[value],true);
  }
  var toDisplay = { 'strongSell': '#c7382e',
                    'sell': '#de574e',
                    'hold': '#8b946a',
                    'buy': '#418a2b',
                    'strongBuy':'#9ae084'}
  html += createRecoomendationHTML(stockjson, toDisplay);
  html += '<p> Recommendation trends </p>'
  document.getElementById('stock-summary-tab').innerHTML = html;

  return;
}

function createRecoomendationHTML(stockjson, toDisplay)
{
  var html = '<table> <tr class="recc-list"> <td style="color:' + toDisplay['strongSell'] + ';">Strong <br> Sell </td>';
  for (const [key, value] of Object.entries(toDisplay)){
    html += '<td class="recc-square" style="background-color:' + value + ';"> ' + stockjson[key] + '</td>';
  }
  html += '<td style="color:' + toDisplay['strongBuy'] + ';">Strong <br> Buy </td>  </tr> </table>';
  return html;
}

function createCompanyHTML(companyjson){
  if(IsTickerInvalid(companyjson)){
    HandleInvalidTicker();
    return;
  }
  var html = '<img onerror="replaceStockImage(event)" src="' + companyjson['logo'] + '" class="company-logo"/>';
  html += '<ul>';
  toDisplay = {'Company Name': 'name',
               'Stock Ticker Symbol': 'ticker',
               'Stock Exchange Code': 'exchange',
               'Company IPO Date': 'ipo',
               'Category': 'finnhubIndustry'};
  for (const [key, value] of Object.entries(toDisplay))
  {
    html = html + AsLi(key, companyjson[value], false);
  }
  html = html + '</ul>';
  document.getElementById('company-info-tab').innerHTML = html;
  document.getElementById('results-container').style.visibility = 'visible';
  change_tab('company-tab');


  return;
}
function replaceStockImage(e){
  if(null == e){
    e = window.event;
  }
  e.onerror = null;
  e.target.style.width="128px";
  e.target.style.height="128px";
  e.target.src = 'static/assets/stonk.png';
}

function HandleInvalidTicker(){
  change_tab('');
}

function IsTickerInvalid(companyjson){
  return Object.keys(companyjson).length == 0;
}

function AsLi(k, v, toAddArrow){
  var html = '<li> <div class="list-half"> <p class="list-key"> ' + k + '</p> </div>' +
              '<div class="list-half"> <p class="list-value"> ' + v + ' ';
  if(toAddArrow){
    html += '<img class="list-arrow" src="/static/assets' + (v > 0 ? '/up_arrow.png' : '/down_arrow.png') + '">';
  }
  html+= ' </p> </div> </li>';
  return html;
}



function change_tab(id)
 {
   var id_desc_element = document.getElementById(id + '-desc');
   if(id_desc_element != undefined && id_desc_element != null){
     document.getElementById("tab-content").innerHTML = id_desc_element.innerHTML;
     document.getElementById(id + '-desc').style.visibility = "visible";
     if(id_desc_element.id == 'charts-desc'){ /* dirty hack*/
       id_desc_element.style.display = "contents";
     } else {
       document.getElementById('charts-desc').style.display = "none"; }
  }

   var pageList = ["company-tab", "stock-summary", "charts", "latest-news"];
   pageList.forEach(function (item, index) {
     var element =document.getElementById(item);
     element.className="tab-notselected";
   });
   var visibleElement = document.getElementById(id);
   if(visibleElement != null){
     visibleElement.className="tab-selected";
     document.getElementById('invalid-ticker-container').style.visibility='hidden';
   }
   else{
     document.getElementById('results-container').style.visibility = 'hidden';
     document.getElementById('invalid-ticker-container').style.visibility='visible';
   }
 }

 function onClearInput()
 {
   change_tab('company-tab');
   document.getElementById('results-container').style.visibility = 'hidden';
   document.getElementsByName('ticker-search')[0].value = '';
   document.getElementById('charts-tab').innerHTML = "";
   document.getElementById('invalid-ticker-container').style.visibility='hidden';
 }

 function createAndSetChart(data) {
    var ticker = document.getElementsByName('ticker-search')[0].value.toUpperCase();
     var ohlc = [],
         volume = [],
         groupingUnits = [['week', [1] ], ['month',[1, 2, 3, 4, 6]]],
         i = 0;
    for(i = 0; i < data['c'].length; i+=1){
      ohlc.push([ data['t'][i] * 1000, data['o'][i], data['h'][i], data['l'][i], data['c'][i] ]);
      volume.push([ data['t'][i] * 1000, data['v'][i] ])
    }

     // create the chart
     Highcharts.stockChart('charts-tab', {

         rangeSelector: {
             selected: 1
         },

         title: {
             text: ticker + ' Historical'
         },

         yAxis: [{
             labels: {
                 align: 'right',
                 x: -3
             },
             title: {
                 text: 'OHLC'
             },
             height: '60%',
             lineWidth: 2,
             resize: {
                 enabled: true
             }
         }, {
             labels: {
                 align: 'right',
                 x: -3
             },
             title: {
                 text: 'Volume'
             },
             top: '65%',
             height: '35%',
             offset: 0,
             lineWidth: 2
         }],

         tooltip: {
             split: true
         },

         series: [{
             type: 'candlestick',
             name: ticker,
             data: ohlc,
             dataGrouping: {
                 units: groupingUnits
             }
         }, {
             type: 'column',
             name: 'Volume',
             data: volume,
             yAxis: 1,
             dataGrouping: {
                 units: groupingUnits
             }
         }]
      });
    }
