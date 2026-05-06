const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    console.log('SFTP :: ready');
    
    // We upload BOTH admin-cms and backend
    const commands = [
      'cd /var/www/asiaze',
      'tar -xzf deployment.tar.gz',
      'cd backend && npm install && npm run build && pm2 restart asiaze-backend',
      'cd ../admin-cms && npm install && npm run build && pm2 restart asiaze-admin'
    ].join(' && ');
    
    const readStream = fs.createReadStream('deployment.tar.gz');
    const writeStream = sftp.createWriteStream('/var/www/asiaze/deployment.tar.gz');
    
    writeStream.on('close', () => {
      console.log('Tarball transferred successfully');
      
      console.log('Executing commands...');
      conn.exec(commands, (err, execStream) => {
        if (err) throw err;
        execStream.on('close', (code, signal) => {
          console.log('Commands finished with code ' + code);
          conn.end();
        }).on('data', (data) => {
          process.stdout.write(data);
        }).stderr.on('data', (data) => {
          process.stderr.write(data);
        });
      });
      
    });
    readStream.pipe(writeStream);
  });
}).connect({
  host: '31.97.235.120',
  port: 22,
  username: 'root',
  password: 'SagnikGX@2002',
  readyTimeout: 60000
});
