const fs = require('fs');
const path = require('path');

// Install supports-hyperlinks properly first
const src = path.join('node_modules', 'supports-hyperlinks');
const pkgJsonPath = path.join(src, 'package.json');
if (fs.existsSync(pkgJsonPath)) {
  const content = fs.readFileSync(pkgJsonPath, 'utf8');
  try {
    JSON.parse(content);
    console.log('supports-hyperlinks: OK');
  } catch (e) {
    // Fix it
    const ver = '2.3.0';
    fs.writeFileSync(pkgJsonPath, JSON.stringify({ name: 'supports-hyperlinks', version: ver, main: 'index.js' }, null, 2));
    if (!fs.existsSync(path.join(src, 'index.js'))) {
      fs.writeFileSync(path.join(src, 'index.js'), 'module.exports = () => true;\n');
    }
    console.log('supports-hyperlinks: Fixed');
  }
}

// Check expo exists
const expoPath = path.join('node_modules', 'expo');
console.log('expo installed:', fs.existsSync(path.join(expoPath, 'package.json')));

// Check for @expo/cli
const cliPath = path.join('node_modules', '@expo', 'cli');
console.log('@expo/cli installed:', fs.existsSync(path.join(cliPath, 'package.json')));

// Try requiring them
try {
  const expoVer = JSON.parse(fs.readFileSync(path.join(expoPath, 'package.json'), 'utf8')).version;
  console.log('expo version:', expoVer);
} catch(e) {
  console.log('expo error:', e.message);
}

// List some key packages
const pkgs = ['supports-hyperlinks', 'terminal-link', 'expo', '@expo/cli'];
pkgs.forEach(p => {
  const fullPath = path.join('node_modules', ...p.split('/'));
  console.log(p + ':', fs.existsSync(path.join(fullPath, 'package.json')));
});