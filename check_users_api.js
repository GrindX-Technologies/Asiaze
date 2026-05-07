const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`curl -s http://localhost:5000/api/users`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('close', () => {
      console.log("USERS API RESPONSE: ", out);
      conn.end();
    }).on('data', (data) => {
      out += data;
    });
  });
}).connect({
  host: '31.97.235.120',
  port: 22,
  username: 'root',
  password: 'SagnikGX@2002'
});