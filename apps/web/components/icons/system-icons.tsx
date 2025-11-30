import * as React from 'react'
import { cn } from '@/lib/utils'

// Base Icon Props Interface
export interface SystemIconProps {
    className?: string
    width?: number
    height?: number
    strokeWidth?: number
}

// System Settings Icon
export const SystemSettingsIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Gear/cog shape with outer teeth and center circle - represents settings/configuration */}
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            {/* Center hole of the gear */}
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    )
}

// System Security Icon
export const SystemSecurityIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Shield shape with pointed top and curved bottom - represents security/protection */}
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            {/* Checkmark inside shield - indicates verified/secure status */}
            <path d="M9 12l2 2 4-4"></path>
        </svg>
    )
}

// System Network Icon
export const SystemNetworkIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            <rect x="2" y="9" width="4" height="12" rx="1"></rect>
            <rect x="10" y="5" width="4" height="16" rx="1"></rect>
            <rect x="18" y="2" width="4" height="19" rx="1"></rect>
        </svg>
    )
}

// System Database Icon
export const SystemDatabaseIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
        </svg>
    )
}

// System Cloud Icon
export const SystemCloudIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Cloud shape with curved bottom - represents cloud storage/services */}
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
        </svg>
    )
}

// System Server Icon
export const SystemServerIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Top server rack with indicator light */}
            <rect x="2" y="3" width="20" height="4" rx="1"></rect>
            {/* Middle server rack with indicator light */}
            <rect x="2" y="9" width="20" height="4" rx="1"></rect>
            {/* Bottom server rack with indicator light */}
            <rect x="2" y="15" width="20" height="4" rx="1"></rect>
            {/* Server status indicator lights */}
            <line x1="6" y1="5" x2="6.01" y2="5"></line>
            <line x1="6" y1="11" x2="6.01" y2="11"></line>
            <line x1="6" y1="17" x2="6.01" y2="17"></line>
        </svg>
    )
}

// System Terminal Icon
export const SystemTerminalIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={512}
    viewBox="0 0 384 384"
    height={512}
    
  >
    <defs>
      <filter x="0%" y="0%" width="100%" height="100%" id="a">
        <feColorMatrix
          values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
          colorInterpolationFilters="sRGB"
        />
      </filter>
      <filter x="0%" y="0%" width="100%" height="100%" id="b">
        <feColorMatrix
          values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0.2126 0.7152 0.0722 0 0"
          colorInterpolationFilters="sRGB"
        />
      </filter>
      <mask id="c">
        <g filter="url(#a)">
          <g filter="url(#b)" transform="scale(.75)">
            <image
              width={512}
              xlinkHref="data:image/png;base64,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"
              height={512}
            />
          </g>
        </g>
      </mask>
    </defs>
    <g mask="url(#c)">
      <image
        width={512}
        xlinkHref="data:image/png;base64,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"
        height={512}
        transform="scale(.75)"
      />
    </g>
  </svg>
    )
}

// System Code Icon
export const SystemCodeIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Right pointing chevron - represents code/programming */}
            <polyline points="16 18 22 12 16 6"></polyline>
            {/* Left pointing chevron - completes code brackets symbol */}
            <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
    )
}

// System Package Icon
export const SystemPackageIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Diagonal line showing package depth */}
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
            {/* Main 3D box shape - represents package/container */}
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            {/* Top edges of 3D box */}
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            {/* Vertical edge showing 3D depth */}
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
    )
}

// System Monitor Icon
export const SystemMonitorIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Main monitor screen */}
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            {/* Monitor stand base */}
            <line x1="8" y1="21" x2="16" y2="21"></line>
            {/* Monitor stand pole */}
            <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
    )
}

// System Hard Drive Icon
export const SystemHardDriveIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Main hard drive body */}
            <rect x="1" y="8" width="22" height="8" rx="2" ry="2"></rect>
            {/* Hard drive activity light strip */}
            <rect x="5" y="11" width="14" height="2" rx="1" ry="1"></rect>
            {/* Power/activity indicator LED */}
            <circle cx="18" cy="12" r="1"></circle>
        </svg>
    )
}

// System Memory Icon
export const SystemMemoryIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Main memory chip outline */}
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            {/* Left vertical connection pins */}
            <line x1="9" y1="4" x2="9" y2="20"></line>
            {/* Right vertical connection pins */}
            <line x1="15" y1="4" x2="15" y2="20"></line>
            {/* Top horizontal connection traces */}
            <line x1="4" y1="9" x2="20" y2="9"></line>
            {/* Bottom horizontal connection traces */}
            <line x1="4" y1="15" x2="20" y2="15"></line>
        </svg>
    )
}

// System CPU Icon
export const SystemCPUIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Main CPU chip outline */}
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            {/* CPU core/die in center */}
            <rect x="9" y="9" width="6" height="6"></rect>
            {/* Top connection pins */}
            <line x1="9" y1="1" x2="9" y2="4"></line>
            <line x1="15" y1="1" x2="15" y2="4"></line>
            {/* Bottom connection pins */}
            <line x1="9" y1="20" x2="9" y2="23"></line>
            <line x1="15" y1="20" x2="15" y2="23"></line>
            {/* Right side connection pins */}
            <line x1="20" y1="9" x2="23" y2="9"></line>
            <line x1="20" y1="14" x2="23" y2="14"></line>
            {/* Left side connection pins */}
            <line x1="1" y1="9" x2="4" y2="9"></line>
            <line x1="1" y1="14" x2="4" y2="14"></line>
        </svg>
    )
}

// System Zap Icon (Power/Energy)
export const SystemZapIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Lightning bolt shape - represents power/electrical energy */}
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
    )
}

// System Thermometer Icon
export const SystemThermometerIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Thermometer shape with bulb at bottom - represents temperature monitoring */}
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
        </svg>
    )
}

// System Activity Icon
export const SystemActivityIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* ECG/heartbeat waveform - represents system activity/monitoring */}
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
    )
}

// System Download Icon
export const SystemDownloadIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Download container/base */}
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            {/* Downward arrow - indicates download direction */}
            <polyline points="7 10 12 15 17 10"></polyline>
            {/* Arrow shaft */}
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
    )
}

// System Upload Icon
export const SystemUploadIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Upload container/base */}
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            {/* Upward arrow - indicates upload direction */}
            <polyline points="17 8 12 3 7 8"></polyline>
            {/* Arrow shaft */}
            <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
    )
}

// System Refresh Icon
export const SystemRefreshIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Top right curved arrow - represents refresh cycle */}
            <polyline points="23 4 23 10 17 10"></polyline>
            {/* Bottom left curved arrow - completes refresh cycle */}
            <polyline points="1 20 1 14 7 14"></polyline>
            {/* Connecting curved paths forming circular refresh motion */}
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
    )
}

// System Trash Icon
export const SystemTrashIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Top lid of trash can */}
            <polyline points="3 6 5 6 21 6"></polyline>
            {/* Main trash can body */}
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            {/* Left vertical deletion lines */}
            <line x1="10" y1="11" x2="10" y2="17"></line>
            {/* Right vertical deletion lines */}
            <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
    )
}

// System Folder Icon
export const SystemFolderIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
    )
}

// System File Icon
export const SystemFileIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Main document body */}
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            {/* Folded corner of document */}
            <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
    )
}

// System Search Icon
export const SystemSearchIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Magnifying glass circle */}
            <circle cx="11" cy="11" r="8"></circle>
            {/* Magnifying glass handle */}
            <path d="m21 21-4.35-4.35"></path>
        </svg>
    )
}

// System Bell Icon
export const SystemBellIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Bell body shape */}
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            {/* Bell clapper */}
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
    )
}

// System User Icon
export const SystemUserIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* User torso/body */}
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            {/* User head circle */}
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    )
}

// System Mail Icon
export const SystemMailIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Mail envelope body */}
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            {/* Mail envelope flap lines */}
            <path d="m22 7-10 5L2 7"></path>
        </svg>
    )
}

// System Calendar Icon
export const SystemCalendarIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Main calendar body */}
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            {/* Right page tear-off line */}
            <line x1="16" y1="2" x2="16" y2="6"></line>
            {/* Left page tear-off line */}
            <line x1="8" y1="2" x2="8" y2="6"></line>
            {/* Horizontal divider between header and days */}
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
    )
}

// System Clock Icon
export const SystemClockIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Clock outer circle */}
            <circle cx="12" cy="12" r="10"></circle>
            {/* Clock hands showing time */}
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
    )
}

// System Info Icon
export const SystemInfoIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Info circle outline */}
            <circle cx="12" cy="12" r="10"></circle>
            {/* Vertical line of 'i' character */}
            <line x1="12" y1="16" x2="12" y2="12"></line>
            {/* Dot of 'i' character */}
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
    )
}

// System Alert Icon
export const SystemAlertIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Triangle warning shape */}
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            {/* Exclamation mark vertical line */}
            <line x1="12" y1="9" x2="12" y2="13"></line>
            {/* Exclamation mark dot */}
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
    )
}

// System Check Icon
export const SystemCheckIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Checkmark shape - represents success/completion */}
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    )
}

// System X Icon (Close/Cancel)
export const SystemXIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* First diagonal line of X */}
            <line x1="18" y1="6" x2="6" y2="18"></line>
            {/* Second diagonal line of X */}
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    )
}

// System Plus Icon
export const SystemPlusIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Vertical line of plus sign */}
            <line x1="12" y1="5" x2="12" y2="19"></line>
            {/* Horizontal line of plus sign */}
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    )
}

// System Minus Icon
export const SystemMinusIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Horizontal line of minus sign */}
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    )
}

// Export all icons for easy importing
export const SystemIcons = {
    Settings: SystemSettingsIcon,
    Security: SystemSecurityIcon,
    Network: SystemNetworkIcon,
    Database: SystemDatabaseIcon,
    Cloud: SystemCloudIcon,
    Server: SystemServerIcon,
    Terminal: SystemTerminalIcon,
    Code: SystemCodeIcon,
    Package: SystemPackageIcon,
    Monitor: SystemMonitorIcon,
    HardDrive: SystemHardDriveIcon,
    Memory: SystemMemoryIcon,
    CPU: SystemCPUIcon,
    Zap: SystemZapIcon,
    Thermometer: SystemThermometerIcon,
    Activity: SystemActivityIcon,
    Download: SystemDownloadIcon,
    Upload: SystemUploadIcon,
    Refresh: SystemRefreshIcon,
    Trash: SystemTrashIcon,
    Folder: SystemFolderIcon,
    File: SystemFileIcon,
    Search: SystemSearchIcon,
    Bell: SystemBellIcon,
    User: SystemUserIcon,
    Mail: SystemMailIcon,
    Calendar: SystemCalendarIcon,
    Clock: SystemClockIcon,
    Info: SystemInfoIcon,
    Alert: SystemAlertIcon,
    Check: SystemCheckIcon,
    X: SystemXIcon,
    Plus: SystemPlusIcon,
    Minus: SystemMinusIcon,
}

// Folder Icon Components (used in animated-beam-section)
export const AgentsIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Folder shape - represents agents/organization */}
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
    )
}

export const AIIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Center circle - represents AI core/brain */}
            <circle cx="12" cy="12" r="3"></circle>
            {/* Radiating lines - represents AI thinking/neural network */}
            <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 9.96l4.24 4.24M20.46 14.04l-4.24 4.24M7.78 1.76L3.54 6"></path>
        </svg>
    )
}

export const CoreIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Outer square - represents core system/component */}
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            {/* Inner square - represents central processing unit */}
            <rect x="9" y="9" width="6" height="6"></rect>
        </svg>
    )
}

export const ThinkingIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Plus sign in circle - represents thinking/processing */}
            <path d="M9 12h6m-3-3v6"></path>
            {/* Circle outline - contains thinking process */}
            <circle cx="12" cy="12" r="10"></circle>
        </svg>
    )
}

export const MemoryIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Main memory chip outline */}
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            {/* Left vertical connection pins */}
            <line x1="9" y1="4" x2="9" y2="20"></line>
            {/* Right vertical connection pins */}
            <line x1="15" y1="4" x2="15" y2="20"></line>
        </svg>
    )
}

export const SDBIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Top ellipse of cylinder - represents structured database */}
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            {/* Middle ring of cylinder - shows data layer */}
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            {/* Side curves and bottom ellipse - completes database cylinder */}
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
        </svg>
    )
}

export const FSIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Folder shape - represents file system storage */}
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
    )
}

export const ShellIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Terminal prompt arrow (>) - represents shell/command line */}
            <polyline points="4 17 10 11 4 5"></polyline>
            {/* Cursor line in terminal */}
            <line x1="12" y1="19" x2="20" y2="19"></line>
        </svg>
    )
}

export const NetworkingIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Three vertical bars of increasing height - represents network connectivity */}
            <rect x="2" y="9" width="4" height="12" rx="1"></rect>
            <rect x="10" y="5" width="4" height="16" rx="1"></rect>
            <rect x="18" y="2" width="4" height="19" rx="1"></rect>
        </svg>
    )
}

export const MCPIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Gear/cog shape with outer teeth - represents MCP configuration/control */}
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            {/* Center hole of gear */}
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    )
}

export const PluginsIcon: React.FC<SystemIconProps> = ({
    className = '',
    width = 24,
    height = 24,
    strokeWidth = 2,
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('lucide-icon', className)}
        >
            {/* Star shape - represents plugins/add-ons */}
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
        </svg>
    )
}

// Icon component mapping for easy access
export const FolderIcons = {
    agents: AgentsIcon,
    ai: AIIcon,
    core: CoreIcon,
    thinking: ThinkingIcon,
    memory: MemoryIcon,
    sdb: SDBIcon,
    fs: FSIcon,
    shell: ShellIcon,
    networking: NetworkingIcon,
    mcp: MCPIcon,
    plugins: PluginsIcon,
}