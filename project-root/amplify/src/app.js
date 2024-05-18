console.log('Hello, Serverless LLM Assistant!');

const messagesList = document.getElementById('messages');
const messageInput = document.getElementById('message-input');

async function sendMessage() {
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

    // Call the API Gateway endpoint
    try {
        const response = await fetch('https://<your-api-gateway-endpoint>', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });
        const data = await response.json();
        const responseElement = document.createElement('li');
        responseElement.textContent = `Bot: ${data.message}`;
        messagesList.appendChild(responseElement);

        // Scroll to the bottom of the messages
        messagesList.scrollTop = messagesList.scrollHeight;
    } catch (error) {
        console.error('Error calling the API:', error);
        const errorElement = document.createElement('li');
        errorElement.textContent = `Bot: Error calling the API`;
        messagesList.appendChild(errorElement);
    }
}

// Allow pressing Enter to send the message
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
