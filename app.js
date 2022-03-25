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

app.use(cors());

var http = require('http'),
  fs = require('fs');


app.get('/search/:id', (req, res) => {
  console.log('recieved request at' + new Date().toLocaleTimeString());
  const id = req.params.id;
  const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${id}&token=${apiToken}`;
  console.log('url is: ' + url);
  axios.get(url)
    .then(finHubData => {
      console.log('recieved finhub profile at' + new Date().toLocaleTimeString());
      console.log('recieved finhub data:');
      console.log(finHubData)
      res.send({'profileData' : finHubData.data});

    }).catch(err =>{
      console.log('error encoutered while recieving finhub profile ', err.message);
    });
});

app.get('/', (req, res) => {
  console.log('recieved request at' + new Date().toLocaleTimeString());
  const id = 'tsla';
  axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${id}&token=${apiToken}`)
    .then(res => {
      console.log('recieved finhub profile at' + new Date().toLocaleTimeString());
      res.send(data);

    }).catch(err =>{
      console.log('error encoutered while recieving finhub profile ', err.message);
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})
