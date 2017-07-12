var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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
    console.log(socket.handshake.issued+': ' + _command);
    console.log('serialConnection: ', serialConnection.opening);

    io.emit('send_serial_command', socket.handshake.issued+": " +_command);
    if(serialConnection.opening != false){
      serialConnection.on("open", function(){
        console.log("Porta serial aberta");
        serialConnection.write(_command);
      });
      //Recebendo dados da serial
      serialConnection.on("data", function(byte){
        console.log("DATA: ", byte);
        io.emit('send_serial_command', JSON.stringify({"retorno_serial": byte}));
      });
    } else {
      console.log("Sem Conexão na porta: "+sp);
    }
  });
});
