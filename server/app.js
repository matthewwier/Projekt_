var express = require('express');
var cors = require('cors')

var app = express()
app.use(cors())
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
app.use(express.static(path.join(__dirname, 'public')));

function wait() {
  var start = new Date().getTime();
  var end = start;
  while (end < start + 2000) {
    end = new Date().getTime();
  }
}

// Wykonanie programu java
app.get('/parser', function (req, res) {

  console.log(req.query.filename + " " + req.query.date);
  var path = "uploads/" + req.query.filename;
  var dbname = req.query.filename + "_" + req.query.date;
  dbname = dbname.replace('-', '').replace('-', '').replace(':', '').replace(':', '').replace('.','');
  console.log(dbname);
  const { execSync } = require('child_process');
  let stdout_2 = execSync('influx -execute \'CREATE DATABASE '+ dbname + '\'');
  let stdout = execSync('java -jar SarParser-1.1-SNAPSHOT-jar-with-dependencies.jar -dbname='+dbname+' -input=' + path + ' -driver')
  
  var request = require('request');
  console.log('OK14');
  // mozna dodac baze z nazwa 
  const options = {
    url: 'http://localhost:3000/api/datasources/1',
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Accept-Charset': 'utf-8',
    },
    json: {
      "id": 1,
      "orgId": 1,
      "name": "sarek",
      "type": "influxdb",
      "access": "proxy",
      "url": "http://localhost:8086",
      "password": "admin",
      "user": "admin",
      "database": dbname,
      "basicAuth": false,
      "isDefault": true,
      "jsonData": null
    }
  };

  request(options, function (err, res, body) {
    console.log(body);
  });
  res.end();
  require("openurl").open("http://localhost:3000/dashboard/db/cpus?orgId=1");
});

app.get('/delete', function (req, res) {
  console.log(req.query.dateToDelete);
  var date = req.query.dateToDelete;
  console.log(date);



  fs.readFile('files.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {
      //Delete from uploads - unlink
      obj = JSON.parse(data);
      objToDelete = obj.filter(file => file.date == date);
      var fileToDelete = objToDelete[0].fileName;
      var path = '../server/uploads/' + fileToDelete;
      fs.unlink(path, function (err) {
        if (err) return console.log(err);
        console.log('file deleted successfully');
      });

      objAfterRemove = obj.filter(file => file.date != date);
      console.log(objAfterRemove);

      json = JSON.stringify(objAfterRemove);
      fs.writeFile('files.json', json, 'utf8', function (err) {
        if (err) {
          console.log(err);
        }
      });

      fs.writeFile('../src/assets/sars.json', json, 'utf8', function (err) {
        if (err) {
          console.log(err);
        }
        console.log('succesfully written to sars.json');
      });
    }
  });
  res.end();
});



app.post('/upload', function (req, res) {

  var form = new formidable.IncomingForm();

  form.multiples = true;

  var date;
  var filename;
  form.parse(req);
  form.on('field', function (name, field) {
    date = String(field);
  })

  form.on('fileBegin', function (name, file) {

    file.path = __dirname + '/uploads/' + file.name;
    console.log(file.size);
    filename = String(file.name);

  });
  // check file rewriting
  form.on('end', function () {
    fs.readFile('files.json', 'utf8', function readFileCallback(err, data) {
      if (err) {
        console.log(err);
      } else {
        obj = JSON.parse(data);
        obj.push({ fileName: filename, date: String(date) });
        obj.sort(function (a, b) {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        json = JSON.stringify(obj);

        fs.writeFile('files.json', json, 'utf8', function (err) {
          if (err) {
            console.log(err);
          }
        });
        fs.writeFile('../src/assets/sars.json', json, 'utf8', function (err) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
    wait();
    res.end();
  });
});

var server = app.listen(8081, function () {
  console.log('Server listening on port 8081');
});
