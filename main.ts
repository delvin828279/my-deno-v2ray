const UUID = "83584bae-0489-4aca-9921-a065922afc0b";

Deno.serve((req) => {
  const upgrade = req.headers.get("upgrade");
  
  if (upgrade !== "websocket") {
    return new Response("V2Ray Server is Running ✅");
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  socket.onopen = () => {
    console.log("Client connected!");
  };

  socket.onmessage = async (event) => {
    const data = new Uint8Array(await event.data.arrayBuffer());
    
    // VLESS header processing
    if (data[0] === 0) {
      const uuidBytes = data.slice(1, 17);
      const clientUUID = [...uuidBytes]
        .map(b => b.toString(16).padStart(2, '0'))
        .join('-');
      
      if (clientUUID !== UUID) {
        socket.close();
        return;
      }
    }
    
    socket.send(data);
  };

  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  return response;
});
