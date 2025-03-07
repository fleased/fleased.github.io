export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  const targetName = `${id}.zip`;

  // Get GitHub credentials from environment variables (set in your Cloudflare Pages settings)
  const GITHUB_TOKEN = env.VICTOR_GIT;
  const GITHUB_OWNER = env.VICTOR_GIT_OWNER;
  const GITHUB_REPO = env.VICTOR_GIT_NAME;

  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

  try {
    const response = await fetch(apiUrl, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Error fetching release data' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const releaseData = await response.json();
    const asset = releaseData.assets.find(a => a.name === targetName);
    if (!asset) {
      return new Response(JSON.stringify({ error: 'Asset not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ downloadUrl: asset.browser_download_url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.toString() }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
