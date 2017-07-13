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
    console.log('_command: ', _command);
    switch(_command.type){
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
    //path = "/dev/tty.usbmodem1411";
    //baundrate = 9600
    console.log("sendSerial-data", _data);
    serialConnection = new SerialPort(_data.serial_path, {
      baundrate:_data.boundrate
    });
    serialConnection.write(_data.command);
    serialConnection.on("open", function(){
      console.log("Porta serial aberta");
      //serialConnection.write(_command);
    });
    serialConnection.on("data", function(byte){
      console.log("DATA: ", byte);
      io.emit('send_command', JSON.stringify({"retorno_serial": byte.toString()}));
    });
}
/*SEND MQTT*/
function sendMQTT(_data)
{
  var host = 'mqtt://'+_data.mqtt_host
  if(_data.mqtt_port != "" || _data.mqtt_port != "1883"){
     host += ':'+_data.mqtt_port;
  }
  //console.log("sendMQTT-host", host);
  //console.log("sendMQTT-data", _data);
  client_mqtt = mqtt.connect(host);
  client_mqtt.on('connect', function () {
    client_mqtt.subscribe(_data.mqtt_topic);
    client_mqtt.publish(_data.mqtt_topic, _data.command);
  });

  client_mqtt.on('message', function (topic, message) {
    //console.log("client_mqtt-message: ", message.toString());
    io.emit('send_command', "client_mqtt-message:"+message.toString());
    //client_mqtt.end();
  });
}
