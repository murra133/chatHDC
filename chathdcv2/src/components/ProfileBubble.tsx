// src/components/ProfileBubble.tsx

import React, { useState } from 'react';
import userAvatar from '../assets/cat-profile.png';
import './ProfileBubble.css';

const ProfileBubble: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="profile-container" onClick={toggleDropdown}>
    <img src={userAvatar} alt="User Avatar" className="profile-bubble" ></img>
      {isDropdownOpen && (
        <div className="profile-dropdown">
          <button className="dropdown-item">Profile</button>
          <button className="dropdown-item">Logout</button>
        </div>
      )}
    </div>
  );
};

export default ProfileBubble;