import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

const STATE_FILE = path.join(os.homedir(), '.devagotchi', 'state.json');
const DASHBOARD_HTML = path.join(__dirname, '..', 'dashboard.html');
const TEMP_DIR = path.join(os.homedir(), '.devagotchi');

export async function dashboardCommand(): Promise<void> {
  if (!fs.existsSync(STATE_FILE)) {
    console.log('No pet found. Run /devagotchi first to hatch one!');
    return;
  }

  const state = fs.readFileSync(STATE_FILE, 'utf8');
  const html = fs.readFileSync(DASHBOARD_HTML, 'utf8');

  // Inject state directly into the HTML so it loads instantly
  const injected = html.replace(
    'tryLoad();',
    `try { render(${state}); } catch(e) { tryLoad(); }`
  );

  // Write temp file and open it
  const tempFile = path.join(TEMP_DIR, 'dashboard.html');
  fs.writeFileSync(tempFile, injected);

  const platform = os.platform();
  try {
    if (platform === 'darwin') {
      execSync(`open "${tempFile}"`);
    } else if (platform === 'win32') {
      execSync(`start "" "${tempFile}"`);
    } else {
      execSync(`xdg-open "${tempFile}"`);
    }
    console.log('🌐 Dashboard opened in your browser!');
  } catch (e) {
    console.log(`Open this file in your browser:\n${tempFile}`);
  }
}
