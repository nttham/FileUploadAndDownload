var express = require('express');
var multer = require('multer'),
    bodyParser = require('body-parser'),
    path = require('path');
var fs = require('fs');
var app = new express();
app.use(bodyParser.json());
var gfs;
var conn;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://127.0.0.1/test1');
conn = mongoose.connection;
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
conn.once('open', function () {
console.log("DB Connection opened Successfully !!!!!!")
gfs = Grid(conn.db);

app.get('/', function(req, res){
  res.render('index');
});
app.post('/', multer({ dest: './uploads/'}).single('upl'), function(req,res){
    
    var fileName = req.file.filename;
    var filePath = process.cwd() +'/uploads/'+fileName;
     var originalName = req.file.originalname;
    var writestream = gfs.createWriteStream({
        filename: fileName
    });
   
    fs.createReadStream(filePath).pipe(writestream);
     writestream.on('close', function (file) {
        fs.unlink(filePath, function() {
       res.json(file);
      res.status(204).end();
  });
     });
    
    
});
app.get('/file/:id',function(req,res){
  var fileName = req.param('id');
    gfs.files.find({filename: fileName}).toArray(function (err, files) {
        if(err){
            res.json(err);
            res.status(400).end();
        }
        else{
             if (files.length > 0) {
             var read_stream = gfs.createReadStream({filename: fileName});
             var mime = 'application/x-pkcs12';
             res.set('Content-Type', mime);
             read_stream.pipe(res);
        }
        else{
            res.json({"error":"File Not Found"});
            res.status(400).end();
        }
    }


    });
         
});

        
    });
    



var port = Number(process.env.VCAP_APP_PORT || 3000);

  app.listen(port);
  console.log('Server started on port %d', port);

