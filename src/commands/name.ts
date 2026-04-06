import { Devagotchi } from '../index';

export async function nameCommand(newName: string): Promise<void> {
  if (!newName) {
    console.error('Please provide a name: devagotchi:name <name>');
    process.exit(1);
  }
  const devagotchi = new Devagotchi();
  devagotchi.rename(newName);
}
