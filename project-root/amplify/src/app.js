console.log('Hello, Serverless LLM Assistant!');

const messagesList = document.getElementById('messages');
const messageInput = document.getElementById('message-input');

function sendMessage() {
    const message = messageInput.value.trim();
    if (message === '') {
        return;
    }

    // Add message to the list
    const messageElement = document.createElement('li');
    messageElement.textContent = `You: ${message}`;
    messagesList.appendChild(messageElement);

    // Clear the input
    messageInput.value = '';

    // Simulate a response from the chatbot
    setTimeout(() => {
        const responseElement = document.createElement('li');
        responseElement.textContent = `Bot: I received your message: "${message}"`;
        messagesList.appendChild(responseElement);

        // Scroll to the bottom of the messages
        messagesList.scrollTop = messagesList.scrollHeight;
    }, 1000);
}

// Allow pressing Enter to send the message
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
