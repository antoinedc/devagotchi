import { Devagotchi } from '../index';

export async function fortuneCommand(): Promise<void> {
  const devagotchi = new Devagotchi();
  devagotchi.skill('fortune');
}
