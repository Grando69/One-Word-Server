const io = require("socket.io")();
const { initGame } = require("./game");
const { makeId, calculateNextTurn, removeNumber } = require("./utils");

const clientRooms = {};
const state = {};

io.on("connection", (client) => {
  console.log("new connection");
  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);
  client.on("next", handleNext);
  client.on("reset", handleReset);
  client.on("disconnect", handleDisconnect);

  function handleDisconnect() {
    // console.log(client.id);
    const room = clientRooms[client.id];
    if (room) {
      let players = state[room].players;
      players = removeNumber(players, client.number);
      io.sockets.in(room).emit("playerDisconnect", client.number);
      if (client.number === state[room].currentPlayer) {
        handleNext(room, state[room].currentSentence);
      } else {
        io.sockets.in(room).emit("continue", state[room]);
      }
    } else {
      return;
    }
  }

  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms[roomName];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit("unknownCode");
      return;
    } else if (numClients > 8) {
      client.emit("tooManyPlayers");
      return;
    }
    if (state[roomName].running) {
      client.emit("running");
      return;
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = numClients + 1;
    state[roomName].players.push(client.number);
    client.emit("init", client.number);
    io.sockets
      .in(roomName)
      .emit("updatePlayerCount", state[roomName].players.length);
    console.log("a player joined" + ` player number ${client.number}`);
  }

  function handleNewGame() {
    let roomName = makeId(5);
    if (roomName in Object.values(clientRooms)) {
      handleNewGame();
    }
    clientRooms[client.id] = roomName;
    client.emit("gameCode", roomName);

    client.join(roomName);
    client.number = 1;
    state[roomName] = initGame();
    client.emit("init", 1);
    console.log("new game created");
    startInterval(roomName);
  }

  function handleNext(roomname, sentence) {
    let currentplayer = state[roomname].currentPlayer;
    let players = state[roomname].players;
    if (!state[roomname].running) {
      state[roomname].running = true;
    }
    state[roomname].currentPlayer = calculateNextTurn(players, currentplayer);
    state[roomname].currentSentence = sentence;

    // console.log(state[roomname].currentSentence);

    io.sockets.in(roomname).emit("continue", state[roomname]);
  }

  function handleReset(roomName) {
    // console.log("reset");
    state[roomName].currentSentence = "";
    state[roomName].running = false;
    io.sockets.in(roomName).emit("continue", state[roomName]);
  }
  function startInterval(roomName) {
    const interval = setInterval(async () => {
      await io.sockets.in(roomName).emit("updateTime", state[roomName].endTime);
      let difference = state[roomName].endTime - Date.now();
      if (difference <= 0) {
        clearInterval(interval);
        state[roomName] = null;
        io.sockets.in(roomName).emit("end");
      }
    }, 1000);
  }
});
io.listen(8080);
