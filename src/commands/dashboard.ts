import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

const STATE_FILE = path.join(os.homedir(), '.devagotchi', 'state.json');
const DASHBOARD_HTML = path.join(__dirname, '..', 'dashboard.html');

export async function dashboardCommand(): Promise<void> {
  if (!fs.existsSync(STATE_FILE)) {
    console.log('No pet found. Run /devagotchi first to hatch one!');
    return;
  }

  const state = fs.readFileSync(STATE_FILE, 'utf8');
  const b64 = Buffer.from(state).toString('base64');
  const url = `file://${DASHBOARD_HTML}?state=${b64}`;

  // Open in default browser
  const platform = os.platform();
  try {
    if (platform === 'darwin') {
      execSync(`open "${url}"`);
    } else if (platform === 'win32') {
      execSync(`start "" "${url}"`);
    } else {
      execSync(`xdg-open "${url}"`);
    }
    console.log('🌐 Dashboard opened in your browser!');
  } catch (e) {
    console.log(`Open this URL in your browser:\n${url}`);
  }
}
