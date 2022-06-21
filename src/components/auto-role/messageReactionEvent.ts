import {
  Client,
  Guild,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from "discord.js";
import { IMessage, MessageModel } from "../../models/Message";
import { IRole } from "../../models/Role";
import { findGuildByClient } from "../../util";
import { BOT_ID } from "../../util/constants";

export const onReaction = async (
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
  client: Client,
  intention: "addition" | "remove" = "addition"
) => {
  const guild = findGuildByClient(client);
  if (user.id !== BOT_ID) {
    let dbMessage: IMessage | null = await MessageModel.findOne({
      messageId: reaction.message.id,
    });
    if (dbMessage) {
      let dbRole: IRole | undefined = dbMessage.roles.find(
        (role) => role.emoji === reaction.emoji.name
      );
      let reactedRole = await findRoleByDbRole(guild, dbRole as IRole);
      let guildUser = guild?.members.cache.get(user.id);
      if (reactedRole) {
        if (intention === "remove" && reactedRole) {
          guildUser?.roles.remove(reactedRole);
        } else {
          guildUser?.roles.add(reactedRole);
        }
      }
    }
  }
};

const findRoleByDbRole = async (guild: Guild | undefined, dbRole: IRole) => {
  return await guild?.roles.fetch(dbRole.roleId);
};
