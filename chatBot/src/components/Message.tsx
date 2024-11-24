// src/components/Message.tsx

import React from 'react';
import './Message.css';
import { SourceDocumentsGroup } from './generalInterfaces';
import SourceDocument from './SourceDoucment';


type MessageProps = {
  message: string;
  sender: 'user' | 'assistant';
  SourceDocuments : SourceDocumentsGroup;
};

const Message: React.FC<MessageProps> = ({ message, sender, SourceDocuments }) => {
  return (
    <div className={`message ${sender}`}>
      <div dangerouslySetInnerHTML={{__html : message}}/>
      {/* {SourceDocuments.documents==null ? null : <SourceDocument documents={SourceDocuments.documents}/>} */}
    </div>
  );
};

export default Message;