const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const useChrome = args.includes('--chrome');
const useFirefox = args.includes('--firefox') || (!useChrome);

console.log('🚀 Iniciando servidor de desarrollo de Ayurami...');

const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'serve'], {
  cwd: __dirname,
  stdio: ['inherit', 'pipe', 'inherit'],
  shell: true
});

let opened = false;

child.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);

  if (!opened && (output.includes('App running at:') || output.includes('Local:'))) {
    opened = true;
    const url = 'http://localhost:8081/';
    
    if (useChrome) {
      console.log('\n✨ ¡Servidor activo! Iniciando Google Chrome con depuración remota (puerto 9222)...');
      launchChrome(url);
    } else {
      console.log('\n✨ ¡Servidor activo! Iniciando Firefox Developer Edition con servidor de depuración (puerto 6000)...');
      launchFirefoxDev(url);
    }
  }
});

function launchChrome(url) {
  let cmd = '';
  if (process.platform === 'win32') {
    const paths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    ];
    const chromePath = paths.find(p => fs.existsSync(p)) || 'chrome';
    cmd = `start "" "${chromePath}" "${url}" --remote-debugging-port=9222`;
  } else if (process.platform === 'darwin') {
    cmd = `open -a "Google Chrome" "${url}" --args --remote-debugging-port=9222`;
  } else {
    cmd = `google-chrome "${url}" --remote-debugging-port=9222`;
  }

  exec(cmd, (err) => {
    if (err) {
      console.error('⚠️ No se pudo iniciar Chrome con depuración. Abriendo navegador predeterminado...', err);
      fallbackOpen(url);
    } else {
      console.log('🎯 Google Chrome iniciado. Puerto de depuración: 9222.');
    }
  });
}

function launchFirefoxDev(url) {
  let cmd = '';
  if (process.platform === 'win32') {
    const paths = [
      'C:\\Program Files\\Firefox Developer Edition\\firefox.exe',
      'C:\\Program Files (x86)\\Firefox Developer Edition\\firefox.exe',
      'C:\\Program Files\\Mozilla Firefox\\firefox.exe'
    ];
    const firefoxPath = paths.find(p => fs.existsSync(p)) || 'firefox';
    cmd = `start "" "${firefoxPath}" "${url}" -start-debugger-server 6000`;
  } else if (process.platform === 'darwin') {
    cmd = `open -a "Firefox Developer Edition" "${url}" --args -start-debugger-server 6000`;
  } else {
    cmd = `firefox-developer-edition "${url}" -start-debugger-server 6000`;
  }

  exec(cmd, (err) => {
    if (err) {
      console.warn('⚠️ No se pudo iniciar Firefox Dev Edition. Probando con Firefox estándar...');
      const fallbackCmd = process.platform === 'win32' ? `start firefox "${url}" -start-debugger-server 6000` : `firefox "${url}" -start-debugger-server 6000`;
      exec(fallbackCmd, (err2) => {
        if (err2) {
          console.error('⚠️ No se pudo iniciar Firefox. Abriendo navegador predeterminado...', err2);
          fallbackOpen(url);
        } else {
          console.log('🎯 Firefox estándar iniciado. Puerto de depuración: 6000.');
        }
      });
    } else {
      console.log('🎯 Firefox Developer Edition iniciado. Puerto de depuración: 6000.');
    }
  });
}

function fallbackOpen(url) {
  const cmd = process.platform === 'win32' ? `start ${url}` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
  exec(cmd);
}

child.on('close', (code) => {
  console.log(`\n🛑 Servidor de desarrollo finalizado con código ${code}`);
});
