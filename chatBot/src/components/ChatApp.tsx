import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import Sidebar from './Sidebar';
import './ChatApp.css';
import axios from 'axios';
import sendSVG from '../assets/send.svg';
import LoadingSpinner from './loadingSpinner';
import { SourceDocumentsGroup } from './generalInterfaces';
import SourceDocuments from './SourceDoucment';

type ChatMessage = {
  sender: 'user' | 'assistant';
  text: string;
};


const ChatApp: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sourceDocuments, setSourceDocuments] = useState<SourceDocumentsGroup[]>([]);
  const [input, setInput] = useState<string>('');
  const [selectedVectorStore, setSelectedVectorStore] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [vectorStores, setVectorStores] = useState<string[]>([]);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef<boolean>(true);
  const email = 'murrayb@hdcco.com';
  const server = 'http://127.0.0.1:5000'

  useEffect(() => {

    const fetchVectorStores = async () => {
      axios.request({
        method: 'GET',
        url: `${server}/vector_stores`,
        params: {
          email: email
        }
      }).then((response) => {
      const data = response.data;
      setVectorStores(data.vectorStores);
      setSelectedVectorStore(data.vectorStores[0]);
      }).catch((error) => {
        console.error('Error fetching vector stores:', error);
      })
    };
    fetchVectorStores();

    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollHeight, scrollTop, clientHeight } = containerRef.current;
        const isBottom = scrollHeight - scrollTop - 20 <= clientHeight;
        shouldScrollRef.current = (isBottom);
      }
    };
    const container = containerRef.current;
    if (containerRef.current) {

      containerRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollWithMessage = () => {
    if(!shouldScrollRef.current) return;
    messageEndRef.current?.scrollIntoView({behavior: "smooth"});
  };

  useEffect(() => {
    scrollWithMessage();
  },[messages]);

  const sendMessage = async () => {
    if (!input) return;
    shouldScrollRef.current = true;
    scrollWithMessage();

    // Add user's message to the chat
    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setSourceDocuments(prevState => [...prevState, {documents:null}]);
    setInput(''); // Clear the input field
    setIsLoading(true); // Show loading indicator

    // Open an EventSource to handle the streaming response
    const source = new EventSource(
      `${server}/?query=${encodeURIComponent(input)}&store=${encodeURIComponent(selectedVectorStore)}&email=${encodeURIComponent(email)}`
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
        if(data.type === 'source_documents'){
          setSourceDocuments(prevState => [...prevState, {documents : data.data}]);
          return;
        };
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
      <Sidebar vectorStores={vectorStores} selectedVectorStore={selectedVectorStore} onSelectVectorStore={setSelectedVectorStore} />
      <div className="chat-container" >
        <div className="messages" ref={containerRef}>
          {messages.map((msg, index) => (
            <Message key={index} message={msg.text} sender={msg.sender} SourceDocuments={sourceDocuments[index]} />
          ))}
          {isLoading && <div className="loader">AI is Thinking...</div>}
          <div ref={messageEndRef} />
        </div>
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
          />
          <button className={isLoading?"buttonLoading":''} onClick={sendMessage} disabled={isLoading}>
            {isLoading?<LoadingSpinner/>:<img src={sendSVG} alt="Send" style={{ width: '20px', height: '20px' }}/>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;