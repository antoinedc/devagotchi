import { Devagotchi } from '../index';

export async function showCommand(): Promise<void> {
  const devagotchi = new Devagotchi();
  await devagotchi.show();
}
