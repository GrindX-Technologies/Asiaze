const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const query = `mongo asiaze --eval "db.users.updateOne({email: 'sagnik.sagnik.sen2004@gmail.com'}, {\\$set: {role: 'user'}})"`;
  conn.exec(query, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('close', () => {
      console.log(out);
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