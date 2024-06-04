const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const net = require("net");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    const { action, payload } = JSON.parse(message);

    if (action === "startProxy") {
      const { targetHost, targetPort } = payload;

      const proxy = net.createConnection(
        { host: targetHost, port: targetPort },
        () => {
          console.log(`Connected to ${targetHost}:${targetPort}`);
        }
      );

      proxy.on("data", (data) => {
        ws.send(data);
      });

      ws.on("message", (message) => {
        const { action, payload } = JSON.parse(message);
        if (action === "data") {
          proxy.write(Buffer.from(payload));
        }
      });

      proxy.on("close", () => {
        console.log(`Disconnected from ${targetHost}:${targetPort}`);
        ws.close();
      });

      ws.on("close", () => {
        console.log("WebSocket connection closed");
        proxy.end();
      });
    }
  });

  ws.send(JSON.stringify({ action: "connected" }));
});

app.get("/", (req, res) => {
  res.send("Wenn Mark Recopelacion VPN Server");
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
