Stream = require('node-rtsp-stream')
const onvif = require('node-onvif')
const Recorder = require('node-rtsp-recorder').Recorder
const express = require("express")
const app = express();
const path = require('path')

stream = new Stream({
  name: 'name',
  streamUrl: 'rtsp://192.168.1.5:5554/front',
  wsPort: 9999
});

var rec = new Recorder({
  url: 'rtsp://192.168.1.5:5554/front',
  timeLimit: 86400, // time in seconds for each segmented video file - 86400s = a day
  folder: './Storage', //custom your file path to store video
  name: 'cam1',
  directoryPathFormat: 'MMM-D-YYYY',
  fileNameFormat: 'M-D-h-mm-ss',
})

rec.startRecording();

process.camera = [];
onvif.startProbe().then((device_info_list) => {
  console.log(device_info_list.length + ' devices were found.');
  // Show the device name and the URL of the end point.

  const arr = [];
  device_info_list.forEach((info, x) => {
    if (x <= 5) {

      //console.log('- ' + info.urn);
      //console.log('  - ' + info.name);
      //console.log('  - ' + info.xaddrs[0]);
      arr.push(info.xaddrs[0])

    }


  });

  //forEach to Build Each Camera
  process.camera = arr;
  arr.forEach((onCam, i) => {

    let device = new onvif.OnvifDevice({
      xaddr: onCam,
      user: 'admin',
      pass: 'admin'
    });

    // Initialize the OnvifDevice object
    device.init().then(() => {
      // Get the UDP stream URL
      let url = device.getUdpStreamUrl();

      stream = new Stream({
        name: 'name',
        streamUrl: url,
        wsPort: 9000 + i
      })

      var rec = new Recorder({
        url: url,
        timeLimit: 60, // time in seconds for each segmented video file
        folder: './Storage', //custom your file path to store video
        name: 'cam1',
        directoryPathFormat: 'MMM-D-YYYY',
        fileNameFormat: 'M-D-h-mm-ss',
      })

      rec.startRecording();

      console.log("URL :" + url);
    }).catch((error) => {
      console.error(error);
    });

  })


}).catch((error) => {
  console.error(error);
});
app.use(express.static(path.join(__dirname, 'public')));
app.get("/", (req, res) => {
  console.log(process.camera)
  res.write(`<html lang="en">

  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <style>
          canvas {
              display: block;
              float: left;
              transform: scale(1);
              transform-origin: 0% 0% 0px;
          }
  
          .camera {
              display: block;
              margin-left: 10px;
              padding: 0px;
              width: 400px;
          }
      </style>
      <title>RTSP STREAMING NODE JS IP CAMERA </title>
      
      <div><canvas class="camera" id="videoCanvas" width="640" height="360"></canvas></div>
  
      <script type="text/javascript" src="jsmpeg.js"></script>
      <script type="text/javascript">
  
  
  
          var canvas = document.getElementById('videoCanvas');
  
          var ws = new WebSocket("ws://192.168.1.5:5554/front")
  
          var player = new jsmpeg(ws, { canvas: canvas, autoplay: true, audio: false, loop: true });
  
      </script>
      <h1>RTSP STREAMING NODE JS IP CAMERA </h1>
  
  <body>
  
  </body>
  
  </html>`)

  res.end();
})

app.listen(3000)

