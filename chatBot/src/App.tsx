// src/App.tsx

import React from 'react';
import ChatApp from './components/ChatApp';
import Topbar from './components/Topbar';

const App: React.FC = () => {
  return (
    <div className="App">
      <Topbar title="chatHDC" />
      <ChatApp />

    </div>
  );
};

export default App;