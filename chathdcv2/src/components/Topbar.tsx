// src/components/Topbar.tsx

import React from 'react';
import './Topbar.css';
import ProfileBubble from './ProfileBubble';

type TopbarProps = {
  title: string;
};

const Topbar: React.FC<TopbarProps> = ({ title }) => {
  return (
    <div className="topbar">
        <span className='emptySpace'></span>
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-actions">
        <ProfileBubble />

      </div>
    </div>
  );
};

export default Topbar;