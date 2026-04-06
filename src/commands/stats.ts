import { Devagotchi } from '../index';

export async function statsCommand(): Promise<void> {
  const devagotchi = new Devagotchi();
  devagotchi.stats();
}
