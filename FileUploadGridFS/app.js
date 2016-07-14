/**
 * Created by cognizant on 13/07/16.
 */
var express = require('express');
var multer = require('multer'),
    bodyParser = require('body-parser'),
    path = require('path');
var fs = require('fs');
var app = new express();
var connector = require('./Connector.js')
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.get('/', function(req, res){
    res.render('index');
});
var afterResponse = function(db) {
    console.log('Mongoose afterResponse');
    // any other clean ups
    db.close(function () {
        console.log('Mongoose connection disconnected');
    });

}
app.post('/', multer({ dest: './uploads/'}).single('upl'), function(req,res){

    console.log("req file "+JSON.stringify(req.file));
    connector.connectToMongo('upl',function(err,dbInstance){

        var fileName = req.file.filename;
        var filePath = process.cwd() +'/uploads/'+fileName;
        var originalName = req.file.fileName;
        console.log("req file "+JSON.stringify(req.file));
        var writestream = dbInstance.gfs.createWriteStream({
            filename: fileName
        });

        fs.createReadStream(filePath).pipe(writestream);
        writestream.on('close', function (file) {
            fs.unlink(filePath, function() {
                afterResponse(dbInstance.dbConnection);
                res.json(file);
                res.status(204).end();

            });
        });


    })



});

app.get('/file/:id',function(req,res){

    var fileName = req.param('id');
     connector.connectToMongo('upl' ,function(err,dbInstance) {

        dbInstance.gfs.files.find({filename: fileName}).toArray(function (err, files) {
            if (err) {
                afterResponse(dbInstance.dbConnection)
                res.json(err);
                res.status(400).end();
            }
            else {
                if (files.length > 0) {
                    var read_stream = gfs.createReadStream({filename: fileName});
                    var mime = 'application/x-pkcs12';
                    res.set('Content-Type', mime);
                    read_stream.pipe(res);
                    read_stream.on('end', function() {
                        afterResponse(dbInstance.dbConnection)
                    });

                }
                else {
                    afterResponse(dbInstance.dbConnection)
                    res.json({"error": "File Not Found"});
                    res.status(400).end();
                }
            }


        });
    });

});
process.on('uncaughtException', function (err) {
    console.log("Got uncaught Exception *******"+err);
    afterResponse(dbInstance.dbConnection)
})
var port = Number(process.env.VCAP_APP_PORT || 3000);

app.listen(port);
console.log('Server started on port %d', port);