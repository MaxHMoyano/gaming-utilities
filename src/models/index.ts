import { Role } from 'discord.js';

export interface Videogame {
  id?: string;
  name?: string;
  count: number;
}

export interface BotRol extends Role {
  icon: string;
  displayName: string;
}
