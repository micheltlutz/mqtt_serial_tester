var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mqtt = require('mqtt')
var client_mqtt  = mqtt.connect('mqtt://192.168.1.128')

var SerialPort = require("serialport");
var serialConnection = null;
const sp = "/dev/tty.usbmodem1411";
const porta_ws = 3080;
const baundrate = 9600
try {
    serialConnection = new SerialPort(sp, {
      baundrate:baundrate
    });
} catch(error) {
  console.log("Não foi possível acessar a porta: "+sp);
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('socket io connected id: ', socket.handshake.issued);
  io.emit('send_serial_command', socket.handshake.issued+": conectou" );
});

http.listen(porta_ws, function(){
  console.log('Webserver on http://localhost:'+porta_ws);
});

io.on('connection', function(socket){
  socket.on('send_serial_command', function(_command){

    //console.log('serialConnection: ', serialConnection);

    var obj = JSON.parse(_command);
    console.log('obj: ', obj);
    console.log('obj.type: ', obj.type);
    console.log('obj.msg: ', obj.msg);
    switch(obj.type){
      case "mqtt":
        sendMQTT(obj.msg);
        break;
      case "serial":
        sendSerial(obj.msg);
        break;
      default:
          io.emit('type indefinido. Diposniveis mqtt ou serial', socket.handshake.issued+": " +_command);
    }


    console.log(socket.handshake.issued+': ' + _command);

    io.emit('send_serial_command', socket.handshake.issued+": " +_command);

    if(serialConnection.oppning != false){
      console.log(serialConnection.oppning);
    } else {
      console.log("Sem Conexão na porta: "+sp);
    }
  });
});

/*SEND SERIAL*/
function sendSerial(_data)
{
    serialConnection.write(_data);
}
serialConnection.on("open", function(){
  console.log("Porta serial aberta");
  //serialConnection.write(_command);
});

serialConnection.on("data", function(byte){
  console.log("DATA: ", byte);
  io.emit('send_serial_command', JSON.stringify({"retorno_serial": byte}));
});

/*SEND MQTT*/
function sendMQTT(_data)
{
  client_mqtt.on('connect', function () {
    client_mqtt.subscribe('maxi')
    client_mqtt.publish('maxi', _data)
  })
}

client_mqtt.on('message', function (topic, message) {
  // message is Buffer
  console.log("client_mqtt-message: ", message.toString())
  client_mqtt.end()
})
