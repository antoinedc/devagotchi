import { Devagotchi } from '../index';

export async function petCommand(): Promise<void> {
  const devagotchi = new Devagotchi();
  devagotchi.pet();
}
