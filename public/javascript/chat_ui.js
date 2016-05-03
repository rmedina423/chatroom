function divEscapeContentElement(message) {
	return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
	return $('<div></div>').html('<li>' + message + '</li>');
}

function processUserInput(chatApp, socket) {
	var message = $('#send-message').val();
	var systemMessage;

	if (message.charAt(0) == '/') {
		systemMessage = chatApp.processCommand(message);

		if (systemMessage) {
			$('#messages').append(divSystemContentElement(systemMessage));
		}
	} else {
		chatApp.sendMessages($('#room').text(), message);

		$('#messages').append(divEscapeContentElement(systemMessage));
		$('#messages').scrollTop($('#messages').prop('scrollHeight'));
	}

	$('#send-message').val();
}