/*var port = process.env.PORT || 3000,
    http = require('http'),
    fs = require('fs'),
    html = fs.readFileSync('index.html');

var log = function(entry) {
    fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
};

var server = http.createServer(function (req, res) {
    if (req.method === 'POST') {
        var body = '';

        req.on('data', function(chunk) {
            body += chunk;
        });

        req.on('end', function() {
            if (req.url === '/') {
                log('Received message: ' + body);
            } else if (req.url = '/scheduled') {
                log('Received task ' + req.headers['x-aws-sqsd-taskname'] + ' scheduled at ' + req.headers['x-aws-sqsd-scheduled-at']);
            }

            res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
            res.end();
        });
    } else {
        res.writeHead(200);
        res.write(html);
        res.end();
    }
});

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);

// Put a friendly message on the terminal
console.log('Server running at http://127.0.0.1:' + port + '/'); */

const express = require('express');
const app = express();
const port = 3500;
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const apiToken = "c87gv3qad3i9lknto67g";
const dateOffset = 14;

function send(res, url, reqType, toDisplayResult = false){
  console.log('requesting finhub data at url: ' + url);
  axios.get(url)
    .then(finHubData => {
      console.log(`recieved finhub ${reqType} at ` + new Date().toLocaleTimeString());
      package = new Object();
      package[reqType] = finHubData.data;
      if(toDisplayResult){
        console.log(finHubData.data);

      }
      res.send(package);

    }).catch(err =>{
      console.error('ERROR IN ' + reqType + " ENCOUNTERED", err.message);
      package = new Object();
      package[reqType] = new Object();
      res.send(package)
    });
}
app.use(cors());

var http = require('http'),
  fs = require('fs');


app.get('/profile/:id', (req, res) => {
  const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${req.params.id}&token=${apiToken}`;
  send(res, profileUrl, 'profile');
  /*const priceUrl = `https://finnhub.io/api/v1/quote?symbol=${id}&token=${apiToken}`;
  send(res, priceUrl, 'priceData');*/
});

app.get('/price/:id', (req, res) => {
  const priceUrl = `https://finnhub.io/api/v1/quote?symbol=${req.params.id}&token=${apiToken}`;
  send(res, priceUrl, 'price');
});

app.get('/symbols/:id', (req, res) => {
  const priceUrl = `https://finnhub.io/api/v1/search?q=${req.params.id}&token=${apiToken}`;
  send(res, priceUrl, 'symbols');
});

app.get('/news/:id', (req, res) => {

  var twoWeeks = new Date();
  twoWeeks = new Date(twoWeeks.setDate(twoWeeks.getDate() - dateOffset)).toISOString().split('T')[0];
  console.log(twoWeeks);
  const now = new Date(Date.now()).toISOString().split('T')[0];
  const newsUrl = `https://finnhub.io/api/v1/company-news?symbol=${req.params.id}&from=${twoWeeks}&to=${now}&token=${apiToken}`;
  send(res, newsUrl, 'news');
});

app.get('/charts/:id', (req, res) =>{
  const now =  Math.floor(Date.now() / 1000);
  var prev = (now - 604800);
  var last = Math.floor(new Date(new Date().setFullYear(new Date().getFullYear() -2)).getTime() /1000);
  const candlesUrl = `https://finnhub.io/api/v1/stock/candle?symbol=${req.params.id}&resolution=D&from=${last}&to=${now}&token=${apiToken}`
  send(res, candlesUrl, 'charts');
});

app.get('/mentions/:id', (req, res) =>{
  const mentionsUrl = `https://finnhub.io/api/v1/stock/social-sentiment?symbol=${req.params.id}&from=2022-01-01&token=${apiToken}`;
  send(res, mentionsUrl, 'mentions');
});

app.get('/recommendations/:id', (req, res)=>{
  const recsUrl = `https://finnhub.io/api/v1/stock/recommendation?symbol=${req.params.id}&token=${apiToken}`;
  send(res, recsUrl, 'recommendations');
});

app.get('/earnings/:id', (req, res) => {
  const earningsUrl = `https://finnhub.io/api/v1/stock/earnings?symbol=${id}&token=${apiToken}`;
  send(res, earningsUrl, 'earnings');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})
