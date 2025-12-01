import React from 'react';

export interface IconProps {
  size?: number | string;
  className?: string;
  alt?: string;
}

export const ShellIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  alt = "Shell",
  ...props 
}) => {
  const imageSize = typeof size === 'string' ? parseInt(size, 10) || 24 : size;
  
  return (
    <svg width={imageSize} height={imageSize} viewBox="0 0 24 24" fill="none" className={className} aria-label={alt} {...props}>
      <path d="M4 4h16v2H4zM4 8h16v2H4zM4 12h10v2H4zM4 16h16v2H4z" fill="currentColor"/>
      <path d="M6 20h12l-1-2H7l-1 2z" fill="currentColor"/>
      <circle cx="8" cy="9" r="1" fill="currentColor"/>
      <circle cx="8" cy="13" r="1" fill="currentColor"/>
      <circle cx="8" cy="17" r="1" fill="currentColor"/>
    </svg>
  );
};

export const AgentsIcon: React.FC<IconProps> = ({ size = 24, className = '', alt = "Agents", ...props }) => {
  const imageSize = typeof size === 'string' ? parseInt(size, 10) || 24 : size;
  return (
    <svg width={imageSize} height={imageSize} viewBox="0 0 24 24" fill="none" className={className} aria-label={alt} {...props}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="19" r="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="5" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="19" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
};

export const SdbIcon: React.FC<IconProps> = ({ size = 24, className = '', alt = "SDB", ...props }) => {
  const imageSize = typeof size === 'string' ? parseInt(size, 10) || 24 : size;
  return (
    <svg width={imageSize} height={imageSize} viewBox="0 0 24 24" fill="none" className={className} aria-label={alt} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
};

export const CoreIcon: React.FC<IconProps> = ({ size = 24, className = '', alt = "Core", ...props }) => {
  const imageSize = typeof size === 'string' ? parseInt(size, 10) || 24 : size;
  return (
    <svg width={imageSize} height={imageSize} viewBox="0 0 24 24" fill="none" className={className} aria-label={alt} {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="3" fill="currentColor"/>
    </svg>
  );
};

export const FsIcon: React.FC<IconProps> = ({ size = 24, className = '', alt = "FileSystem", ...props }) => {
  const imageSize = typeof size === 'string' ? parseInt(size, 10) || 24 : size;
  return (
    <svg width={imageSize} height={imageSize} viewBox="0 0 24 24" fill="none" className={className} aria-label={alt} {...props}>
      <path d="M3 7V5a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
};

export const ThinkingIcon: React.FC<IconProps> = ({ size = 24, className = '', alt = "Thinking", ...props }) => {
  const imageSize = typeof size === 'string' ? parseInt(size, 10) || 24 : size;
  return (
    <svg width={imageSize} height={imageSize} viewBox="0 0 24 24" fill="none" className={className} aria-label={alt} {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
};

export const OperoneIcon: React.FC<IconProps> = ({ size = 24, className = '', alt = "Operone", ...props }) => {
  const imageSize = typeof size === 'string' ? parseInt(size, 10) || 24 : size;
  return (
    <svg width={imageSize} height={imageSize} viewBox="0 0 24 24" fill="none" className={className} aria-label={alt} {...props}>
      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 8v4l3 1" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
};

export const MemoryIcon: React.FC<IconProps> = ({ size = 24, className = '', alt = "Memory", ...props }) => {
  const imageSize = typeof size === 'string' ? parseInt(size, 10) || 24 : size;
  return (
    <svg width={imageSize} height={imageSize} viewBox="0 0 24 24" fill="none" className={className} aria-label={alt} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
};

export const NetworkingIcon: React.FC<IconProps> = ({ size = 24, className = '', alt = "Networking", ...props }) => {
  const imageSize = typeof size === 'string' ? parseInt(size, 10) || 24 : size;
  return (
    <svg width={imageSize} height={imageSize} viewBox="0 0 24 24" fill="none" className={className} aria-label={alt} {...props}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
      <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="19" cy="5" r="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="5" cy="19" r="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="19" cy="19" r="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 9v6M7 7l5 5M17 7l-5 5M7 17l5-5M17 17l-5-5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
};

export const PluginsIcon: React.FC<IconProps> = ({ size = 24, className = '', alt = "Plugins", ...props }) => {
  const imageSize = typeof size === 'string' ? parseInt(size, 10) || 24 : size;
  return (
    <svg width={imageSize} height={imageSize} viewBox="0 0 24 24" fill="none" className={className} aria-label={alt} {...props}>
      <path d="M12 2v6M12 18v4M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M18 12h4M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
};

export const McpIcon: React.FC<IconProps> = ({ size = 24, className = '', alt = "MCP", ...props }) => {
  const imageSize = typeof size === 'string' ? parseInt(size, 10) || 24 : size;
  return (
    <svg width={imageSize} height={imageSize} viewBox="0 0 24 24" fill="none" className={className} aria-label={alt} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
};

export const FolderIcons: React.FC<IconProps> = ({ size = 24, className = '', alt = "Folder", ...props }) => {
  const imageSize = typeof size === 'string' ? parseInt(size, 10) || 24 : size;
  return (
    <svg width={imageSize} height={imageSize} viewBox="0 0 24 24" fill="none" className={className} aria-label={alt} {...props}>
      <path d="M3 7V5a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
};

export default {
  ShellIcon,
  AgentsIcon,
  SdbIcon,
  CoreIcon,
  FsIcon,
  ThinkingIcon,
  OperoneIcon,
  MemoryIcon,
  NetworkingIcon,
  PluginsIcon,
  McpIcon,
  FolderIcons,
};