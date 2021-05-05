/*
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  ░   ░░░░░░░   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   ░░░░░░░░░░░░░░░░░░░░░░░░░░░   ░░░░░░░░░░░░░░░░░░░░░░   ░
  ▒  ▒   ▒▒▒    ▒▒  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   ▒▒▒   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   ▒
  ▒   ▒   ▒ ▒   ▒▒▒▒▒▒     ▒▒▒     ▒▒▒▒▒▒▒▒▒   ▒▒▒▒▒   ▒   ▒▒▒▒▒▒▒▒▒   ▒▒▒▒▒▒▒▒▒▒▒   ▒▒▒▒▒   ▒   ▒▒▒    ▒  ▒  ▒    ▒▒▒▒   ▒▒▒▒▒   ▒
  ▓   ▓▓   ▓▓   ▓   ▓   ▓▓▓▓▓   ▓▓▓▓▓   ▓▓   ▓▓   ▓▓▓   ▓▓   ▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓▓▓   ▓▓   ▓▓▓   ▓▓   ▓▓▓   ▓▓▓▓   ▓▓▓▓▓   ▓▓   ▓▓   ▓
  ▓   ▓▓▓  ▓▓   ▓   ▓▓▓    ▓▓▓▓    ▓▓   ▓   ▓▓▓▓   ▓▓   ▓▓   ▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓▓   ▓▓▓▓   ▓▓   ▓▓   ▓▓▓   ▓▓▓▓   ▓▓▓▓   ▓▓▓▓   ▓   ▓
  ▓   ▓▓▓▓▓▓▓   ▓   ▓▓▓▓▓   ▓▓▓▓▓   ▓   ▓▓   ▓▓   ▓▓▓   ▓▓   ▓▓▓▓▓▓▓▓   ▓▓▓   ▓▓   ▓▓   ▓▓▓   ▓▓   ▓▓▓   ▓ ▓▓   ▓▓▓▓▓   ▓▓   ▓▓   ▓
  █   ███████   █   █      ██      ██   ████   █████    ██   ██████████     ██████   █████    ██   ████   ██    ███████   █████   █
  █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████

  by ArcticSpaceFox and ryzetech
  made with 🍺 and ❤ in Germany

  Honorable Mentions:
    SteffTek
      dvs endpoint
      funny code snippets from github.com/SteffTek/Thorben

  Introduction:
    Hello explorer!
    This is the holy source code of Mission Control, the bot for the FoxInTheBox Discord ( discord.gg/m46vcrm52b ).
    The following lines are home to these things:
      - shitty solutions for easy problems
      - amateur code
      - major inefficiencies
      - TODOs and FIXMEs
      - comments which mock the code
      - comments with profanities and insults
      - comments admitting stupidity
    If you want to use this code (for whatever reason), it's licensed under the GNU General Public License v3.0.
    You can read more about it here -> https://github.com/ryzetech/Mission-Control/blob/master/LICENSE
    
    Thank you for your interest in this project! If you want to contribute, join the Discord server and talk to us
    or propose your changes directly in a pull request. :)
*/

// import funny stuff
const Discord = require("discord.js");
const client = new Discord.Client();
const si = require("systeminformation");
const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();
const fetch = require("node-fetch");
const axios = require("axios");
const NodeCache = require("node-cache");
const botCacheStorage = new NodeCache();
// import { PrismaClient } from "@prisma/client";
const prisma = require("./lib/client.js")
// -> why? NOde

// config shit
// TODO make this prettier, it looks a bit retarded
const { prefix, welcomeChannelID, autodelete, modroles, muterole, p_cooldown, ycomb_story_amount, embedColorStandard, embedColorProcessing, embedColorConfirm, embedColorWarn, embedColorFail, embedPB } = require("./config.json");
const { token } = require("./token.json");

// funny counters for fun lol
var messageCounter = 0;
var joinCounter = 0;

// init vars for coingecko stuff
var market;
var price = 0;

const startDate = new Date();

//// HELP METHODS
// get user from mentions or return sender
function userident(msg) {
  let arg = msg.mentions.members.first();
  if (typeof (arg) === "undefined") {
    arg = msg.member;
  }
  return arg;
}

// get difference between to timestamps as text
function timediff(timestamp1ornow, timestamp2, short) {
  let diff = timestamp1ornow - timestamp2;

  let days = Math.floor(diff / 1000 / 60 / 60 / 24);
  diff -= days * 1000 * 60 * 60 * 24;
  let hours = Math.floor(diff / 1000 / 60 / 60);
  diff -= hours * 1000 * 60 * 60;
  let minutes = Math.floor(diff / 1000 / 60);
  diff -= minutes * 1000 * 60;
  let seconds = Math.floor(diff / 1000);

  if (short) return `${hours} Hours, ${minutes} Minutes, ${seconds} Seconds`;
  else return `${days} Days, ${hours} Hours, ${minutes} Minutes, ${seconds} Seconds`;
}

// timed task executor for fetching market data from the CoinGecko API
function fetchdata() {
  CoinGeckoClient.coins.fetch('ethereum', {}).then(d => {
    market = d.data.market_data;
    price = market.current_price.eur;
  })
    .catch(error => {
      console.error("ERR [TIMED] CoinGecko Data Fetch: \"" + error.message + "\"");
    });
}

// comparer for safe url fetching until we make a better command + argument splitter
function startsWithInArray(string, stringArray) {
  for (let index in stringArray) {
    if (string.startsWith(stringArray[index]))
    return stringArray[index];
  }
  return undefined;
}

//// CLASSES
// help class for easily creating more complex embed fields because i'm an idiot
class EzField {
  constructor(name, value, inline) {
    this.name = name;
    this.value = value;
    this.inline = inline;
  }
}

//// BOT MANAGEMENT
// READY EVENT
client.on('ready', () => {
  // set status and info stuff
  client.user.setActivity(prefix + "help | a spacefoxes production");

  console.log(`Logged in as ${client.user.tag}!`);

  // start timed tasks
  // i couldn't think of a better way to do this. too bad!
  fetchdata();
  setInterval(function () { fetchdata(); }, 60000);
});

// WELCOME MESSAGE
client.on('guildMemberAdd', async (member) => {
  joinCounter++;

  let channel = member.guild.channels.cache.get(welcomeChannelID);

  // ask Virgin Slayer if the user is banned on the global network
  let response = await axios.post('https://dvs.stefftek.de/api/bans', { data: { userID: member.user.id } });
  let res = await response.data;

  // if the user is unknown to Virgin Slayer:
  if (res.status === "error" && res.msg === "api.error.notBanned") {
    // greet them with a warm welcome message <3
    let sent = await channel.send(`Hey ${member}, welcome on our little spaceship! 🚀`);
    // and delete it after "autodelete" seconds to keep the chat clean
    await sent.delete({ timeout: autodelete });
  }

  // if the user is known to Virgin Slayer:
  else if (res.status === "success") {
    // instantly mute the detected user
    let muro = member.guild.roles.cache.get(muterole);
    member.roles.add(muro);

    // get the current time to calculate the amount of time the user is banned
    let date = new Date(res.data.Timestamp);

    // send a message with the provided data
    channel.send(
      new Discord.MessageEmbed()
        .setColor(embedColorWarn)
        .setAuthor("Banned User Alert", embedPB)
        .setTitle("Virgin Slayer Global DB Match")
        .setDescription("An user known for inappropriate behaviour joined!\nYou can view the details down below.")
        .addFields(
          { name: "UserID", value: res.data.UserID },
          { name: "Ban Reason", value: res.data.Reason },
          { name: "User Tag at Ban", value: res.data.DisplayName },
          { name: "Ban Timestamp", value: date + "\n(" + timediff(Date.now(), date.getTime()) + " ago)" },
        )
        .setTimestamp()
        .setFooter(`This Message was sent automagically`)
    );
  }
});

// MESSAGE HANDLER
// TODO this is a big ugly mess! we should switch to caveats => https://discordjs.guide/creating-your-bot/commands-with-user-input.html#caveats
client.on('message', async (message) => {
  // preventing database checks on bots
  if (!message.author.bot) {
    messageCounter++;

    let user = await prisma.user.findUnique(
      {
        where: {
          id: message.author.id,
        }
      }
    );

    // if the user doesn't have an account yet...
    if (!user) {
      // create one!
      await prisma.user.create({
        data: {
          id: message.author.id,
        }
      });
    }
  }

  //// GENERAL SECTION
  // HELP
  if (message.content.startsWith(`${prefix}help`)) {
    message.channel.send(
      new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("Help", embedPB)
        .setDescription("Prefix: " + prefix + "\nStuff in <spikey brackets> have to be specified\nStuff in [square brackets] CAN be specified, but are not required.\noh and please leave out the brackets")
        .setThumbnail(embedPB)
        .addFields(
          { name: "\u200b", value: "\u200b" },
          { name: "ping", value: "Pong! (please don't spam this command, even if you like ping-pong)" },
          { name: "avatar [user ping]", value: "Takes the avatar of an user (or yours) and delivers it in the chat!" },
          { name: "\u200b", value: "\u200b" },
          { name: "meme", value: "random laugh stuff" },
          { name: "animal <animal>", value: "We have all the animals! With every execution, a new picture and a nice fact are thrown at your face.\nYou can get a list of all supported animals with **animals list**." },
          { name: "pokedex <name>", value: "bruh it's a pokédex, what did you expect" },
          { name: "mc <username>", value: "Shows some information on a player in Minecraft." },
          { name: "avmod <filter> [user ping]", value: "Modifies your avatar or the avatar of the pinged user.\nYou can get a list of all filters with **avatarmod filters**." },
          { name: "\u200b", value: "\u200b" },
          { name: "balance [user ping]", value: "Shows how much money is in your pocket (or in the pocket of the pinged user)." },
          { name: "leaderboard", value: "Shows the current leaderboard of all users by net value (cash and eth combined)." },
          { name: "work", value: "You can get free money every 24 hours!" },
          { name: "send <user ping> <amount>", value: "Send the specified amount to the specified user.\n**Note: A fee of 5% per trancaction is applied!**" },
          { name: "eth", value: "You can trade Ethereum in a simulated environment. Execute this command to get more info on what you can do with it." },
          { name: "\u200b", value: "\u200b" },
          { name: "info", value: "Shows some information on the bot" }
        )
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
    );
  }

  // PING
  else if (message.content.startsWith(`${prefix}ping`)) {
    let timestamp = message.createdTimestamp;

    let embed = new Discord.MessageEmbed()
      .setColor(embedColorStandard)
      .setAuthor("Mission Control Info", embedPB)
      .setTitle("LOADING STATS...")
      .setTimestamp()
      .setFooter(`Requested by ${message.author.tag}`);

    let sent = await message.channel.send(embed);

    let diff = sent.createdTimestamp - timestamp;
    sent.edit( embed
      .setTitle("🏓 Pong!")
      .addFields(
        { name: "Response Time", value: `${diff}ms` },
        { name: "Status", value: "Service is healthy" },
        { name: "Bot Uptime", value: timediff(Date.now(), startDate) },
        { name: "Messages since bot start", value: `${messageCounter} Messages` },
        { name: "Joins since bot start", value: `${joinCounter} Users` }
      )
    );
    // i made this ten lines shorter but now "loading in" the info is fucking ugly
  }

  // SYS INFO
  else if (message.content.startsWith(`${prefix}info`)) {

    // asking systeminformation about a bunch of server data
    // TODO i think we should cache this
    let load = await si.cpuCurrentSpeed();
    load = await load.avg;

    let memuse = await si.mem();
    memuse = await ((memuse.used / memuse.total) * 100).toFixed(1) + "%";

    let ping = await si.inetLatency("1.1.1.1");
    ping = await Math.floor(ping) + "ms";

    message.channel.send(
      new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("Info and Credits", embedPB)
        .setTitle("Mission Control by ryzetech and ArcticSpaceFox")
        .setDescription("Information about the bot and server health")
        .addFields(
          { name: "Hosted by ZAP-Hosting", value: "Go to https://zap-hosting.com/ryzetech and use our promocode 'ryzetech-a-4247' to get 20% discount on the entire runtime of your next product!" },
          { name: "CPU Usage", value: load, inline: true },
          { name: "RAM Use", value: memuse, inline: true },
          { name: "Ping to Cloudflare", value: ping, inline: true },
          { name: "\u200b", value: "\u200b" },
          { name: "Special Thanks", value: "some-random-api.ml\ncrafatar.com", inline: true },
          { name: "GitHub Repo", value: "https://github.com/ryzetech/Mission-Control", inline: true },
          { name: "Forked from", value: "Schrödinger by ryzetech\nhttps://schroedinger.ryzetech.live/", inline: true },
          { name: "Made by ryzetech and ArcticSpaceFox", value: "https://ryzetech.live/ | We love you! <3" }
        )
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
    );
  }

  // AVATAR
  else if (message.content.startsWith(`${prefix}avatar`)) {
    // identify user
    let argument = userident(message);

    message.channel.send(
      new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("Avatar Fetch", embedPB)
        .setTitle(`${argument.user.tag}'s avatar`)
        .setURL(argument.user.displayAvatarURL())
        .setImage(argument.user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
    );

    // bruh what did you expect? there is literally nothing to see here
  }

  // SRA SECTION
  // note: all the endpoints pretty much work the same: argument handling, fetching from GET endpoint and displaying the data + some error handling
  // ANIMAL
  else if (message.content.startsWith(`${prefix}animal`)) {
    let animals = ["dog", "cat", "panda", "fox", "koala", "birb"]; // birb is not a typo, it's the actual name of the endpoint (for real telk???)
    let arg = message.content.slice(8).toLocaleLowerCase();

    if (animals.includes(arg)) {
      message.channel.startTyping();
      let res = await fetch("https://some-random-api.ml/animal/" + arg);
      let json = await res.json();
      message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorStandard)
          .setAuthor("Animal Fetch: " + arg, embedPB)
          .setDescription(json.fact)
          .setImage(json.image)
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );
      message.channel.stopTyping();
    }

    else if (arg.startsWith("red panda")) { // handling red panda seperately because i'm stupid
      message.channel.startTyping();
      let res = await fetch("https://some-random-api.ml/img/red_panda");
      let json = await res.json();
      message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorStandard)
          .setAuthor("Animal Fetch: red panda", embedPB)
          .setImage(json.link)
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );
      message.channel.stopTyping();
    }

    else if (arg.startsWith("list")) {
      let foo = "";
      for (let i in animals) foo += (i == 0) ? animals[i] : ", " + animals[i];
      foo += ", red panda";

      message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorStandard)
          .setAuthor("Animal Fetch", embedPB)
          .setDescription("Available:\n" + foo)
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );
    }

    // people are idiots
    else {
      message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("Animal Fetch", embedPB)
          .setTitle("❌ Error")
          .setDescription("That animal isn't available in our database (yet)\nCheck **" + prefix + "animal list** for a list of all animals!")
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );
    }
  }

  // MEME
  else if (message.content.startsWith(`${prefix}meme`)) {
    message.channel.startTyping();

    let res = await fetch("https://some-random-api.ml/meme");
    let json = await res.json();
    message.channel.send(
      new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("a random meme", embedPB)
        .setTitle(json.caption)
        .setImage(json.image)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
    );
    message.channel.stopTyping();
  } // TODO we should use the reddit api to get a post from a passed subreddit and fall back to this if nothing is passed

  // POKEDEX / POKEMON
  else if (message.content.startsWith(`${prefix}pokedex`) || message.content.startsWith(`${prefix}pokemon`)) {
    let arg = message.content.slice(9);
    message.channel.startTyping(); // do this because this might take a while, people hate it when the bot is sitting around doing seemingly nothing

    try {
      let res = await fetch("https://some-random-api.ml/pokedex?pokemon=" + encodeURIComponent(arg));
      let json = await res.json();

      if (!json.error) { // hoping the request doesn't fail

        let typelist = "", genderlist = "", evoLine = "", abilities = "", eggGroups = "", species = "";

        // processing information into a somewhat pretty format
        // side note: this looks ugly and retarded but does the job so well that i dont want to replace it
        for (let i in json.type) typelist += (i == 0) ? json.type[i] : ", " + json.type[i];
        for (let i in json.gender) genderlist += (i == 0) ? json.gender[i] : " / " + json.gender[i];
        for (let i in json.species) species += (i == 0) ? json.species[i] : " " + json.species[i];
        for (let i in json.family.evolutionLine) {
          evoLine += (i == 0) ? "" : " => ";
          evoLine += (json.family.evolutionLine[i] === (json.name.charAt(0).toUpperCase() + json.name.slice(1))) ? ("**" + json.family.evolutionLine[i] + "**") : json.family.evolutionLine[i];
        }
        if (json.family.evolutionLine.length == 0) evoLine = "N/A";
        for (let i in json.abilities) abilities += (i == 0) ? json.abilities[i] : ", " + json.abilities[i];
        for (let i in json.egg_groups) eggGroups += (i == 0) ? json.egg_groups[i] : ", " + json.egg_groups[i];

        // sending the stuffz
        message.channel.send(
          new Discord.MessageEmbed()
            .setColor(embedColorStandard)
            .setAuthor("Pokédex", embedPB)
            .setTitle(json.name.charAt(0).toUpperCase() + json.name.slice(1))
            .setDescription("**" + species + "**\n" + json.description)
            .setThumbnail(json.sprites.animated)
            .addFields(
              { name: "Type(s)", value: typelist, inline: true },
              { name: "ID", value: json.id, inline: true },
              { name: "Generation", value: json.generation, inline: true },
              { name: "Height", value: json.height, inline: true },
              { name: "Weight", value: json.weight, inline: true },
              { name: "Base Experience", value: json.base_experience, inline: true },
              { name: "Gender distribution", value: genderlist, inline: false },
              { name: "HP", value: json.stats.hp, inline: true },
              { name: "Attack", value: json.stats.attack, inline: true },
              { name: "Defense", value: json.stats.defense, inline: true },
              { name: "Speed", value: json.stats.defense, inline: true },
              { name: "Special Attack", value: json.stats.sp_atk, inline: true },
              { name: "Special Defense", value: json.stats.sp_def, inline: true },
              { name: "TOTAL", value: json.stats.total, inline: false },
              { name: "Abilities", value: abilities, inline: true },
              { name: "Egg Groups", value: eggGroups, inline: true },
              { name: "Evolution Line", value: evoLine, inline: true }
            )
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`)
        );
      }

      // api error handling
      else {
        message.channel.send(
          new Discord.MessageEmbed()
            .setColor(embedColorFail)
            .setAuthor("Pokédex", embedPB)
            .setTitle("❌ An error occured! :(")
            .setThumbnail("https://static.wikia.nocookie.net/nintendo/images/8/85/MissingNoNormal.png/revision/latest?cb=20131114211037&path-prefix=en")
            .setDescription("Error Message: *" + json.error + "*")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`)
        );
      }
    }

    // fetch error handling
    catch (error) {
      message.channel.send("Something went terribly wrong. Sry :(\n\nERRMSG:\n" + error.message);
      console.error("ERR [EXEC] \"" + message.content + "\" - Error: \"" + error.message + "\" - Link: https://some-random-api.ml/pokedex?pokemon=" + encodeURIComponent(arg));
    }
    message.channel.stopTyping();
  }

  // MC
  else if (message.content.startsWith(`${prefix}mc`)) {
    let arg = message.content.slice(4);
    message.channel.startTyping(); // i'm not going to explain this a second time!

    try {
      let res = await fetch("https://some-random-api.ml/mc?username=" + encodeURIComponent(arg));
      let json = await res.json();

      if (!json.error) { // hoping the request doesn't fail

        // preparing embed for easy insertion
        let msg = new Discord.MessageEmbed()
          .setColor(embedColorStandard)
          .setAuthor("MC Fetch", embedPB)
          .setTitle(json.username)
          .setThumbnail("https://crafatar.com/avatars/" + json.uuid)
          .setImage("https://crafatar.com/renders/body/" + json.uuid)
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`);

        let namelist;

        // check if the user has changed the name more than 25 times (discord embed field limit)
        if (json.name_history.length > 25) {

          // init namelist as string (don't ask me why this needs a newline character)
          namelist = "\n";

          /* --------------------------------------------------------------------------------------
            when we are here, the dataset is too huge to use embed fields.
            instead, we fall back to using a code box with this format:

            name
            -> date of change

            but there is a problem: the embed description has a limit as well: 2048 chars.
            let's calculate it:
             
            a nickname can be 16 chars long, plus up to 16 chars for the date and formatting.
            thats 32 chars per name change. we aditionally have to subtract the codebox chars and
            the initial description (including the uuid), which leaves us with approximately 1970 chars.
            thats enough for 60 name changes.

            thats enough breathing space for MY standards, as somebody would have to change their
            nickname every month for five years straight.

            i mean, even if this fails, we have found one of the oldest players (or one of the
            most determinded) in minecraft, that would be awesome! :D
          ----------------------------------------------------------------------------------------- */
          for (let i in json.name_history) namelist += (i == 0) ? (json.name_history[i].name + "\n-> " + json.name_history[i].changedToAt) : ("\n\n" + json.name_history[i].name + "\n-> " + json.name_history[i].changedToAt);
          
          // wrap shit into codebox
          namelist = "```" + namelist + "```";

          // pipe it into the embed's description
          msg.setDescription(`${json.uuid}\n\n**Name History (old to new):**\n${namelist}`);
        }

        else { // field solution (prettier)

          // init namelist as array for EzFields
          namelist = [];

          // cool solution, i like it
          for (let i in json.name_history) namelist.push(new EzField(json.name_history[i].name, json.name_history[i].changedToAt, false));
          
          // pipe info into the embed
          msg.setDescription(`${json.uuid}\n\n**Name History (old to new):**`);
          msg.addFields(namelist);
        }

        // sending the embed
        message.channel.send(msg);
      }

      // api error handling
      else {
        message.channel.send(
          new Discord.MessageEmbed()
            .setColor(embedColorFail)
            .setAuthor("MC Fetch", embedPB)
            .setTitle("❌ An error occured! :(")
            .setDescription("Error Message: *" + json.error + "*")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`)
        );
      }
    }

    // fetch error handling
    catch (error) {
      message.channel.send("Something went terribly wrong. Sry :(\n\nERRMSG:\n" + error.message);
      console.error("ERR [EXEC] \"" + message.content + "\" - Error: \"" + error.message + "\" - Link: https://some-random-api.ml/mc?username=" + encodeURIComponent(arg));
    }
    message.channel.stopTyping();
  }

  // AVATAR MOD
  else if (message.content.startsWith(`${prefix}avmod`)) {
    let msg;
    let usr = userident(message);
    let args = message.content.slice(7).toLowerCase();

    if (args === "filters") {
      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("Avatarmod", embedPB)
        .setTitle("All available filters:")
        .addFields(
          { name: "glass", value: "helo i'm behind glass" },
          { name: "wasted", value: "WASTED! For true GTA fanboys" },
          { name: "triggered", value: "T R I G G E R E D" },
          { name: "greyscale", value: "for sad moments" },
          { name: "invert", value: "wtf" },
          { name: "invgs", value: "greyscale + invert = holy shit" },
          { name: "brightness", value: "pls dont" },
          { name: "threshold", value: "this is cursed" },
          { name: "sepia", value: '"I was born in 1869!"' },
          { name: "pixelate", value: "even 144p is luxury" },
          { name: "lolice", value: "you belong in jail" }
        )
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
    }

    // filter handling
    else if (startsWithInArray(args, ["glass", "wasted", "greyscale", "invert", "brightness", "threshold", "sepia", "pixelate", "red", "green", "blue"])) {
      args = startsWithInArray(args, ["glass", "wasted", "greyscale", "invert", "brightness", "threshold", "sepia", "pixelate", "red", "green", "blue"]); // i know this is stupid lmao
      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription(`Modifier: ${args.toUpperCase()}`)
        .setURL(`https://some-random-api.ml/canvas/${args}/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setImage(`https://some-random-api.ml/canvas/${args}/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    } // side note: this mess saves us approx 90 lines, fuck yeah!

    else if (args.startsWith("invgs")) {
      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription("Modifier: INVERT GREYSCALE")
        .setURL(`https://some-random-api.ml/canvas/invertgreyscale/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setImage(`https://some-random-api.ml/canvas/invertgreyscale/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }

    // special attachment treatment for the last two because sra is kinda slow on these endpoints and (i think) discord has a timeout on embed image requests
    else if (args.startsWith("triggered")) {
      message.channel.startTyping();

      let att = new Discord.MessageAttachment(`https://some-random-api.ml/canvas/triggered/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`, "a.gif")

      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription("Modifier: TRIGGERED")
        .setURL(`https://some-random-api.ml/canvas/triggered/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .attachFiles(att)
        .setImage("attachment://a.gif")
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);

      message.channel.stopTyping();
    }

    else if (args.startsWith("lolice")) {
      message.channel.startTyping();

      let att = new Discord.MessageAttachment(`https://some-random-api.ml/canvas/lolice/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`, "a.png")

      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription("Modifier: LOLICE")
        .setURL(`https://some-random-api.ml/canvas/lolice/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .attachFiles(att)
        .setImage("attachment://a.png")
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);

      message.channel.stopTyping();
    }

    // arg error handling
    else {
      msg = new Discord.MessageEmbed()
        .setColor(embedColorFail)
        .setAuthor("❌ Syntax mistake!", embedPB)
        .setDescription("Either you didn't specify a filter, or the one specified wasn't found.\n**To get a list with all filters, type '" + prefix + "avmod filters'.**\n\n*Usage: " + prefix + "avmod <filter> [User Ping]*")
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }

    message.channel.send(msg);
  }

  // HACKER NEWS
  else if (message.content.startsWith(`${prefix}news`)) {
    // displaying procesing message due to long fetch times
    let msg = await message.channel.send(
      new Discord.MessageEmbed()
        .setColor(embedColorProcessing)
        .setAuthor("HackerNews", embedPB)
        .setTitle("Hold on!")
        .setDescription("I'm fetching data right now, give me a second...")
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
    );

    let i = 0;
    let fields = [];
    let value = botCacheStorage.get("news");

    if (!value) {
      // get the top stories list
      let res = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty");
      let json = await res.json();
      // set value
      value = json;
      // update cache                                <h, m, s, mil>
      let success = botCacheStorage.set("news", json, 2*60*60*1000);
      // error log message
      if (!success) {
        console.error("ERR [EXEC] \"" + message.content + "\" - Error: Cache error! Failed to get hackernews top stories");
      }
    }

    // get the first "ycomb_story_amount" stories and add them to the ezfield array
    while (i < ycomb_story_amount) {
      let data = botCacheStorage.get(`news_${i}`);
      if (!data) {
        // construct link
        let link = "https://hacker-news.firebaseio.com/v0/item/" + encodeURIComponent(value[i]) + ".json?print=pretty";
        // fetch data and parse
        data = await fetch(link);
        data = await data.json();
        // update the cache
        let success = botCacheStorage.set(`news_${i}`, data, 2 * 60 * 60 * 1000);
        // error log
        if (!success) {
          console.error("ERR [EXEC] \"" + message.content + `\" - Error: Cache error! Failed to get hackernews item [${i}]`);
        }
      }
      let url = data.url ? "[Link](" + data.url + ")" : "no url available"; // some stories have no url because they are internal

      fields.push(new EzField(data.title, "by " + data.by + " - " + url));

      i++;
    }

    // edit the processing message to display the news
    msg.edit(
      new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("HackerNews", embedPB)
        .setTitle("Top Stories")
        .setThumbnail("https://www.ycombinator.com/assets/ycdc/ycombinator-logo-b603b0a270e12b1d42b7cca9d4527a9b206adf8293a77f9f3e8b6cb542fcbfa7.png")
        .addFields(fields)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
    );
  }

  //// ECONOMY SECTION
  // ETH
  // note: this is pretty much a "command subcommand" section because i need some subcommands again later for future item buying and selling
  else if (message.content.startsWith(`${prefix}eth`)) {
    let stuff = market;
    let args = message.content.slice(5);

    // get the user from the db
    let usr = await prisma.user.findUnique({ where: { id: message.author.id } });

    // CURRENT STATS
    if (args.startsWith("stats")) {
      message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorStandard)
          .setAuthor("Coin System", embedPB)
          .setTitle("Ethereum Stats")
          .setThumbnail("http://www.vectorico.com/download/cryptocurrency/ethereum-icon.png")
          .setDescription("*Note: The data displayed here can be delayed by up to five minutes. However, you will always play around with this dataset!*")
          .addFields(
            { name: "Current value", value: stuff.current_price.eur + "€" },
            { name: "Highest value (24h)", value: stuff.high_24h.eur + "€", inline: true },
            { name: "Lowest value (24h)", value: stuff.low_24h.eur + "€", inline: true },
            { name: "Change (24h)", value: stuff.price_change_percentage_24h.toFixed(2) + "%" }
          )
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      )
    }

    // BUY FOR AMOUNT
    else if (args.startsWith("buyfor")) {
      let msg;

      // parse amount
      let amount = parseFloat(args.slice(7).replace(',', '.'));

      // check if amount is valid
      if (isNaN(amount) || amount <= 0) {
        msg = new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("❌ Invalid amount!", embedPB)
          .setDescription("The specified amount is not a number or invalid.\nPlease try again.")
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`);
      }
      else {

        // check if user has enough money to perform this action
        if ((amount) > usr.money) {
          msg = new Discord.MessageEmbed()
            .setColor(embedColorFail)
            .setAuthor("❌ Invalid amount!", embedPB)
            .setDescription("The specified amount is too high or your balance is to low.")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
        }

        // execute order
        else {
          usr.money -= amount;
          usr.eth += amount / price;

          msg = new Discord.MessageEmbed()
            .setColor(embedColorConfirm)
            .setAuthor("✅ Transaction confirmed!", embedPB)
            .setDescription("This is your balance now:")
            .addFields(
              { name: "Balance", value: usr.money.toFixed(2) + "€", inline: true },
              { name: "Ethereum", value: usr.eth + " (approx. " + (price * usr.eth).toFixed(2) + "€)", inline: true }
            )
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
        }
      }

      message.channel.send(msg);
    }

    // BUY AMOUNT
    else if (args.startsWith("buy")) {
      let msg;

      // parse amount
      let amount = parseFloat(args.slice(4).replace(',', '.'));

      // check if amount is valid
      if (isNaN(amount) || amount <= 0) {
        msg = new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("❌ Invalid amount", embedPB)
          .setDescription("The specified amount is not a number or invalid.\nPlease try again.")
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`);
      }
      else {

        // check if has enough money to perform this action
        if ((amount * price) > usr.money) {
          msg = new Discord.MessageEmbed()
            .setColor(embedColorFail)
            .setAuthor("❌ Invalid amount", embedPB)
            .setDescription("The specified amount is too high or your balance is to low.")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
        }

        // execute order
        else {
          usr.money -= amount * price;
          usr.eth += amount;

          msg = new Discord.MessageEmbed()
            .setColor(embedColorConfirm)
            .setAuthor("✅ Transaction confirmed!", embedPB)
            .setDescription("This is your balance now:")
            .addFields(
              { name: "Balance", value: usr.money.toFixed(2) + "€", inline: true },
              { name: "Ethereum", value: usr.eth + " (approx. " + (price * usr.eth).toFixed(2) + "€)", inline: true }
            )
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
        }
      }

      message.channel.send(msg);
    }

    // SELL FOR AMOUNT
    else if (args.startsWith("sellfor")) {
      let msg;

      // parse amount
      let amount = parseFloat(args.slice(8).replace(',', '.'));

      // check if amount is valid
      if (isNaN(amount) || amount <= 0) {
        msg = new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("❌ Invalid amount", embedPB)
          .setDescription("The specified amount is not a number or invalid.\nPlease try again.")
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`);
      }
      else {

        // check if user has enough eth to perform this action
        if ((amount / price) > usr.eth) {
          msg = new Discord.MessageEmbed()
            .setColor(embedColorFail)
            .setAuthor("❌ Invalid amount", embedPB)
            .setDescription("The specified amount is too high or your balance is to low.")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
        }

        // execute order
        else {
          usr.money += amount;
          usr.eth -= amount / price;

          msg = new Discord.MessageEmbed()
            .setColor(embedColorConfirm)
            .setAuthor("✅ Transaction confirmed!", embedPB)
            .setDescription("This is your balance now:")
            .addFields(
              { name: "Balance", value: usr.money.toFixed(2) + "€", inline: true },
              { name: "Ethereum", value: usr.eth + " (approx. " + (price * usr.eth).toFixed(2) + "€)", inline: true }
            )
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
        }
      }

      message.channel.send(msg);
    }

    // SELL AMOUNT
    else if (args.startsWith("sell")) {
      let msg;

      // parse amount
      let amount = parseFloat(args.slice(5).replace(',', '.'));

      // check if amount is valid
      if (isNaN(amount) || amount <= 0) {
        msg = new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("❌ Invalid amount", embedPB)
          .setDescription("The specified amount is not a number or invalid.\nPlease try again.")
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`);
      }
      else {

        // check if user has enough eth to perform this action
        if ((amount) > usr.eth) {
          msg = new Discord.MessageEmbed()
            .setColor(embedColorFail)
            .setAuthor("❌ Invalid amount", embedPB)
            .setDescription("The specified amount is too high or your balance is to low.")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
        }

        // execute order
        else {
          usr.money += amount * price;
          usr.eth -= amount;

          msg = new Discord.MessageEmbed()
            .setColor(embedColorConfirm)
            .setAuthor("✅ Transaction confirmed!", embedPB)
            .setDescription("This is your balance now:")
            .addFields(
              { name: "Balance", value: usr.money.toFixed(2) + "€", inline: true },
              { name: "Ethereum", value: usr.eth + " (approx. " + (price * usr.eth).toFixed(2) + "€)", inline: true }
            )
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
        }
      }

      message.channel.send(msg);
    }

    else {
      message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorStandard)
          .setAuthor("❌ Syntax error!", embedPB)
          .setDescription("There are multiple subcommands:")
          .addFields(
            { name: "eth stats", value: "Displays the current Ethereum stats" },
            { name: "eth buy <amount>", value: "Buy the amount of ETH specified with 'amount'." },
            { name: "eth buyfor <amount>", value: "Buy ETH FOR the amount of money specified with 'amount'." },
            { name: "eth sell <amount>", value: "Sell the amount of ETH specified with 'amount'." },
            { name: "eth sellfor <amount>", value: "Sell ETH FOR the amount of money specified with 'amount'." }
          )
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );
    }
  }

  // BALANCE
  else if (message.content.startsWith(`${prefix}balance`)) {

    // identify user and get it from the db
    let argument = userident(message);
    let usr = await prisma.user.findUnique({ where: { id: message.author.id } });

    message.channel.send(
      new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("Coin System", embedPB)
        .setTitle(argument.user.tag + "'s Account")
        .addFields(
          { name: "Balance", value: usr.money.toFixed(2) + "€", inline: true },
          { name: "Ethereum", value: usr.eth + " (approx. " + (price * usr.eth).toFixed(2) + "€)", inline: true }
        )
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
    );
  }

  // SEND
  else if (message.content.startsWith(`${prefix}send`)) {
    // Tests for the following pattern and returns search results
    // #send <@273...132> 123
    const pattern = /#send <@!(\d+)> (\d+)/;
    const regres = pattern.exec(message.content);

    // handle case where pattern fails
    // handle case match is not len 3
    if (regres == null || regres.length !== 3) {
      return message.channel.send(new Discord.MessageEmbed()
        .setColor(embedColorFail)
        .setAuthor("Coin System", embedPB)
        .setTitle("❌ Syntax mistake!")
        .setDescription("Sytntax is `#send @<user_to_send_to> <amount>`")
        .addField("`user_to_send_to`:", "This should be the user you want the transaction to go to")
        .addField("`amount`:", "The amount you want to send to that user")
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
      );
    }

    // extract the values
    const [, userid, amount] = regres;
    // get users from db
    const userFrom = await prisma.user.findUnique({ where: { id: message.author.id } });
    const userTo = await prisma.user.findUnique({ where: { id: userid } });
    // Check if any value is not initilized
    if (!userTo || !amount || !userFrom) {
      return message.channel.send(new Discord.MessageEmbed()
        .setColor(embedColorFail)
        .setAuthor("Coin System", embedPB)
        .setTitle("❌ Transaction failed!")
        .setDescription("We couldnt process your transaction, please contact our support if you think this is a mistake")
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
      );
    }
    // check if balance is ok
    if (userFrom.money < amount) {
      return message.channel.send(new Discord.MessageEmbed()
        .setColor(embedColorFail)
        .setAuthor("Coin System", embedPB)
        .setTitle("❌ Transaction failed!")
        .setDescription("You dont have the balance to cover for that transaction!")
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
      );
    }

    // calc fee
    const fee = Math.round(amount * 0.05);
    // transaction
    userFrom.money -= amount;
    userTo.money += amount - fee;
    // message after transaction is done
    message.channel.send(new Discord.MessageEmbed()
      .setColor(embedColorConfirm)
      .setAuthor("Coin System", embedPB)
      .setTitle("✅ Transaction successfull!")
      .setDescription("You've sent " + amount + " Euros! Please be aware of our 5% fee")
      .addFields(
        { name: "Amount", value: amount + "€" },
        { name: "Fee", value: fee + "€" }
      )
      .setTimestamp()
      .setFooter(`Requested by ${message.author.tag}`)
    );
  }

  // WORK
  else if (message.content.startsWith(`${prefix}work`)) {
    let msg;

    // yes i refractored user to usr whatcha gonna do huh?

    // identify user
    let usr = await prisma.user.findUnique({ where: { id: message.author.id } });

    // check if user is in cooldown defined by "p_cooldown"
    if (new Date(usr.lastearnstamp) < new Date().getTime() - p_cooldown || !usr.lastearnstamp) {

      // calc amount
      let amount = Math.round(Math.random() * 950 + 50);

      // cooldown the user and calculate new amount
      await prisma.user.update({
        where: {
          id: usr.id,
        },
        data: {
          lastearnstamp: new Date().getTime(),
          money: {
            increment: amount,
          },
        },
      });

      // display the data
      msg = new Discord.MessageEmbed()
        .setColor(embedColorConfirm)
        .setAuthor("Coin System", embedPB)
        .setTitle("✅ Payout successful!")
        .setDescription("You've got " + amount + " Euros today!")
        .addFields(
          { name: "Balance", value: usr.money.toFixed(2) + "€", inline: true },
          { name: "Ethereum", value: usr.eth + " (approx. " + (price * usr.eth).toFixed(2) + "€)", inline: true }
        )
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }

    // display error message on cooldown
    else {
      msg = new Discord.MessageEmbed()
        .setColor(embedColorFail)
        .setAuthor("Coin System", embedPB)
        .setTitle("❌ Payout failed!")
        .setDescription("You can't get salary at the moment!")
        .addField("Next salary:", timediff(new Date(usr.lastearnstamp) + p_cooldown, new Date().getTime(), true))
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }
    message.channel.send(msg);
  }

  // LEADERBOARD
  else if (message.content.startsWith(`${prefix}leaderboard`)) {
    let sent = await message.channel.send(
      new Discord.MessageEmbed()
        .setColor(embedColorProcessing)
        .setAuthor("Leaderboard", embedPB)
        .setTitle("Fetching Data...")
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
    );

    // i am too stupid to create a leaderboard for combined stats, so i need to split it into cash and eth
    let topMoney = await prisma.user.findMany({orderBy: money, take: 10});
    let topEth = await prisma.user.findMany({orderBy: eth, take: 10});

    let topMoneyField = "", topEthField = "", i = 0, usrCheck;

    for (let i in topMoney) {
      i++;
      usrCheck = client.users.cache.get(topMoney[i].id);
      topMoneyField += "**" + i + ".** " + usrCheck ? usrCheck.tag : "*user left*" + " - " + topMoney[i].money + "$\n";
    }
    i = 0;
    for (let i in topEth) {
      i++;
      usrCheck = client.users.cache.get(topEth[i].id);
      topEthField += "**" + i + ".** " + usrCheck ? usrCheck.tag : "*user left*" + " - " + topEth[i].eth + "$\n";
    }
    // we still need checks whether a user is still on the server because we dont delete the user object when they leave
    // TODO do this

    sent.edit(
      new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("Leaderboard", embedPB)
        .setTitle("Top 10")
        .addFields(
          { name: "Cash", value: topMoneyField, inline: true },
          { name: "ETH", value: topEthField, inline: true }
        )
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
    )
  }

  //// MOD SECTION
  // VS CHECK
  else if (message.content.startsWith(`${prefix}vscheck`)) {
    let usrid;

    // check whether user has the permissions to run this command
    if (message.member.roles.cache.some((role) => modroles.includes(role.id))) {

      // gets the id from the arguments while determining if a user is mentioned or not
      if (typeof (message.mentions.members.first()) === "undefined") usrid = message.content.slice(9);
      else usrid = message.mentions.members.first().user.id;

      // send processing message
      let sent = await message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorProcessing)
          .setAuthor("VS Check", embedPB)
          .setTitle("Hold on!")
          .setDescription("I'm asking Virgin Slayer about the ban status of this user, give me a second...")
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );

      // ask Virgin Slayer if the user is banned on the global network
      let response = await axios.post('https://dvs.stefftek.de/api/bans', { data: { userID: usrid } });
      let res = await response.data;

      // if the user is unknown to Virgin Slayer:
      if (res.status === "error" && res.msg === "api.error.notBanned") {
        sent.edit(
          new Discord.MessageEmbed()
            .setColor(embedColorConfirm)
            .setAuthor("VS Check", embedPB)
            .setTitle("User is not banned!")
            .setDescription("This user is unknown to our global database.")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`)
        );
      }

      // if the user is known to Virgin Slayer:
      else if (res.status === "success") {
        // get the current time to calculate the amount of time the user is banned
        let date = new Date(res.data.Timestamp);

        // send a message with the provided data
        sent.edit(
          new Discord.MessageEmbed()
            .setColor(embedColorWarn)
            .setAuthor("VS Check", embedPB)
            .setTitle("User is banned!")
            .setDescription("This user is known to us for inappropriate behaviour.")
            .addFields(
              { name: "UserID", value: res.data.UserID },
              { name: "Ban Reason", value: res.data.Reason },
              { name: "User Tag at Ban", value: res.data.DisplayName },
              { name: "Ban Timestamp", value: date + "\n(" + timediff(Date.now(), date.getTime()) + " ago)" },
            )
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`)
        )
      }
    }

    else {
      message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("VS Check", embedPB)
          .setTitle("❌ Insufficent Permissions!")
          .setDescription("This command is reserved for mods and admins!")
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );
    }
  }

  else {
    // random reward for chatting
    if (Math.round(Math.random() * 4 + 1) === 5 && !message.author.bot) {
      let usr = await prisma.user.findUnique({ where: { id: message.author.id } });
      usr.money += (Math.round(Math.random() * 8 + 1) / 100);
    }
  }
});

// start this abomination
client.login(token);
