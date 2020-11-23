Stream = require('node-rtsp-stream')
const onvif = require('node-onvif')
const Recorder = require('node-rtsp-recorder').Recorder
const express = require("express")
const app = express()
const path = require('path')

// Find all local network devices.


stream = new Stream({
  name: 'name',
  streamUrl: 'rtsp://172.16.8.38:5554/back',
  wsPort: 9001,
  ffmpegOptions: { // options ffmpeg flags
    '-stats': '', // an option with no neccessary value uses a blank string
    '-r': 30 // options with required values specify the value after the key
  },
})

// stream = new Stream({
//   name: 'name',
//   streamUrl: 'rtsp://admin:phamduong1986@192.168.0.100:554/cam/realmonitor?channel=2&subtype=0',
//   wsPort: 9002,
//   ffmpegOptions: { // options ffmpeg flags
//     '-stats': '', // an option with no neccessary value uses a blank string
//     '-r': 30 // options with required values specify the value after the key
//   },
// })

//recoder video


//recoder and sync to google drive
// var rec = new Recorder({
//   url: 'rtsp://192.168.1.5:5554/front',
//   timeLimit: 86400, // time in seconds for each segmented video file - 86400s = a day
//   folder: '/run/user/1000/gvfs/google-drive:host=gmail.com,user=lambiengcode/1TqmLimLgYD_D-Tt88YVTMJfUQviE1kU7', //custom your file path to store video
//   name: 'cam1',
//   directoryPathFormat: 'MMM-D-YYYY',
//   fileNameFormat: 'M-D-Y-HH-mm-ss',
// })

// rec.startRecording()

//link: 'rtsp://admin:phamduong1986@192.168.0.100:554/cam/realmonitor?channel=1&subtype=0'

var rec1 = new Recorder({
  url: 'rtsp://172.16.8.38:5554/front',
  timeLimit: 86400, // time in seconds for each segmented video file - 86400s = a day
  folder: './Storage', //custom your file path to store video
  name: 'cam1',
  directoryPathFormat: 'MMM-D-YYYY',
  fileNameFormat: 'M-D-Y-HH-mm-ss',
})
// var rec2 = new Recorder({
//   url: 'rtsp://admin:phamduong1986@192.168.0.100:554/cam/realmonitor?channel=2&subtype=0',
//   timeLimit: 86400, // time in seconds for each segmented video file - 86400s = a day
//   folder: './Storage', //custom your file path to store video
//   name: 'cam2',
//   directoryPathFormat: 'MMM-D-YYYY',
//   fileNameFormat: 'M-D-Y-HH-mm-ss',
// })
rec1.startRecording()
//rec2.startRecording()



//scan ip camera
process.camera = [];
onvif.startProbe().then((device_info_list) => {
  console.log(device_info_list.length + ' devices were found.');
  // Show the device name and the URL of the end point.

  const arr = [];
  device_info_list.forEach((info, x) => {
    if (x <= 5) {
      arr.push(info.xaddrs[0])
    }
  });

  //forEach to Build Each Camera
  process.camera = arr;
  arr.forEach((onCam, i) => {

    let device = new onvif.OnvifDevice({
      xaddr: onCam,
      user: 'admin',
      pass: 'phamduong1986'
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
        timeLimit: 86400, // time in seconds for each segmented video file
        folder: './Storage', //custom your file path to store video
        name: 'cam${i}',
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
  res.write(`<html>
  <body>
      <canvas id="canvas"></canvas>
  </body>
  
  <script type="text/javascript" src="./jsmpeg.min.js"></script>
  <script type="text/javascript">
      player = new JSMpeg.Player('ws://localhost:9002', {
        canvas: document.getElementById('canvas') // Canvas should be a canvas DOM element
      })	
  </script>
  </html>`)

  res.end();
})

app.listen(3000) 