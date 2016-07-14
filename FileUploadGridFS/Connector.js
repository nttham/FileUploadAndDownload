var mongoose   = require('mongoose');
var Grid = require('gridfs-stream');
var dbType = "mongodb";
var host ="127.0.0.1";
exports.connectToMongo = function(dbName,callback) {
    var Schema = mongoose.Schema;
    mongoose.connect('mongodb://127.0.0.1/'+dbName);
    var dbConnection = mongoose.connection;
    Grid.mongo = mongoose.mongo;
    dbConnection.once('open', function () {
        console.log("DB Connection opened Successfully !!!!!!")
        gfs = Grid(dbConnection.db);
        var dbInstance = {
            dbConnection :dbConnection,
            gfs:gfs
        }
        return callback(null,dbInstance);
    });

};
exports.closeConnection = function(dbInstance){
         // any other clean ups
   // console.log("dbInstance   "+JSON.stringify(dbInstance))
    dbInstance.close(function () {
            console.log('Mongoose connection disconnected');
            return;
        });


};

