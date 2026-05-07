const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const localFile = '/Users/sagniksen/Desktop/ASIAZE/update_sagnik_db.js';
    const remoteFile = '/root/update_sagnik_db.js';
    sftp.fastPut(localFile, remoteFile, (err) => {
      if (err) throw err;
      conn.exec('npm install mongoose && node /root/update_sagnik_db.js', (err, stream) => {
        if (err) throw err;
        let out = '';
        stream.on('close', () => {
          console.log(out);
          conn.end();
        }).on('data', (data) => {
          out += data;
        });
      });
    });
  });
}).connect({
  host: '31.97.235.120',
  port: 22,
  username: 'root',
  password: 'SagnikGX@2002'
});