// src/components/Message.tsx

import React from 'react';
import './Message.css';

type MessageProps = {
  message: string;
  sender: 'user' | 'assistant';
};

const Message: React.FC<MessageProps> = ({ message, sender }) => {
  return (
    <div className={`message ${sender}`}>
      <div dangerouslySetInnerHTML={{__html : message}}/>
    </div>
  );
};

export default Message;