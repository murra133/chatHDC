import React, { useState } from 'react';
import './Sidebar.css';
import menuSvg from '../assets/menu.svg';

type SidebarProps = {
  vectorStores: string[];
  selectedVectorStore: string;
  onSelectVectorStore: (vectorStore: string) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ vectorStores, selectedVectorStore, onSelectVectorStore }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <>
      {/* Sidebar toggle button, visible only on mobile */}
      <button className="sidebar-toggle-button" onClick={toggleSidebar}>
        <img src={menuSvg} alt="menu" style={{ width: '25px', height: '25px' }} />
      </button>
      <div className={`sidebarEmpty ${isSidebarOpen ? 'open' : 'closed'}`}></div>

      {/* Sidebar container */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebarTop">
          <h2>Select Data Set</h2>
          <ul>
            {vectorStores.map((store) => (
              <li
                key={store}
                className={selectedVectorStore === store ? 'selected' : ''}
                onClick={() => onSelectVectorStore(store)}
              >
                {store}
              </li>
            ))}
          </ul>
        </div>
        <p className="sidebarWarnings">
          This experimental tool is <i><u>not</u></i> 100% accurate. Think of it as a lightning-fast summer intern with
          a library card to a limited set of information. Always cross-check the provided search results. See the FAQ
          for more information.
        </p>
      </div>
    </>
  );
};

export default Sidebar;