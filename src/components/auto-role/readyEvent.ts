import { Guild, Role as DiscordRole, TextChannel } from "discord.js";
import { createRoleMessage } from ".";
import { MessageModel } from "../../models/Message";
import { IRole, RoleModel } from "../../models/Role";
import {
  convertCharToEmoji,
  deleteOldMessagesFromChannel,
  getAutoRoleChannel,
  getGuildGameRoles,
} from "../../util";
import { ROLES_ORDER } from "../../util/constants";

export const onReady = async (
  guild: Guild | undefined,
  overwrite?: boolean
) => {
  if (guild) {
    const autoRoleChannel = await getAutoRoleChannel(guild);
    const gameRoles = getGuildGameRoles(guild);
    const roles = createRolesByDiscordRoles(gameRoles);
    const doMessagesAlreadyExists = await verifyExistingMessages(
      autoRoleChannel
    );
    if (roles.length && (!doMessagesAlreadyExists || overwrite)) {
      await deleteOldMessagesFromChannel(autoRoleChannel);
      let j = 0;
      for (let i = 1; i <= Math.ceil(roles.length / 20); i++) {
        let rolesToAdd: IRole[] = [];
        for (j; j < roles.length; j++) {
          rolesToAdd = [...rolesToAdd, roles[j]];
          if (20 * i - 1 === j) {
            j++;
            break;
          }
        }
        const message = await createRoleMessage(autoRoleChannel, rolesToAdd);
        await MessageModel.create({
          order: i,
          messageId: message?.id,
          roles: rolesToAdd,
          isFull: rolesToAdd.length === 20,
        });
      }
    }
  }
};

const createRolesByDiscordRoles = (roles: DiscordRole[]): IRole[] => {
  return roles?.map((role, idx) => {
    return new RoleModel({
      name: role.name.substring(2),
      roleId: role.id,
      emoji: convertCharToEmoji(ROLES_ORDER[idx % 20]),
      role: idx,
    });
  });
};

const verifyExistingMessages = async (autoRoleChannel: TextChannel) => {
  let dbExistingMessages = await MessageModel.find();
  if (!dbExistingMessages.length) {
    return false;
  }
  for (const message of dbExistingMessages) {
    try {
      let discordMessage = await autoRoleChannel.messages.fetch(
        message.messageId
      );
      if (!discordMessage) {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
  return true;
};
