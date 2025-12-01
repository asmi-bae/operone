import { GITHUB_CONFIG, DynamicReleaseData } from '@/config/downloads';

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  assets: GitHubAsset[];
}

export interface GitHubAsset {
  id: number;
  name: string;
  content_type: string;
  size: number;
  browser_download_url: string;
  created_at: string;
  updated_at: string;
}

class GitHubService {
  private baseUrl = 'https://api.github.com';
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes
  private isDevelopment = process.env.NODE_ENV === 'development';

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheDuration;
  }

  private setCache<T = GitHubRelease>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCache<T = GitHubRelease>(key: string): T | null {
    const cached = this.cache.get(key);
    return (cached?.data as T) || null;
  }

  async getLatestRelease(): Promise<GitHubRelease | null> {
    const cacheKey = `latest-release-${GITHUB_CONFIG.owner}-${GITHUB_CONFIG.repo}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache<GitHubRelease>(cacheKey);
    }

    try {
      const response = await fetch('/api/github/releases', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      });
      
      if (!response.ok) {
        return null;
      }

      const release: GitHubRelease = await response.json();
      this.setCache(cacheKey, release);
      return release;
    } catch {
      return null;
    }
  }

  async getRelease(tag: string): Promise<GitHubRelease | null> {
    const cacheKey = `release-${tag}-${GITHUB_CONFIG.owner}-${GITHUB_CONFIG.repo}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCache<GitHubRelease>(cacheKey);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/releases/tags/${tag}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Operone-Download-Page',
          },
          next: { revalidate: 300 }
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const release: GitHubRelease = await response.json();
      this.setCache(cacheKey, release);
      return release;
    } catch (error) {
      console.error(`Failed to fetch release ${tag}:`, error);
      return null;
    }
  }

  extractPlatformData(release: GitHubRelease): DynamicReleaseData {
    const version = release.tag_name.startsWith('v') 
      ? release.tag_name.slice(1) 
      : release.tag_name;

    const platforms: DynamicReleaseData['platforms'] = {};
    
    // Extract platform-specific assets
    release.assets.forEach(asset => {
      const assetName = asset.name.toLowerCase();
      
      // Windows
      if (assetName.includes('.exe') && assetName.includes('setup')) {
        platforms.windows = {
          url: asset.browser_download_url,
          fileName: asset.name,
          size: this.formatFileSize(asset.size),
        };
      }
      
      // macOS ARM64
      else if (assetName.includes('.dmg') && assetName.includes('arm64')) {
        platforms.mac = {
          url: asset.browser_download_url,
          fileName: asset.name,
          size: this.formatFileSize(asset.size),
        };
      }
      
      // macOS Intel (fallback)
      else if (assetName.includes('.dmg') && !assetName.includes('arm64')) {
        if (!platforms.mac) {
          platforms.mac = {
            url: asset.browser_download_url,
            fileName: asset.name,
            size: this.formatFileSize(asset.size),
          };
        }
      }
      
      // Linux AppImage (handle both .appimage and .AppImage)
      else if (assetName.includes('.appimage') || assetName.includes('.AppImage')) {
        platforms.linux = {
          url: asset.browser_download_url,
          fileName: asset.name,
          size: this.formatFileSize(asset.size),
        };
      }
    });

    return {
      version,
      releaseDate: new Date(release.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      platforms,
      changelog: release.body,
    };
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  async getAllReleases(): Promise<GitHubRelease[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/releases?per_page=10`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Operone-Download-Page',
          },
          next: { revalidate: 600 } // Cache for 10 minutes
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const releases: GitHubRelease[] = await response.json();
      return releases;
    } catch (error) {
      console.error('Failed to fetch releases:', error);
      return [];
    }
  }
}

export const githubService = new GitHubService();
