'use client';

import { useState, useEffect } from 'react';
import { githubService, GitHubRelease } from '@/lib/github';
import { DOWNLOAD_CONFIG, DynamicReleaseData, mergeReleaseData } from '@/config/downloads';

export function useLatestRelease() {
  const [release, setRelease] = useState<GitHubRelease | null>(null);
  const [dynamicData, setDynamicData] = useState<DynamicReleaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRelease() {
      try {
        setLoading(true);
        setError(null);

        const latestRelease = await githubService.getLatestRelease();
        
        if (latestRelease) {
          setRelease(latestRelease);
          const extractedData = githubService.extractPlatformData(latestRelease);
          setDynamicData(extractedData);
        } else {
          // Fallback to static config if GitHub API fails or no releases found
          setDynamicData(null);
          setError('No releases found - using static download links');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch release';
        setError(errorMessage);
        // Fallback to static config
        setDynamicData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRelease();
  }, []);

  const downloadConfig = dynamicData 
    ? mergeReleaseData(dynamicData)
    : DOWNLOAD_CONFIG;

  return {
    release,
    downloadConfig,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      // Clear cache and refetch
      githubService.getLatestRelease().then((latestRelease) => {
        if (latestRelease) {
          setRelease(latestRelease);
          const extractedData = githubService.extractPlatformData(latestRelease);
          setDynamicData(extractedData);
        } else {
          setDynamicData(null);
        }
        setLoading(false);
      }).catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to fetch release');
        setDynamicData(null);
        setLoading(false);
      });
    }
  };
}
