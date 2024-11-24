const fs = require('fs');
const path = require('path');
const http = require('http');

function createServer() {
  return http.createServer((req, res) => {
    const reUrl = new URL(req.url, `http://${req.headers.host}`);

    if (reUrl.pathname.includes('..')) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad request: Path traversal not allowed');

      return;
    }

    if (!reUrl.pathname.startsWith('/file/')) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Please use /file/ to request files.');

      return;
    }

    const filePath = path.resolve(
      __dirname,
      'public',
      reUrl.pathname.replace('/file/', ''),
    );

    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
      const fileExtension = path.extname(filePath).toLowerCase();
      let contentType = 'application/octet-stream';

      // Set the correct content type based on the file extension
      if (fileExtension === '.html') {
        contentType = 'text/html';
      } else if (fileExtension === '.css') {
        contentType = 'text/css';
      } else if (fileExtension === '.js') {
        contentType = 'application/javascript';
      }

      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  });
}

module.exports = {
  createServer,
};
