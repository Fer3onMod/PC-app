/**
 * GitHub Auto-Update Service for Top Security Windows App
 * Repository: Fer3onMod/PC-app
 */

export interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

export interface ReleaseInfo {
  version: string;
  tagName: string;
  title: string;
  notes: string;
  publishedAt: string;
  htmlUrl: string;
  setupUrl?: string;
  portableUrl?: string;
  assets: GitHubAsset[];
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestRelease?: ReleaseInfo;
  error?: string;
}

export const APP_CURRENT_VERSION = '1.0.0';
export const GITHUB_REPO = 'Fer3onMod/PC-app';

/**
 * Extract semantic numbers from strings like "v1.0.1", "Top Security 1.0.1", "1.0.2"
 */
export function extractVersion(str: string): string {
  if (!str) return '0.0.0';
  const match = str.match(/\d+(\.\d+)+/);
  if (match) return match[0];
  const single = str.match(/\d+/);
  return single ? single[0] : str.replace(/^v/i, '').trim();
}

/**
 * Compare two semver-like strings (e.g. "1.0.1" vs "1.0.0")
 * returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareVersions(v1: string, v2: string): number {
  const s1 = extractVersion(v1);
  const s2 = extractVersion(v2);

  const parts1 = s1.split('.').map((n) => parseInt(n, 10) || 0);
  const parts2 = s2.split('.').map((n) => parseInt(n, 10) || 0);
  const maxLen = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLen; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

/**
 * Check GitHub for latest release with multi-stage fallback and cache busting
 */
export async function checkForGitHubUpdate(
  currentVersion = APP_CURRENT_VERSION,
  repo = GITHUB_REPO,
  token?: string
): Promise<UpdateCheckResult> {
  const cleanRepo = repo.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\/$/, '');
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
  };

  if (token && token.trim()) {
    headers['Authorization'] = `token ${token.trim()}`;
  }

  try {
    let releaseData: any = null;

    // 1. Try /releases/latest first (with cache buster)
    const latestRes = await fetch(
      `https://api.github.com/repos/${cleanRepo}/releases/latest?_ts=${Date.now()}`,
      { headers }
    );

    if (latestRes.ok) {
      releaseData = await latestRes.json();
    } else {
      // 2. Fallback: Query all releases (in case release was published but not marked as 'latest')
      const listRes = await fetch(
        `https://api.github.com/repos/${cleanRepo}/releases?per_page=5&_ts=${Date.now()}`,
        { headers }
      );

      if (listRes.ok) {
        const listData = await listRes.json();
        if (Array.isArray(listData) && listData.length > 0) {
          releaseData = listData[0];
        }
      }

      // 3. Fallback: Query tags directly (in case user pushed tags like v1.0.1 without a release object)
      if (!releaseData) {
        const tagsRes = await fetch(
          `https://api.github.com/repos/${cleanRepo}/tags?per_page=5&_ts=${Date.now()}`,
          { headers }
        );

        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          if (Array.isArray(tagsData) && tagsData.length > 0) {
            const latestTag = tagsData[0];
            releaseData = {
              tag_name: latestTag.name,
              name: `تحديث ${latestTag.name}`,
              body: 'تم العثور على إصدار وتاج جديد على GitHub.',
              html_url: `https://github.com/${cleanRepo}/releases`,
              assets: [],
            };
          }
        } else if (latestRes.status === 404) {
          return {
            hasUpdate: false,
            currentVersion,
            error: 'لا توجد تحديثات جديدة منشورة حالياً، أنت تستخدم أحدث إصدار.',
          };
        }
      }
    }

    if (!releaseData) {
      return {
        hasUpdate: false,
        currentVersion,
        error: 'أنت تستخدم أحدث إصدار متوفر من البرنامج حالياً.',
      };
    }

    const tagName = releaseData.tag_name || releaseData.name || '';
    const releaseVersion = extractVersion(tagName) || extractVersion(releaseData.name || '');

    const assets: GitHubAsset[] = (releaseData.assets || []).map((a: any) => ({
      name: a.name,
      browser_download_url: a.browser_download_url,
      size: a.size,
    }));

    const setupAsset =
      assets.find(
        (a) =>
          a.name.toLowerCase().includes('setup') &&
          a.name.toLowerCase().endsWith('.exe')
      ) || assets.find((a) => a.name.toLowerCase().endsWith('.exe'));

    const portableAsset = assets.find(
      (a) =>
        a.name.toLowerCase().includes('portable') &&
        a.name.toLowerCase().endsWith('.exe')
    );

    // Guaranteed direct download links for the executables
    const directSetupUrl = setupAsset?.browser_download_url ||
      `https://github.com/${cleanRepo}/releases/download/${tagName}/TopSecurity-Setup-${releaseVersion}.exe`;
    const directPortableUrl = portableAsset?.browser_download_url ||
      `https://github.com/${cleanRepo}/releases/download/${tagName}/TopSecurity-Portable-${releaseVersion}.exe`;

    const latestRelease: ReleaseInfo = {
      version: releaseVersion,
      tagName: tagName || `v${releaseVersion}`,
      title: releaseData.name || `تحديث الإصدار ${releaseVersion}`,
      notes: releaseData.body || 'تم تحسين وتحديث أداء وميزات البرنامج بنجاح.',
      publishedAt: releaseData.published_at
        ? new Date(releaseData.published_at).toLocaleDateString('ar-EG')
        : '',
      htmlUrl: releaseData.html_url || directSetupUrl,
      setupUrl: directSetupUrl,
      portableUrl: directPortableUrl,
      assets,
    };

    const hasUpdate = compareVersions(releaseVersion, currentVersion) > 0;

    return {
      hasUpdate,
      currentVersion,
      latestRelease,
    };
  } catch (err: any) {
    return {
      hasUpdate: false,
      currentVersion,
      error: 'تعذر الاتصال بخادم التحديثات حالياً، يرجى المحاولة لاحقاً.',
    };
  }
}

/**
 * Open external URL or trigger direct in-app download
 */
export function openDownloadUrl(url: string, filename?: string) {
  if (!url) return;
  if ((window as any).electronAPI?.openExternal) {
    (window as any).electronAPI.openExternal(url);
  } else {
    const a = document.createElement('a');
    a.href = url;
    if (filename) {
      a.download = filename;
    }
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
