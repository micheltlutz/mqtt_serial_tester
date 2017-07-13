var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mqtt = require('mqtt')
var SerialPort = require("serialport");

var client_mqtt = null;
var serialConnection = null;
const porta_ws = 3080;


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('socket io connected id: ', socket.handshake.issued);
  io.emit('send_command', socket.handshake.issued+": conectou" );
});

http.listen(porta_ws, function(){
  console.log('Webserver on http://localhost:'+porta_ws);
});

io.on('connection', function(socket){
  socket.on('send_command', function(_command){

    //console.log('serialConnection: ', serialConnection);

    var obj = _command;
    console.log('obj: ', obj);
    console.log('obj.type: ', obj.type);
    console.log('obj.msg: ', obj.msg);
    switch(obj.type){
      case "mqtt":
        sendMQTT(_command);
        break;
      case "serial":
        sendSerial(_command);
        break;
      default:
          io.emit("send_command", 'type indefinido. Diposniveis mqtt ou serial', socket.handshake.issued+": " +_command);
    }
    console.log(socket.handshake.issued+': ' + JSON.stringify(_command));
    io.emit('send_command', socket.handshake.issued+": " +JSON.stringify(_command));
  });
});

/*SEND SERIAL*/
function sendSerial(_data)
{
  //const sp = "/dev/tty.usbmodem1411";
  //const baundrate = 9600

    console.log("sendSerial-data", _data);

    /*
    serialConnection = new SerialPort(sp, {
      baundrate:baundrate
    });
    serialConnection.write(_data);

    serialConnection.on("open", function(){
      console.log("Porta serial aberta");
      //serialConnection.write(_command);
    });

    serialConnection.on("data", function(byte){
      console.log("DATA: ", byte);
      io.emit('send_command', JSON.stringify({"retorno_serial": byte}));
    });
    */
}


/*SEND MQTT*/
function sendMQTT(_data)
{
  console.log("sendMQTT-data", _data);
  /*
  client_mqtt = mqtt.connect('mqtt://192.168.1.128');
  client_mqtt.on('connect', function () {
    client_mqtt.subscribe('maxi')
    client_mqtt.publish('maxi', _data)
  })
  client_mqtt.on('message', function (topic, message) {
    // message is Buffer
    console.log("client_mqtt-message: ", message.toString())
    client_mqtt.end()
  })

  */
}
