"use strict";

const {
  loadUserConfig,
  ServerConfig,
} = require("./config.js");
const { PluginLogger } = require("./logger.js");

function stripIrcFormatting(message) {
  return message.replace(
    /[\x02\x0F\x16\x1D\x1F]|(?:\x03(?:\d{1,2}(?:,\d{1,2})?)?)/g,
    "",
  );
}

function createHandler(client, network) {
  return async (data) => {
    // Ignore own messages
    if (network.nick.toLowerCase() === data.nick.toLowerCase()) {
      return;
    }

    const isPM = data.target.toLowerCase() === network.nick.toLowerCase();

    const channel = isPM
      ? network.channels.find(
          (chan) => chan.name.toLowerCase() === data.nick.toLowerCase(),
        )
      : network.channels.find(
          (chan) => chan.name.toLowerCase() === data.target.toLowerCase(),
        );

    if (channel && channel.muted) {
      return;
    }

    const message = data.message || "";
    const cleanMessage = stripIrcFormatting(message);

    let notify = isPM;

    if (!notify && network.highlightRegex) {
      notify = network.highlightRegex.test(message);
    }

    if (!notify && client.client.highlightRegex) {
      notify = client.client.highlightRegex.test(cleanMessage);
    }

    if (notify && client.client.highlightExceptionRegex) {
      notify = !client.client.highlightExceptionRegex.test(cleanMessage);
    }

    if (!notify) {
      return;
    }

    let channelUrl = null;

    try {
      channelUrl = ServerConfig.get().baseUrl && channel
        ? new URL(`/#/chan-${channel.id}`, ServerConfig.get().baseUrl)
        : null;
    } catch (error) {
      PluginLogger.error(
        `Failed to construct channel URL for notification: ${error.message}`,
      );
      PluginLogger.debug(
        `Payload: ${JSON.stringify({ ...data, message: "[REDACTED]" })}`,
      );
      PluginLogger.debug(
        `Channels: ${JSON.stringify(network.channels.map(({ messages, ...rest }) => rest))}`,
      );
    }

    try {
      const [userConfig, errors] = loadUserConfig(client.client.name);

      if (errors.length > 0) {
        return;
      }

      let ntfyAuth;

      if (userConfig.ntfy.token) {
        ntfyAuth = {
          username: "",
          password: userConfig.ntfy.token,
        };
      } else if (userConfig.ntfy.username && userConfig.ntfy.password) {
        ntfyAuth = {
          username: userConfig.ntfy.username,
          password: userConfig.ntfy.password,
        };
      }

      const { NtfyClient } = await import("ntfy");

      const ntfyClient = new NtfyClient({
        server: userConfig.ntfy.server,
        topic: userConfig.ntfy.topic,
        priority: userConfig.ntfy.priority,
        tags: ["speech_balloon"],
        authorization: ntfyAuth,
      });

      await ntfyClient.publish({
        title: isPM
          ? `${network.name}: ${data.nick}`
          : `${network.name} ${data.target}: ${data.nick}`,
        message: stripIrcFormatting(message),
        clickURL: channelUrl ? channelUrl.toString() : undefined,
        actions: channelUrl
          ? [
              {
                label: "Open",
                type: "view",
                url: channelUrl.toString(),
              },
            ]
          : undefined,
      });
    } catch (e) {
      PluginLogger.error("Failed to send ntfy notification", e);
    }
  };
}

module.exports = {
  createHandler,
};
