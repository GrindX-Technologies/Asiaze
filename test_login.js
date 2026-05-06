const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const commands = `
curl -X POST -H "Content-Type: application/json" -d '{"email":"asiaze2025@gmail.com","password":"Asiaze@2026"}' http://localhost:5000/api/auth/login
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