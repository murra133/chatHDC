// src/components/Sidebar.tsx

import React from 'react';
import './Sidebar.css';

type SidebarProps = {
  selectedModel: string;
  onSelectModel: (model: string) => void;
};

const projects = ['gpt-3.5-turbo', 'gpt-4', 'davinci', 'curie']; // Add any available models here

const Sidebar: React.FC<SidebarProps> = ({ selectedModel, onSelectModel }) => {
  return (
    <div className="sidebar">
      <div className='sidebarTop'>
        <h2>Select Model</h2>
          <ul>
            {projects.map((project) => (
              <li
                key={project}
                className={selectedModel === project ? 'selected' : ''}
                onClick={() => onSelectModel(project)}
              >
                {project}
              </li>
            ))}
          </ul>
      </div>
      <p className='sidebarWarnings'>
                    This experimental tool is <i><u>not</u></i> 100% accurate.   
                    Think of it as a lightning-fast summer intern with a library card to a limited set of information.  
                    Always cross-check the provided search results. See the FAQ for more information.                  
      </p>
    </div>
  );
};

export default Sidebar;