const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec("sed -i 's/server {/server {\\n    client_max_body_size 500M;/g' /etc/nginx/sites-available/asiaze && systemctl reload nginx", (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '31.97.235.120',
  port: 22,
  username: 'root',
  password: 'SagnikGX@2002'
});
