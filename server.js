const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  // Normalize request path
  let safePath = req.url.split('?')[0];
  if (safePath === '/') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  // Check if file is within PUBLIC_DIR to prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      res.end('<h1>404 Not Found</h1><p>The space route you followed does not exist!</p>');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);

    // Stream the file for performance and memory efficiency
    const stream = fs.createReadStream(filePath);
    stream.on('error', (streamErr) => {
      console.error(streamErr);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Internal Server Error');
    });
    stream.pipe(res);
  });
});

// Detect Local IP Addresses
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal loopback (e.g. 127.0.0.1) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIPs();
  
  console.clear();
  console.log('=====================================================');
  console.log('🚀  SPACE MULTIPLICATION QUEST IS LAUNCHED!  🚀');
  console.log('=====================================================');
  console.log('\nTo play on this computer, open:');
  console.log(`👉 \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
  
  if (ips.length > 0) {
    console.log('\nTo play on your iPad or other devices on the same Wi-Fi:');
    ips.forEach(ip => {
      console.log(`👉 \x1b[32mhttp://${ip}:${PORT}\x1b[0m`);
    });
    console.log('\n📱 Scan the QR code or type one of the green addresses above into Safari on your iPad!');
    
    // We can print a simple instructions text box
    console.log('\n┌─────────────────────────────────────────────────────┐');
    console.log('│  Make sure your iPad is on the SAME Wi-Fi network!   │');
    console.log('└─────────────────────────────────────────────────────┘');
  } else {
    console.log('\n⚠️ No local IP addresses found. Check your Wi-Fi connection.');
  }
  console.log('\nPress Ctrl+C to shut down the server.\n');
});
