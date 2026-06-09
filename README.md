# The Lounge ntfy Plugin

![NPM Version](https://img.shields.io/npm/v/thelounge-plugin-ntfy?style=for-the-badge)
![NPM Downloads](https://img.shields.io/npm/dy/thelounge-plugin-ntfy?style=for-the-badge)

A plugin for [The Lounge](https://thelounge.chat/) that sends a message to an [ntfy](https://ntfy.sh/) server whenever The Lounge highlights a message for you.

## Installation

Via the `thelounge` command line:

```bash
thelounge install thelounge-plugin-ntfy
```

If you want notifications to open the channel when clicked, add a `baseUrl` entry in the `config.js` of your instance:

```js
"use strict";
module.exports = {
  baseUrl: "https://thelounge.example.com",
  // rest of config...
```

Restart The Lounge after installation

## Usage

This plugin introduces the `/ntfy` command, subcommands are:

- `/ntfy start [all]`: Start the ntfy listener for the network or all networks if 'all' is specified
- `/ntfy stop [all]`: Stop the ntfy listener for the network or all networks if 'all' is specified
- `/ntfy status [all]`: Show the ntfy listener status for this network or all networks if 'all' is specified
- `/ntfy test`: Send a test notification
- `/ntfy config`: Config commands
  - `/ntfy config set <setting_key> <setting_value>`: Set a global configuration setting
  - `/ntfy config remove <setting_key>`: Set a global configuration setting to null
  - `/ntfy config network set <setting_key> <setting_value>`: Set a per-network setting for this network
  - `/ntfy config network remove <setting_key>`: Remove per-network setting for this network
  - `/ntfy config print`: Print the current configuration with warnings if any

## Setup

This plugin will **not** work out of the box, by default the plugin sends notifications to the official `ntfy.sh` server but no topic is set. To set a topic, enter this command:

```
/ntfy config set ntfy.topic <topic>
```

You may also set your account credentials or token as well if needed, see the config print command for all the possible settings.

To start/stop sending push notifications in the desired network, enter:

```
/ntfy start/stop
```

## Highlights and Private Messages

ntfy notifications follow The Lounge's built-in highlight rules. This includes your nickname, custom highlights, and highlight exceptions configured in The Lounge.

Private messages notify by default, matching The Lounge's query highlight behavior. Muted channels and muted private message conversations do not send ntfy notifications.

## License

This plugin is licensed under [MIT](https://opensource.org/license/mit)
