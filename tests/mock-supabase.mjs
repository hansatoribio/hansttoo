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
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        const inquiry = Array.isArray(parsed) ? parsed[0] : parsed;
        const attribution = {
          utm_source: inquiry?.utm_source,
          utm_medium: inquiry?.utm_medium,
          utm_campaign: inquiry?.utm_campaign,
          utm_content: inquiry?.utm_content,
          utm_term: inquiry?.utm_term,
          gclid: inquiry?.gclid,
          gbraid: inquiry?.gbraid,
          wbraid: inquiry?.wbraid,
          fbclid: inquiry?.fbclid,
          landing_path: inquiry?.landing_path,
          contains_unexpected_parameter: Object.hasOwn(inquiry || {}, 'not_allowed'),
        };
        console.log('Captured local attribution:', JSON.stringify(attribution));
      } catch {
        console.log('Captured local attribution: invalid request body');
      }
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
