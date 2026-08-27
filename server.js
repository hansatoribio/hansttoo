import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.resolve(currentDirectory, 'dist');
const port = Number(process.env.PORT || 8080);

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

function setSecurityHeaders(response) {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

async function resolveAsset(pathname) {
  const relativePath = decodeURIComponent(pathname).replace(/^\/+/, '');
  const candidate = path.resolve(distDirectory, relativePath);
  if (!candidate.startsWith(distDirectory + path.sep)) return null;
  try {
    const fileStat = await stat(candidate);
    if (fileStat.isFile()) return candidate;
    if (fileStat.isDirectory()) {
      const indexPath = path.join(candidate, 'index.html');
      const indexStat = await stat(indexPath);
      return indexStat.isFile() ? indexPath : null;
    }
    return null;
  } catch {
    return null;
  }
}

const server = createServer(async (request, response) => {
  setSecurityHeaders(response);
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method Not Allowed');
    return;
  }

  const pathname = new URL(request.url || '/', 'http://localhost').pathname;
  const assetPath = pathname === '/' ? null : await resolveAsset(pathname);
  const filePath = assetPath || path.join(distDirectory, 'index.html');
  const extension = path.extname(filePath).toLowerCase();

  response.setHeader('Content-Type', contentTypes.get(extension) || 'application/octet-stream');
  if (assetPath?.includes(path.sep + 'assets' + path.sep)) {
    response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (extension === '.html') {
    response.setHeader('Cache-Control', 'no-cache');
  } else {
    response.setHeader('Cache-Control', 'public, max-age=3600');
  }

  if (request.method === 'HEAD') {
    response.writeHead(200);
    response.end();
    return;
  }

  createReadStream(filePath)
    .on('error', () => {
      if (!response.headersSent) response.writeHead(500);
      response.end('Server error');
    })
    .pipe(response);
});

server.listen(port, '0.0.0.0', () => {
  console.log('Hansttoo web server running on port ' + port);
});
