import React, { useState } from 'react';
import Message from './Message';
import Sidebar from './Sidebar';
import './ChatApp.css';

type ChatMessage = {
  sender: 'user' | 'assistant';
  text: string;
};

const ChatApp: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-3.5-turbo');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sendMessage = async () => {
    if (!input) return;

    // Add user's message to the chat
    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput(''); // Clear the input field
    setIsLoading(true); // Show loading indicator

    // Open an EventSource to handle the streaming response
    const source = new EventSource(
      `http://127.0.0.1:5000/?query=${encodeURIComponent(input)}&store=${encodeURIComponent('OAI-550TF')}`
    );

    let assistantResponse = ''; // Accumulate assistant's response

    source.onmessage = (event) => {
      console.log('Received event:', event);
      if (event.data.trim() === '[DONE]') {
        source.close(); // Close the EventSource when the response is complete
        setIsLoading(false); // Hide loading indicator
        return;
      }

      try {
        const data = JSON.parse(event.data);
        if (data.type === 'response') {
          assistantResponse += data.data; // Append new chunk to the response

          // Update assistant's message in real-time
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            if (updatedMessages[updatedMessages.length - 1]?.sender === 'assistant') {
              // Update existing assistant message
              updatedMessages[updatedMessages.length - 1].text = assistantResponse;
            } else {
              // Add a new assistant message
              updatedMessages.push({ sender: 'assistant', text: assistantResponse });
            }
            return updatedMessages;
          });
        }
      } catch (error) {
        console.error('Error parsing event data:', error);
      }
    };

    source.onerror = () => {
      console.error('Error with EventSource');
      source.close();
      setIsLoading(false); // Hide loading indicator
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'assistant', text: 'An error occurred. Please try again.' },
      ]);
    };
  };

  return (
    <div className="chat-app">
      <Sidebar selectedModel={selectedModel} onSelectModel={setSelectedModel} />
      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <Message key={index} sender={msg.sender} message={msg.text} />
          ))}
          {isLoading && <div className="loader">...</div>}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage} disabled={isLoading}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;