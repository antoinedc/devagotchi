import { Devagotchi } from '../index';

export async function trickCommand(): Promise<void> {
  const devagotchi = new Devagotchi();
  devagotchi.skill('trick');
}
