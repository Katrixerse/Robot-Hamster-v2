Robot Hamster v2 
## A Multi-purpose discord-bot 
Made By Katrixerse & Andrei12225 https://github.com/andrei12225

### Im currently working on a new bot project so this one wont be updated much besides bug fixes

A remake of the original Robot Hamster https://github.com/Katrixerse/Robot-Hamster

Features
- Modmail
- Leveling w/canvas profile
- Economy
- Giveaways
- Custom Commands
- Tickets
- Moderation Staff
- Welcome/leave system
- Twitch Alerts

Uses mysql as a database

## Hosting

First, download all the files and put them in a folder.

Need to create a new app at https://discordapp.com/developers/applications/me/create and then need to fill out the bots name and select its avatar then create it. Once done that find where is says Bot and click create a bot user and hit yes, do it

Now you want to go back to bot go to token and click token: click to reveal this will show you the bot token now edit hammy.js, hammygamble.js, hammylevel.js where it says, client.login("your token") (it's at the bottom) with your bot token once done click save.

Now you have done that you will need NodeJs installed can get it from https://nodejs.org/en/ and download the latest lts version.

Now right click the folder in an empty space where you put the files in then click open command prompt.

Need to install each of these packages with npm install [packagename] without the brackets and replace package name with the ones below.

Packages Needed

- discord.js
- canvas
- node-superfetch
- mysql2
- topgg-autoposter
- twitch
- moment
- ms
- mal-scraper
- imdb-api
- randomcolor

Once done install mysql on your server
```js
sudo apt install mysql-server

sudo systemctl start mysql.service

sudo mysql_secure_installation
```
Than you want to run
```js
sudo mysql

CREATE DATABASE discord_bot_db;

CREATE USER 'username'@'host' IDENTIFIED BY 'password';

GRANT ALL ON discord_bot_db.* TO 'username'@'%';
```

When done downloading the dependencies and setting up mysql, run node bot.js to start the bot.

If there is a problem or an error please make an issue.

If you want to run this bot while not having the console or terminal open, use pm2 (ex. pm2 start bot.js)
