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
 * Compare two semver-like strings (e.g. "1.0.1" vs "1.0.0")
 * returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareVersions(v1: string, v2: string): number {
  const clean = (v: string) => v.replace(/^v/i, '').trim();
  const parts1 = clean(v1).split('.').map((n) => parseInt(n, 10) || 0);
  const parts2 = clean(v2).split('.').map((n) => parseInt(n, 10) || 0);
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
 * Check GitHub for latest release
 */
export async function checkForGitHubUpdate(
  currentVersion = APP_CURRENT_VERSION,
  repo = GITHUB_REPO
): Promise<UpdateCheckResult> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (res.status === 404) {
      return {
        hasUpdate: false,
        currentVersion,
        error: 'لم يتم العثور على إصدارات منشورة بعد على GitHub',
      };
    }

    if (!res.ok) {
      return {
        hasUpdate: false,
        currentVersion,
        error: `خطأ في الاتصال بـ GitHub (${res.status})`,
      };
    }

    const data = await res.json();
    const tagName = data.tag_name || data.name || '';
    const cleanVersion = tagName.replace(/^v/i, '').trim();

    const assets: GitHubAsset[] = (data.assets || []).map((a: any) => ({
      name: a.name,
      browser_download_url: a.browser_download_url,
      size: a.size,
    }));

    const setupAsset = assets.find((a) =>
      a.name.toLowerCase().includes('setup') && a.name.toLowerCase().endsWith('.exe')
    ) || assets.find((a) => a.name.toLowerCase().endsWith('.exe'));

    const portableAsset = assets.find((a) =>
      a.name.toLowerCase().includes('portable') && a.name.toLowerCase().endsWith('.exe')
    );

    const latestRelease: ReleaseInfo = {
      version: cleanVersion,
      tagName,
      title: data.name || tagName,
      notes: data.body || 'لا توجد ملاحظات تفصيلية لهذا التحديث.',
      publishedAt: data.published_at ? new Date(data.published_at).toLocaleDateString('ar-EG') : '',
      htmlUrl: data.html_url || `https://github.com/${repo}/releases`,
      setupUrl: setupAsset?.browser_download_url,
      portableUrl: portableAsset?.browser_download_url,
      assets,
    };

    const hasUpdate = compareVersions(cleanVersion, currentVersion) > 0;

    return {
      hasUpdate,
      currentVersion,
      latestRelease,
    };
  } catch (err: any) {
    return {
      hasUpdate: false,
      currentVersion,
      error: err?.message || 'تعذر الاتصال بـ GitHub للتحقق من التحديثات',
    };
  }
}

/**
 * Open external URL or trigger download
 */
export function openDownloadUrl(url: string) {
  if (!url) return;
  if ((window as any).electronAPI?.openExternal) {
    (window as any).electronAPI.openExternal(url);
  } else {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
