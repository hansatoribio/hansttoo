import { createServer } from 'node:http';

const server = createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3000');
  response.setHeader('Access-Control-Allow-Headers', 'apikey, authorization, cache-control, content-profile, content-type, prefer, x-client-info, x-upsert');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === 'POST' && request.url?.startsWith('/rest/v1/inquiries')) {
    request.resume();
    request.on('end', () => {
      setTimeout(() => {
        response.writeHead(201, { 'Content-Type': 'application/json' });
        response.end('{}');
      }, 600);
    });
    return;
  }

  if (request.method === 'POST' && request.url?.startsWith('/storage/v1/object/inquiry-images/uploads/')) {
    request.resume();
    request.on('end', () => {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end('{"Key":"local-test-object"}');
    });
    return;
  }

  response.writeHead(404, { 'Content-Type': 'application/json' });
  response.end('{"message":"Not found"}');
});

server.listen(54321, '127.0.0.1', () => {
  console.log('Local non-persistent Supabase test double ready');
});
