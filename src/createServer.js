const fs = require('fs');
const path = require('path');
const http = require('http');

function createServer() {
  return http.createServer((req, res) => {
    const reUrl = new URL(req.url, `http://${req.headers.host}`);

    // Проверка на наличие '/file/' в пути
    if (!reUrl.pathname.startsWith('/file/')) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Пожалуйста, используйте /file/ для запроса файлов.');

      return;
    }

    // Удаляем '/file/' из пути
    const requestedPath = reUrl.pathname.replace('/file/', '');
    const publicDir = path.resolve(__dirname, 'public');
    const filePath = path.join(publicDir, requestedPath);

    // Проверка на попытку обхода каталога
    if (!filePath.startsWith(publicDir)) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Неверный запрос: обход каталога не разрешен');

      return;
    }

    // Обработка запроса
    fs.promises
      .stat(filePath)
      .then((stats) => {
        if (!stats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Файл не найден');

          return;
        }

        // Определение типа контента
        const fileExtension = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';

        if (fileExtension === '.html') {
          contentType = 'text/html';
        } else if (fileExtension === '.css') {
          contentType = 'text/css';
        } else if (fileExtension === '.js') {
          contentType = 'application/javascript';
        }

        res.writeHead(200, { 'Content-Type': contentType });

        const readStream = fs.createReadStream(filePath);

        readStream.pipe(res);
      })
      .catch((error) => {
        if (error.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Файл не найден');
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Внутренняя ошибка сервера');
        }
      });
  });
}

module.exports = {
  createServer,
};
