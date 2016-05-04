var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

//set() is deprecated.

exports.listen = function (server) {

	// Start Socket.IO server, allowing it to piggy back on existing HTTP server
	io = socketio.listen(server);

	io.set('log level', 1);

	// Define how each user connection will be handled
	io.sockets.on('connection', function (socket) {

		// Assign user a guest name when they connect
		guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);

		// Place user in Lobby room when they connect
		console.log('joinRoom GETS CALLED: ');
		joinRoom(socket, 'Lobby');
		console.log('joinRoom GETS FINSIHED: ');

		// Handle user messages, name-change attempts, and room creation/changes
		handleMessageBroadcasting(socket, nickNames);
		handleNameChangeAttempts(socket, nickNames, namesUsed);
		handleRoomJoining(socket);

		// Provide user with list of occupied rooms on request
		// manager may be replaced by 'adapter'
		socket.on('rooms', function () {
			socket.emit('rooms', io.sockets.manager.rooms);
		});

		// Define cleanup for when user disconnects
		handleClientDisconnection(socket, nickNames, namesUsed);
	})
}

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {

	// Generate new guest name
	var name = 'Guest ' + guestNumber;

	// Associate guest name with client connection ID
	nickNames[socket.id] = name;

	// Let user know their guest name
	socket.emit('nameResult', {
		success: true,
		name: name
	});

	// Note that guest name is now used
	namesUsed.push(name);

	// Increment counter used to generate guest names
	return guestNumber + 1;
}

function joinRoom(socket, room) {

	// Make user join room
	socket.join(room);

	// Note that user is now in this room
	currentRoom[socket.id] = room;

	// Let user know they're now in new room
	socket.emit('joinResult', {room: room});

	// Let other users in room know that user has joined
	socket.broadcast.to(room).emit('message', {
		text: nickNames[socket.id] + ' has joined ' + room + '.'
	});


	// Determine what other users are in same room as user
	var usersInRoom = io.sockets.clients(room);

	// If other users exist, summarize who they are
	if (usersInRoom.length > 1) {

		var usersInRoomSummary = 'Users currently in ' + room + ': ';

		for (var index in usersInRoom) {

			var userSocketId = usersInRoom[index].id;

			if (userSocketId != socket.id) {

				if (index > 0) {
					usersInRoomSummary += ', ';
				}

				usersInRoomSummary += nickNames[userSocketId];
			}
		}

		usersInRoomSummary += '.';

		// Send summary of other users in the room to the user
		socket.emit('message', {text: usersInRoomSummary});
	}
}

function handleNameChangeAttempts(socket, nickNames, namesUsed) {

	// Add listener for nameAttempt events
	socket.on('nameAttempt', function (name) {

		// Don't allow nicknames to begin with 'Guest'
		if (name.indexOf('Guest') == 0) {

			socket.emit('nameResult', {
				success: false,
				message: 'Names cannot begin with "Guest".'
			});

		} else {

			// If name isn't already registered, register it
			if (namesUsed.indexOf(name) == -1) {

				var previousName = nickNames[socket.id];
				var previousNameIndex = namesUsed.indexOf(previousName);
				namesUsed.push[name];
				nickNames[socket.id] = name;

				// Remove previous name to make available to other clients
				delete namesUsed[previousNameIndex];

				socket.emit('nameResult', {
					success: true,
					name: name
				});

				socket.broadcast.to(currentRoom[socket.id]).emit('message', {
					text: previousName + ' is now known as ' + name + '.'
				});
			} else {

				// Send error to client if name is already registered
				socket.emit('nameResult', {
					success: false,
					message: 'That name is already in use.'
				})
			}
		}
	})
}

function handleMessageBroadcasting(socket) {
	socket.on('message', function (message) {
		socket.broadcast.to(message.room).emit('message', {
			text: nicknames[socket.id] + ': ' + message.text
		});
	});
}

function handleRoomJoining(socket) {
	socket.on('join', function (room) {
		socket.leave(currentRoom[socket.id]);
		joinRoom(socket, room.newRoom);
	});
}

function handleClientDisconnection(socket) {
	socket.on('disconnect', function () {
		var nameIndex = namesUsed.indexOf(namesUsed[socket.id]);
		delete namesUsed[nameIndex];
		delete nicknames[socket.id];
	})
}