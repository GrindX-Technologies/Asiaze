const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const commands = `
cd /var/www/asiaze/backend
node dist/server.js
  `;
  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end()).on('data', (data) => process.stdout.write(data)).stderr.on('data', (data) => process.stderr.write(data));
  });
}).connect({
  host: '31.97.235.120',
  port: 22,
  username: 'root',
  password: 'SagnikGX@2002'
});