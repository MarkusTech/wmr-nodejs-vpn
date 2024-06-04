const WebSocket = require("ws");
const net = require("net");

const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
  console.log("Connected to server");

  const targetHost = "58.69.151.108"; // Replace with the IP of the server to which you want to tunnel traffic
  const targetPort = 8080; // Replace with the port of the target server

  ws.send(
    JSON.stringify({
      action: "startProxy",
      payload: { targetHost, targetPort },
    })
  );

  ws.on("message", (message) => {
    const { action, payload } = JSON.parse(message);
    if (action === "data") {
      console.log("Received data from server:", Buffer.from(payload));
    }
  });

  const client = new net.Socket();
  client.connect(targetPort, targetHost, () => {
    console.log("Connected to target server");
  });

  client.on("data", (data) => {
    ws.send(
      JSON.stringify({ action: "data", payload: data.toString("base64") })
    );
  });

  client.on("close", () => {
    console.log("Target server connection closed");
    ws.close();
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    client.end();
  });
});
