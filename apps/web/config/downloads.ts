// GitHub repository configuration
export const GITHUB_CONFIG = {
  owner: "the-shoaib2",
  repo: "operone",
} as const;

// Static download configuration (used as fallback)
export const DOWNLOAD_CONFIG = {
  version: "0.0.1",
  releaseDate: "December 1, 2025",
  platforms: {
    windows: {
      name: "Windows",
      description: "Windows 10 & 11 (64-bit)",
      fileName: "Operone-Setup-0.0.1.exe",
      url: "https://github.com/the-shoaib2/operone/releases/download/v0.0.1/Operone-Setup-0.0.1.exe",
      size: "125 MB",
      features: ["Windows 10/11 support", "Auto-updates", "System tray integration"],
    },
    mac: {
      name: "macOS",
      description: "macOS 12.0+ (Apple Silicon)",
      fileName: "Operone-0.0.1-arm64.dmg",
      url: "https://github.com/the-shoaib2/operone/releases/download/v0.0.1/Operone-0.0.1-arm64.dmg",
      size: "300 MB",
      features: ["Apple Silicon optimized", "Notarized by Apple", "Menu bar integration"],
    },
    linux: {
      name: "Linux",
      description: "AppImage (Universal)",
      fileName: "Operone-0.0.1.AppImage",
      url: "https://github.com/the-shoaib2/operone/releases/download/v0.0.1/Operone-0.0.1.AppImage",
      size: "112 MB",
      features: ["AppImage support", "Package manager", "System integration"],
    },
  },
} as const;

export type PlatformKey = keyof typeof DOWNLOAD_CONFIG.platforms;

export interface DynamicPlatformData {
  url?: string;
  size?: string;
  fileName?: string;
}

export interface DynamicReleaseData {
  version?: string;
  releaseDate?: string;
  platforms?: {
    windows?: DynamicPlatformData;
    mac?: DynamicPlatformData;
    linux?: DynamicPlatformData;
  };
  changelog?: string;
}

/**
 * Merge static config with dynamic release data from GitHub
 */
export function mergeReleaseData(dynamicData?: DynamicReleaseData) {
  if (!dynamicData) {
    return DOWNLOAD_CONFIG;
  }

  return {
    version: dynamicData.version || DOWNLOAD_CONFIG.version,
    releaseDate: dynamicData.releaseDate || DOWNLOAD_CONFIG.releaseDate,
    changelog: dynamicData.changelog,
    platforms: {
      windows: {
        ...DOWNLOAD_CONFIG.platforms.windows,
        ...dynamicData.platforms?.windows,
      },
      mac: {
        ...DOWNLOAD_CONFIG.platforms.mac,
        ...dynamicData.platforms?.mac,
      },
      linux: {
        ...DOWNLOAD_CONFIG.platforms.linux,
        ...dynamicData.platforms?.linux,
      },
    },
  };
}
