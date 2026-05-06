const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    console.log('SFTP :: ready');
    
    const readStream = fs.createReadStream('seed_admin.js');
    const writeStream = sftp.createWriteStream('/var/www/asiaze/seed_admin.js');
    
    writeStream.on('close', () => {
      console.log('File transferred successfully');
      
      const commands = [
        'cd /var/www/asiaze',
        'npm install mongoose bcryptjs',
        'node seed_admin.js'
      ].join(' && ');
      
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
