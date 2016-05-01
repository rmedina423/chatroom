var Chat = function (socket) {
	this.socket = socket;
};

Chat.prototype.sendMessages = function (room, text) {
	var message = {
		room: room,
		text: text
	};

	this.socket.emit('message', message);
};

Chat.prototype.changeRoom = function (room) {
	this.socket.emit('join', {
		newRoom: room
	});
};

Chat.prototype.processCommand = function (command) {
	var words = command.split(' ');

	// Parse command from first word
	var command = words[0].substring(1, words[0].length).toLowerCase();
	var message = false;

	switch(command) {

		case 'join':
			words.shift();
			var room = words.join(' ');

			// Handle room changing/creating
			this.changeRoom(room);
			break;

		case 'nick':
			words.shift();
			var name = words.join();

			// Handle name-change attempts
			this.socket.emit('nameAttempt', name);
			break;

		default:

			// Return error message if command isn't recognized
			message = 'Unrecognized command.';
			break
	}

	return message;
}

function divEscapeContentElement(message) {
	return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
	return $('<div></div>').html('<li>' + message + '</li>');
}