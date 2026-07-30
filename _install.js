const { execSync } = require('child_process');
try {
  const result = execSync('npm install --no-audit --no-fund --legacy-peer-deps', {
    cwd: __dirname,
    timeout: 900000,
    stdio: 'pipe',
    maxBuffer: 50 * 1024 * 1024,
    env: { ...process.env, NODE_OPTIONS: '--no-experimental-detect-module' }
  });
  console.log('STDOUT:', result.stdout.toString().slice(-5000));
  if (result.stderr) console.log('STDERR:', result.stderr.toString().slice(-5000));
  console.log('EXIT CODE:', result.status);
} catch (e) {
  console.log('ERROR:', e.message);
  if (e.stdout) console.log('STDOUT:', e.stdout.toString().slice(-5000));
  if (e.stderr) console.log('STDERR:', e.stderr.toString().slice(-5000));
  console.log('EXIT CODE:', e.status);
}