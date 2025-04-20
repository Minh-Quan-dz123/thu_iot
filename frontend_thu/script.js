// 1.kết nối tới server backend đang chạy 
const socket = io("https://thu-iot.onrender.com");

// 2.lắng nghe sự kiện mqtt-data từ server để xử lý nhận dữ liệu
socket.on("mqtt-data", (data) => { //sự kiện "mqtt-data" được tạo ra ở backend đó
  document.getElementById("temp").textContent = data.temperature.toFixed(2);
  document.getElementById("hum").textContent = data.humidity.toFixed(2);
});// do đối tượng có 2 thuộc tính nên phải chia ra
     //2.1 cập nhật nội dung vào phần tử HTML có id="temp" và "id=hum" (2 thằng này trong index.html đó)

// 3. gửi lệnh điều khiển relay khi nhấn rút
document.getElementById("btn-on").addEventListener("click", () => {// khi nghe thấy nhấn nút có id=btn-on
  socket.emit("relay-control", "Relay_ON");// thì front end sẽ gửi sự kiện tên là relay-control có dữ liệu là "Relay_ON"
  // ở đây là relay-control thì được định nghĩa trong front end
});
