/**
 * Direct GitHub Uploader & Pusher
 * Pushes code directly to https://github.com/bharathsb04/FIT-HEALTH
 * Uses GitHub REST API Git Data endpoints (No git.exe required).
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const OWNER = 'bharathsb04';
const REPO = 'FIT-HEALTH';

function githubRequest(token, method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://api.github.com${endpoint}`);
    const body = data ? JSON.stringify(data) : null;

    const req = https.request(
      url,
      {
        method,
        headers: {
          'User-Agent': 'Fit-Health-Pusher/1.0',
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {})
        }
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const parsed = raw ? JSON.parse(raw) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`GitHub API Error ${res.statusCode} on ${endpoint}: ${parsed.message || raw}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message} (${raw})`));
          }
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function collectFiles(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    if (['_backup_pre_migration', 'node_modules', '.git', '.gemini', 'dist', 'logs', '_staging', '.vscode', '.idea', 'scratch'].includes(item)) continue;
    if (item.endsWith('.zip') || item.endsWith('.tmp') || item.endsWith('.log')) continue;
    if (item === '.env' || item === 'backend/.env' || item === 'frontend/.env' || item.endsWith('.env.local')) continue;

    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(collectFiles(fullPath, baseDir));
    } else {
      results.push({
        fullPath,
        relPath: path.relative(baseDir, fullPath).split(path.sep).join('/')
      });
    }
  }
  return results;
}

async function main() {
  const token = process.argv[2] || process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('ERROR: GitHub Personal Access Token (PAT) is required.');
    console.error('Usage: node backend/scripts/pushToGitHub.js <YOUR_GITHUB_PAT>');
    process.exit(1);
  }

  console.log(`Connecting to GitHub repository ${OWNER}/${REPO}...`);
  try {
    const repoInfo = await githubRequest(token, 'GET', `/repos/${OWNER}/${REPO}`);
    console.log(`Repository verified: ${repoInfo.full_name} (${repoInfo.visibility || 'public'})`);
  } catch (err) {
    console.error(`Failed to verify repository: ${err.message}`);
    process.exit(1);
  }

  let parentCommitSha = null;
  try {
    const ref = await githubRequest(token, 'GET', `/repos/${OWNER}/${REPO}/git/refs/heads/main`);
    parentCommitSha = ref.object.sha;
    console.log(`Found current main commit: ${parentCommitSha}`);
  } catch (e) {
    console.log('No parent commit found on main.');
  }

  const rootDir = path.resolve(__dirname, '../..');
  const files = collectFiles(rootDir);
  console.log(`Collected ${files.length} project files to upload.`);

  console.log('Uploading blobs to GitHub...');
  const treeItems = [];
  const batchSize = 5;

  for (let i = 0; i < files.length; i += batchSize) {
    const chunk = files.slice(i, i + batchSize);
    await Promise.all(
      chunk.map(async (file) => {
        const content = fs.readFileSync(file.fullPath);
        const base64 = content.toString('base64');
        const blob = await githubRequest(token, 'POST', `/repos/${OWNER}/${REPO}/git/blobs`, {
          content: base64,
          encoding: 'base64'
        });
        treeItems.push({
          path: file.relPath,
          mode: '100644',
          type: 'blob',
          sha: blob.sha
        });
      })
    );
    await new Promise((r) => setTimeout(r, 100));
    process.stdout.write(`Uploaded ${Math.min(i + batchSize, files.length)} / ${files.length} files...\r`);
  }
  console.log(`\nAll ${treeItems.length} blobs successfully created.`);

  console.log('Creating Git Tree...');
  const tree = await githubRequest(token, 'POST', `/repos/${OWNER}/${REPO}/git/trees`, {
    tree: treeItems
  });
  console.log(`Tree created: ${tree.sha}`);

  console.log('Creating Commit...');
  const commit = await githubRequest(token, 'POST', `/repos/${OWNER}/${REPO}/git/commits`, {
    message: 'Fit Health Gym Companion - Complete production release',
    tree: tree.sha,
    parents: parentCommitSha ? [parentCommitSha] : []
  });
  console.log(`Commit created: ${commit.sha}`);

  console.log('Updating branch "main"...');
  try {
    await githubRequest(token, 'PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/main`, {
      sha: commit.sha,
      force: true
    });
  } catch (err) {
    await githubRequest(token, 'POST', `/repos/${OWNER}/${REPO}/git/refs`, {
      ref: 'refs/heads/main',
      sha: commit.sha
    });
  }
  console.log('Branch "main" updated successfully!');

  console.log('Updating branch "master"...');
  try {
    await githubRequest(token, 'PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/master`, {
      sha: commit.sha,
      force: true
    });
  } catch (err) {
    await githubRequest(token, 'POST', `/repos/${OWNER}/${REPO}/git/refs`, {
      ref: 'refs/heads/master',
      sha: commit.sha
    });
  }
  console.log('Branch "master" updated successfully!');

  console.log(`\nSUCCESS: Pushed all project code to https://github.com/${OWNER}/${REPO} on branches main & master!`);
}

main().catch((err) => {
  console.error('\nPush failed:', err.message);
  process.exit(1);
});

