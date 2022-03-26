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
function send(res, url, reqType){
  console.log('requesting finhub data at url: ' + url);
  axios.get(url)
    .then(finHubData => {
      console.log(`recieved finhub ${reqType} at ` + new Date().toLocaleTimeString());
      package = new Object();
      package[reqType] = finHubData.data;
      res.send(package);

    }).catch(err =>{
      console.log('error encoutered while recieving finhub profile ', err.message);
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})
