// backend/server.js

// 1: khai báo thư viện
const express = require("express");// 1.1: thư viện express tạo web server
const http = require("http");      // 1.2: module HTTP của Node.js để tạo server thủ công cùng với express
const { Server } = require("socket.io");// 1.3: lớp server từ thư viện socket.io để tạo giao tiếp giứa backend và frontend
const mqtt = require("mqtt"); // 1.4: import thư viện mqtt để kết nối HiveMQ
const cors = require("cors");// 1.5 để tránh lỗi bảo mật khi frontend và backend chạy trên domain/port khác nhau


//2: thiết lập express + socket.io
const app = express();
const server = http.createServer(app);
// => tạo 1 express add, sau đó tạo server từ nó (để socket.io dùng đc)

const io = new Server(server, {
  cors: {
    origin: "*", // Cho phép mọi domain truy cập WebSocket
  }
});
// tạo 1 socket.io server gắn vào HTTP server cho phép mọi địa chỉ IP/frontend kết nối websocket tới

app.use(cors());// cho tất cả request HTTP thông thường


//3: kết nối tới MQTT broker (HiveMQ Cloud)
const mqttClient = mqtt.connect("mqtts://60294ba1a7534e358c2dc4bc7b7cc9f9.s1.eu.hivemq.cloud", {
  username: "esp8266_tuoicay",
  password: "QuanUyenVinh3tuoicay",
});

//3.1 khi kết nối thành công với MQTT thì in ra "MQTT connected"
mqttClient.on("connect", () => {
  console.log("MQTT connected"); // in ra thông báo này lên terminal
  mqttClient.subscribe("temperature_humidity");// đăng ký topic này
  mqttClient.subscribe("ON/OFF_Relay"); // đăng ký topic này
});

//3.2 khi MQTT nhận được tin nhắn 
mqttClient.on("message", (topic, message) => {
  if (topic === "temperature_humidity") { // kiểm tra có phải là topic này không
    const data = JSON.parse(message.toString()); // lấy dữ liệu về
    console.log("Received MQTT:", data); // in ra thông báo này lên terminal
    io.emit("mqtt-data", data); // gửi tới tất cả client
  }
});


//4 khi có client web kết nối tới socket.io

//4.1 mỗi khi người dùng truy cập front end qua socket.io thì in ra thông báo
io.on("connection", (socket) => {
  console.log("Web client connected"); // in ra thông báo

  // nếu front end bấm gì đó (sự kiện gửi ON/OFF)
  socket.on("relay-control", (msg) => { // lắng nghe sự kiện "relay-control" từ front end
    console.log("Received from web:", msg); // in ra thông báo
    mqttClient.publish("ON/OFF_Relay", msg); // gửi dữ liệu lên HiveMQ


  });
});

// khởi động server
server.listen(3029, () => {
  console.log("Backend server running at http://localhost:3029");
});
// server sẽ chạy trên http://localhost:3029 và lăng nghe WebSocket và xử lý
