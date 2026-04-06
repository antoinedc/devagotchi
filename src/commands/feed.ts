import { Devagotchi } from '../index';

export async function feedCommand(): Promise<void> {
  const devagotchi = new Devagotchi();
  await devagotchi.feed();
}
