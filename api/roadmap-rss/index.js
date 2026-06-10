const https = require('https');

const RSS_URL = 'https://www.microsoft.com/releasecommunications/api/v2/m365/rss';

function fetchWithRedirects(url, hops = 0) {
  if (hops > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AzureFunction)' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(fetchWithRedirects(res.headers.location, hops + 1));
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Upstream HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}

module.exports = async function (context) {
  try {
    const xml = await fetchWithRedirects(RSS_URL);
    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800',
      },
      body: xml,
    };
  } catch (err) {
    context.res = {
      status: 502,
      body: 'Failed to fetch RSS: ' + err.message,
    };
  }
};
