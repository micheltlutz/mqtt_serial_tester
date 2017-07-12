var SerialPort = require("serialport");
const http = require("http");
const fs = require("fs");
const port = 3080;

var port = new SerialPort("/dev/tty.usbmodem1411", {
  baundrate:9600
});

port.on("open", function(){
  console.log( "porta aberta");
  port.write("0x00");
});

port.on("data", function(byte){
  console.log("DATA: ", byte);
})
