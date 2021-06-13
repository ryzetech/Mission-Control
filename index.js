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
const CoinGecko = require("coingecko-api");
const CoinGeckoClient = new CoinGecko();
const fetch = require("node-fetch");
const axios = require("axios");
const NodeCache = require("node-cache");
const botCacheStorage = new NodeCache();
const ImageCharts = require('image-charts');
// import { PrismaClient } from "@prisma/client";
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  log: ["query", "info", `warn`, `error`],
});
// -> why? NOde

// config shit
const {
  prefix,
  welcomeChannelID,
  autodelete,
  modroles,
  muterole,
  p_cooldown,
  ycomb_story_amount,
  coinflip_multiplicator,
  embedColorStandard,
  embedColorProcessing,
  embedColorConfirm,
  embedColorWarn,
  embedColorFail,
  embedPB,
} = require("./config.json");
const { token, nasa_auth } = require("./token.json");
const { join } = require("@prisma/client/runtime");

// funny counters for fun lol
var messageCounter = 0;
var joinCounter = 0;

// init vars for coingecko stuff
var market, eth_badge;
var price = 0;

// nasa api rate limit holder
var nasa_rate = 1000;

const startDate = new Date();

//// HELP METHODS
// get user from mentions or return sender
function userident(msg) {
  let arg = msg.mentions.members.first();
  if (typeof arg === "undefined") {
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
  else
    return `${days} Days, ${hours} Hours, ${minutes} Minutes, ${seconds} Seconds`;
}

// Check if user is still on server, if not remove from db
async function checkUserIsStillHere(usr, usrCheck, timeOffset = 10) {
  if (!usrCheck) {
    if (new Date(usr.updatedAt) < new Date().setDate(new Date() - timeOffset))
      return false;
  }

  return true;
}

// timed task executor for fetching market data from the CoinGecko API
function fetchdata() {
  CoinGeckoClient.coins
    .fetch("ethereum", {})
    .then((d) => {
      eth_badge = d.data.image.large;
      market = d.data.market_data;
      price = market.current_price.eur;
    })
    .catch((error) => {
      console.error(
        'ERR [TIMED] CoinGecko Data Fetch: "' + error.message + '"'
      );
    });
}

// comparer for safe url fetching until we make a better command + argument splitter
function startsWithInArray(string, stringArray) {
  for (let index in stringArray) {
    if (string.startsWith(stringArray[index])) return stringArray[index];
  }
  return undefined;
}

// the cooler setTimeout
function setTimeoutPromise(delay) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), delay);
  });
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
client.on("ready", () => {
  // set status and info stuff
  client.user.setActivity(prefix + "help | a spacefoxes production");

  console.log(`Logged in as ${client.user.tag}!`);

  // start timed tasks
  // i couldn't think of a better way to do this. too bad!
  fetchdata();
  setInterval(function () {
    fetchdata();
  }, 60000);
});

// WELCOME MESSAGE
client.on("guildMemberAdd", async (member) => {
  joinCounter++;

  // stats tracking
  let stats = await prisma.stat.update({
    where: { id: 0 },
    data: { usersGreeted: { increment: 1 } }
  });

  let channel = member.guild.channels.cache.get(welcomeChannelID);

  // ask Virgin Slayer if the user is banned on the global network
  let response = await axios.post("https://dvs.stefftek.de/api/bans", {
    data: { userID: member.user.id },
  });
  let res = await response.data;

  // if the user is unknown to Virgin Slayer:
  if (res.status === "error" && res.msg === "api.error.notBanned") {

    // greet them with a warm welcome message <3
    let sent = await channel.send(
      `Hey ${member}, welcome on our little spaceship! 🚀`
    );

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
        .setDescription(
          "An user known for inappropriate behaviour joined!\nYou can view the details down below."
        )
        .addFields(
          { name: "UserID", value: res.data.UserID },
          { name: "Ban Reason", value: res.data.Reason },
          { name: "User Tag at Ban", value: res.data.DisplayName },
          {
            name: "Ban Timestamp",
            value:
              date + "\n(" + timediff(Date.now(), date.getTime()) + " ago)",
          }
        )
        .setTimestamp()
        .setFooter(`This Message was sent automagically`)
    );
  }
});

// MESSAGE HANDLER
// TODO this is a big ugly mess! we should switch to caveats => https://discordjs.guide/creating-your-bot/commands-with-user-input.html#caveats
client.on("message", async (message) => {
  // some tasks need the time of execution
  let exectime = new Date().getTime();

  // stats tracking
  let stats = await prisma.stat.update({
    where: { id: 0 },
    data: { messagesRead: { increment: 1 } }
  });

  // preventing database checks on bots
  if (!message.author.bot) {
    messageCounter++;

    let user = await prisma.user.findUnique({
      where: {
        id: message.author.id,
      },
    });

    // if the user doesn't have an account yet...
    if (!user) {
      // create one!
      await prisma.user.create({
        data: {
          id: message.author.id,
          lastearnstamp: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        },
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
        .setDescription(
          "Prefix: " +
          prefix +
          "\nStuff in <spikey brackets> have to be specified\nStuff in [square brackets] CAN be specified, but are not required.\noh and please leave out the brackets"
        )
        .setThumbnail(embedPB)
        .addFields(
          { name: "\u200b", value: "\u200b" },
          {
            name: "ping",
            value:
              "Pong! (please don't spam this command, even if you like ping-pong)",
            inline: true
          },
          {
            name: "info",
            value:
              "Shows some information on the bot",
            inline: true
          },
          { name: "\u200b", value: "\u200b" },
          {
            name: "avatar [user ping]",
            value:
              "Takes the avatar of an user (or yours) and delivers it in the chat!",
            inline: true
          },
          {
            name: "avmod <filter> [user ping]",
            value:
              "Modifies your avatar or the avatar of the pinged user.\nYou can get a list of all filters with **avmod filters**.",
            inline: true
          },
          { name: "\u200b", value: "\u200b", inline: true },
          {
            name: "animal <animal>",
            value:
              "We have all the animals! With every execution, a new picture and a nice fact are thrown at your face.\nYou can get a list of all supported animals with **animal list**.",
            inline: true
          },
          {
            name: "pokedex <name>",
            value:
              "bruh it's a pokédex, what did you expect",
            inline: true
          },
          {
            name: "mc <username>",
            value:
              "Shows some information on a player in Minecraft.",
            inline: true
          },
          {
            name: "meme",
            value: "random laugh stuff"
          },
          { name: "\u200b", value: "\u200b" },
          {
            name: "news",
            value:
              "Get fresh news from yCombinator! (we can't gurantee freshness)",
            inline: true
          },
          {
            name: "spacex",
            value:
              "Read more about the latest or next launch by SpaceX",
            inline: true
          },
          { name: "\u200b", value: "\u200b" },
          {
            name: "work",
            value:
              "You can get free money every 12 hours!",
            inline: true
          },
          {
            name: "balance [user ping]",
            value:
              "Shows how much money is in your pocket (or in the pocket of the pinged user).",
            inline: true
          },
          {
            name: "send <user ping> <amount>",
            value:
              "Send the specified amount to the specified user.\n**Note: A fee of 5% per trancaction is applied!**",
            inline: true
          },
          {
            name: "leaderboard",
            value:
              "Shows the current leaderboard of all users (cash and eth seperate)."
          },
          {
            name: "coinflip <{heads | tails}> <bet>",
            value: "Let's you flip a coin. If you're right, you will get your bet back multiplied with a bonus. If you're wrong, you will lose everthing. **Current multiplicator: " + coinflip_multiplicator + "x**"
          },
          { name: "\u200b", value: "\u200b" },
          {
            name: "eth",
            value:
              "You can trade Ethereum in a simulated environment. Execute this command to get more info on what you can do with it.",
            inline: true
          },
          {
            name: "banano",
            value:
              "BANANO STONK (get info about banano token)",
            inline: true
          },
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
    sent.edit(
      embed.setTitle("🏓 Pong!").addFields(
        { name: "Response Time", value: `${diff}ms` },
        { name: "Status", value: "Service is healthy" },
        { name: "Bot Uptime", value: timediff(Date.now(), startDate) },
        {
          name: "Messages since bot start",
          value: `${messageCounter} Messages`,
        },
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
    memuse = (await ((memuse.used / memuse.total) * 100).toFixed(1)) + "%";

    let ping = await si.inetLatency("1.1.1.1");
    ping = (await Math.floor(ping)) + "ms";

    message.channel.send(
      new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("Info and Credits", embedPB)
        .setTitle("Mission Control by ryzetech and ArcticSpaceFox")
        .setDescription("Information about the bot and server health")
        .addFields(
          {
            name: "Hosted by ZAP-Hosting",
            value:
              "Go to https://zap-hosting.com/ryzetech and use our promocode 'ryzetech-a-4247' to get 20% discount on the entire runtime of your next product!",
          },
          { name: "CPU Usage", value: load, inline: true },
          { name: "RAM Use", value: memuse, inline: true },
          { name: "Ping to Cloudflare", value: ping, inline: true },
          { name: "\u200b", value: "\u200b" },
          {
            name: "Special Thanks",
            value: "some-random-api.ml\ncrafatar.com",
            inline: true,
          },
          {
            name: "GitHub Repo",
            value: "https://github.com/ryzetech/Mission-Control",
            inline: true,
          },
          {
            name: "Forked from",
            value:
              "Schrödinger by ryzetech\nhttps://schroedinger.ryzetech.live/",
            inline: true,
          },
          {
            name: "Made by ryzetech and ArcticSpaceFox",
            value: "https://ryzetech.live/ | We love you! <3",
          }
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
    } else if (arg.startsWith("red panda")) {
      // handling red panda seperately because i'm stupid
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
    } else if (arg.startsWith("list")) {
      let foo = "";
      for (let i in animals) foo += i == 0 ? animals[i] : ", " + animals[i];
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
          .setDescription(
            "That animal isn't available in our database (yet)\nCheck **" +
            prefix +
            "animal list** for a list of all animals!"
          )
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
  else if (
    message.content.startsWith(`${prefix}pokedex`) ||
    message.content.startsWith(`${prefix}pokemon`)
  ) {
    let arg = message.content.slice(9);
    message.channel.startTyping(); // do this because this might take a while, people hate it when the bot is sitting around doing seemingly nothing

    try {
      let res = await fetch(
        "https://some-random-api.ml/pokedex?pokemon=" + encodeURIComponent(arg)
      );
      let json = await res.json();

      if (!json.error) {
        // hoping the request doesn't fail

        let typelist = "",
          genderlist = "",
          evoLine = "",
          abilities = "",
          eggGroups = "",
          species = "";

        // processing information into a somewhat pretty format
        // side note: this looks ugly and retarded but does the job so well that i dont want to replace it
        for (let i in json.type)
          typelist += i == 0 ? json.type[i] : ", " + json.type[i];
        for (let i in json.gender)
          genderlist += i == 0 ? json.gender[i] : " / " + json.gender[i];
        for (let i in json.species)
          species += i == 0 ? json.species[i] : " " + json.species[i];
        for (let i in json.family.evolutionLine) {
          evoLine += i == 0 ? "" : " => ";
          evoLine +=
            json.family.evolutionLine[i] ===
              json.name.charAt(0).toUpperCase() + json.name.slice(1)
              ? "**" + json.family.evolutionLine[i] + "**"
              : json.family.evolutionLine[i];
        }
        if (json.family.evolutionLine.length == 0) evoLine = "N/A";
        for (let i in json.abilities)
          abilities += i == 0 ? json.abilities[i] : ", " + json.abilities[i];
        for (let i in json.egg_groups)
          eggGroups += i == 0 ? json.egg_groups[i] : ", " + json.egg_groups[i];

        // sending the stuffz
        message.channel.send(
          new Discord.MessageEmbed()
            .setColor(embedColorStandard)
            .setAuthor("Pokédex", "https://botdata.ryzetech.live/perma/pokeball.png")
            .setTitle(json.name.charAt(0).toUpperCase() + json.name.slice(1))
            .setDescription("**" + species + "**\n" + json.description)
            .setThumbnail(json.sprites.animated)
            .addFields(
              { name: "Type(s)", value: typelist, inline: true },
              { name: "ID", value: json.id, inline: true },
              { name: "Generation", value: json.generation, inline: true },
              { name: "Height", value: json.height, inline: true },
              { name: "Weight", value: json.weight, inline: true },
              {
                name: "Base Experience",
                value: json.base_experience,
                inline: true,
              },
              { name: "Gender distribution", value: genderlist, inline: false },
              { name: "HP", value: json.stats.hp, inline: true },
              { name: "Attack", value: json.stats.attack, inline: true },
              { name: "Defense", value: json.stats.defense, inline: true },
              { name: "Speed", value: json.stats.defense, inline: true },
              {
                name: "Special Attack",
                value: json.stats.sp_atk,
                inline: true,
              },
              {
                name: "Special Defense",
                value: json.stats.sp_def,
                inline: true,
              },
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
            .setAuthor("Pokédex", "https://botdata.ryzetech.live/perma/pokeball.png")
            .setTitle("❌ An error occured! :(")
            .setThumbnail(
              "https://botdata.ryzetech.live/perma/missingno.png"
            )
            .setDescription("Error Message: *" + json.error + "*")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`)
        );
      }
    } catch (error) {
      // fetch error handling
      message.channel.send(
        "Something went terribly wrong. Sry :(\n\nERRMSG:\n" + error.message
      );
      console.error(
        'ERR [EXEC] "' +
        message.content +
        '" - Error: "' +
        error.message +
        '" - Link: https://some-random-api.ml/pokedex?pokemon=' +
        encodeURIComponent(arg)
      );
    }
    message.channel.stopTyping();
  }

  // MC
  else if (message.content.startsWith(`${prefix}mc`)) {
    let arg = message.content.slice(4);
    message.channel.startTyping(); // i'm not going to explain this a second time!

    try {
      let res = await fetch(
        "https://some-random-api.ml/mc?username=" + encodeURIComponent(arg)
      );
      let json = await res.json();

      if (!json.error) {
        // hoping the request doesn't fail

        // preparing embed for easy insertion
        let msg = new Discord.MessageEmbed()
          .setColor(embedColorStandard)
          .setAuthor("MC Fetch", "https://botdata.ryzetech.live/perma/grassblock.png")
          .setTitle(json.username)
          .setThumbnail("https://crafatar.com/avatars/" + json.uuid + "?overlay=true")
          .setImage("https://crafatar.com/renders/body/" + json.uuid + "?overlay=true")
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
          for (let i in json.name_history)
            namelist +=
              i == 0
                ? json.name_history[i].name +
                "\n-> " +
                json.name_history[i].changedToAt
                : "\n\n" +
                json.name_history[i].name +
                "\n-> " +
                json.name_history[i].changedToAt;

          // wrap shit into codebox
          namelist = "```" + namelist + "```";

          // pipe it into the embed's description
          msg.setDescription(
            `${json.uuid}\n\n**Name History (old to new):**\n${namelist}`
          );
        } else {
          // field solution (prettier)

          // init namelist as array for EzFields
          namelist = [];

          // cool solution, i like it
          for (let i in json.name_history)
            namelist.push(
              new EzField(
                json.name_history[i].name,
                json.name_history[i].changedToAt,
                false
              )
            );

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
            .setAuthor("MC Fetch", "https://botdata.ryzetech.live/perma/grassblock.png")
            .setTitle("❌ An error occured! :(")
            .setDescription("Error Message: *" + json.error + "*")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`)
        );
      }
    } catch (error) {
      // fetch error handling
      message.channel.send(
        "Something went terribly wrong. Sry :(\n\nERRMSG:\n" + error.message
      );
      console.error(
        'ERR [EXEC] "' +
        message.content +
        '" - Error: "' +
        error.message +
        '" - Link: https://some-random-api.ml/mc?username=' +
        encodeURIComponent(arg)
      );
    }
    message.channel.stopTyping();
  }

  // AVATAR MOD
  else if (message.content.startsWith(`${prefix}avmod`)) {
    let msg;
    let usr = userident(message);
    let args = message.content.slice(7).toLowerCase();
    let directly_available = [
      "glass",
      "wasted",
      "greyscale",
      "invert",
      "brightness",
      "threshold",
      "sepia",
      "pixelate",
      "red",
      "green",
      "blue",
    ];

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
        .setFooter(`Requested by ${message.author.tag}`);
    }

    // filter handling
    else if (startsWithInArray(args, directly_available)) {
      args = startsWithInArray(args, directly_available); // i know this is stupid lmao
      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription(`Modifier: ${args.toUpperCase()}`)
        .setURL(
          `https://some-random-api.ml/canvas/${args}/?avatar=${usr.user.displayAvatarURL(
            { format: "png" }
          )}`
        )
        .setImage(
          `https://some-random-api.ml/canvas/${args}/?avatar=${usr.user.displayAvatarURL(
            { format: "png" }
          )}`
        )
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    } // side note: this mess saves us approx 90 lines, fuck yeah!

    else if (args.startsWith("invgs")) {
      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription("Modifier: INVERT GREYSCALE")
        .setURL(
          `https://some-random-api.ml/canvas/invertgreyscale/?avatar=${usr.user.displayAvatarURL(
            { format: "png" }
          )}`
        )
        .setImage(
          `https://some-random-api.ml/canvas/invertgreyscale/?avatar=${usr.user.displayAvatarURL(
            { format: "png" }
          )}`
        )
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }

    // special attachment treatment for the last two because sra is kinda slow on these endpoints and (i think) discord has a timeout on embed image requests
    // triggered endpoint
    else if (args.startsWith("triggered")) {
      message.channel.startTyping();

      let att = new Discord.MessageAttachment(
        `https://some-random-api.ml/canvas/triggered/?avatar=${usr.user.displayAvatarURL(
          { format: "png" }
        )}`,
        "a.gif"
      );

      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription("Modifier: TRIGGERED")
        .setURL(
          `https://some-random-api.ml/canvas/triggered/?avatar=${usr.user.displayAvatarURL(
            { format: "png" }
          )}`
        )
        .attachFiles(att)
        .setImage("attachment://a.gif")
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);

      message.channel.stopTyping();
    }

    // lolice endpoint
    else if (args.startsWith("lolice")) {
      message.channel.startTyping();

      let att = new Discord.MessageAttachment(
        `https://some-random-api.ml/canvas/lolice/?avatar=${usr.user.displayAvatarURL(
          { format: "png" }
        )}`,
        "a.png"
      );

      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription("Modifier: LOLICE")
        .setURL(
          `https://some-random-api.ml/canvas/lolice/?avatar=${usr.user.displayAvatarURL(
            { format: "png" }
          )}`
        )
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
        .setDescription(
          "Either you didn't specify a filter, or the one specified wasn't found.\n**To get a list with all filters, type '" +
          prefix +
          "avmod filters'.**\n\n*Usage: " +
          prefix +
          "avmod <filter> [User Ping]*"
        )
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }

    message.channel.send(msg);
  }

  // GENERAL INFO SECTION
  // HACKER NEWS
  else if (message.content.startsWith(`${prefix}news`)) {
    // displaying procesing message due to long fetch times
    let msg = await message.channel.send(
      new Discord.MessageEmbed()
        .setColor(embedColorProcessing)
        .setAuthor("HackerNews", "https://botdata.ryzetech.live/perma/ycomb.png")
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
      let res = await fetch(
        "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty"
      );
      let json = await res.json();

      // set value
      value = json;

      // update cache                                <h, m, s>
      let success = botCacheStorage.set("news", json, 2 * 60 * 60);

      // error log message
      if (!success) {
        console.error(
          'ERR [EXEC] "' +
          message.content +
          '" - Error: Cache error! Failed to get hackernews top stories'
        );
      }
    }

    // get the first "ycomb_story_amount" stories and add them to the ezfield array
    while (i < ycomb_story_amount) {
      let data = botCacheStorage.get(`news_${i}`);

      if (!data) {
        // construct link
        let link =
          "https://hacker-news.firebaseio.com/v0/item/" +
          encodeURIComponent(value[i]) +
          ".json?print=pretty";

        // fetch data and parse
        data = await fetch(link);
        data = await data.json();

        // update the cache
        let success = botCacheStorage.set(
          `news_${i}`,
          data,
          2 * 60 * 60
        );

        // error log
        if (!success) {
          console.error(
            'ERR [EXEC] "' +
            message.content +
            `\" - Error: Cache error! Failed to get hackernews item [${i}]`
          );
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
        .setAuthor("HackerNews", "https://botdata.ryzetech.live/perma/ycomb.png")
        .setTitle("Top Stories")
        .addFields(fields)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
    );
  }

  // SPACEX INFO
  else if (message.content.startsWith(`${prefix}spacex`)) {
    let args = message.content.slice(8);
    let mission_res;

    if (args.startsWith("next")) mission_res = await fetch("https://api.spacexdata.com/v4/launches/next");
    else if (args.startsWith("latest")) mission_res = await fetch("https://api.spacexdata.com/v4/launches/latest");
    else {
      return message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorStandard)
          .setAuthor("❌ Syntax error!", "https://botdata.ryzetech.live/perma/elon.png")
          .setDescription("There are multiple subcommands:")
          .addFields(
            {
              name: "spacex next",
              value: "Gets info about the next launch"
            },
            {
              name: "spacex latest",
              value: "Gets info about the last launch"
            }
          )
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );
    }
    let mission_json = await mission_res.json();

    // millis conversion
    mission_json.date_unix = mission_json.date_unix * 1000;

    // prebake the embed for funny stuff
    let embed = new Discord.MessageEmbed()
      .setColor(embedColorStandard)
      .setAuthor("SpaceX - Launch", "https://botdata.ryzetech.live/perma/elon.png")
      .setTitle(mission_json.name)
      .setThumbnail(
        mission_json.links.patch.small
      )
      .setTimestamp()
      .setFooter(`Requested by ${message.author.tag}`);

    // funny info checks and validation
    if (!mission_json.details) embed.setDescription("No description available");
    else embed.setDescription(mission_json.details);

    // countdown check
    if (mission_json.tbd) embed.addFields(
      {
        name: "Countdown to T-0",
        value: "TO BE DETERMINED",
      }
    );
    else embed.addFields(
      {
        name: "Countdown to T-0",
        value: timediff(
          mission_json.date_unix,
          new Date().getTime(),
          false
        ) + "\n*Accuracy level: " + mission_json.date_precision + "*",
      }
    );

    // booster check
    if (mission_json.cores[0].core === null) {
      embed.addFields(
        {
          name: "Booster Information",
          value: "**NO INFORMATION AVAILABLE**",
        }
      );
    } else {
      let core_res = await fetch("https://api.spacexdata.com/v4/cores/" + mission_json.cores[0].core);
      let core_json = await core_res.json();

      embed.addFields(
        {
          name: "Booster Information",
          value: `Serial NO: ${core_json.serial}\nReuse Counter: ${core_json.reuse_count}\nLast Update: \`${core_json.last_update}\``,
        }
      );
    }

    // launchpad check
    if (mission_json.launchpad === null) {
      embed.addFields(
        {
          name: "Launchpad Information",
          value: "**NO INFORMATION AVAILABLE**"
        }
      );
    } else {
      let launchpad_res = await fetch("https://api.spacexdata.com/v4/launchpads/" + mission_json.launchpad);
      let launchpad_json = await launchpad_res.json();

      embed.addFields(
        {
          name: "Launchpad Information",
          value: `Name: ${launchpad_json.name}\nLocality: \`${launchpad_json.locality}, ${launchpad_json.region}\`\nSuccess Rate: ${launchpad_json.launch_successes}/${launchpad_json.launch_attempts}`
        }
      );
    }

    // landpad check
    if (mission_json.cores[0].landpad === null) {
      embed.addFields(
        {
          name: "Landpad Information",
          value: "**NO INFORMATION AVAILABLE**"
        }
      );
    } else {
      let landpad_res = await fetch("https://api.spacexdata.com/v4/landpads/" + mission_json.cores[0].landpad);
      let landpad_json = await landpad_res.json();

      embed.addFields(
        {
          name: "Landpad Information",
          value: `Name: ${landpad_json.full_name}\nLocality: \`${landpad_json.locality}, ${landpad_json.region}\`\nSuccess Rate: ${landpad_json.landing_successes}/${landpad_json.landing_attempts}`
        }
      );
    }

    // payload check
    if (mission_json.payloads[0] === null) {
      embed.addFields(
        {
          name: "Payload Information",
          value: "**NO INFORMATION AVAILABLE**",
        }
      );
    } else {
      let fieldValue = "";

      for (let index in mission_json.payloads) {
        let payload_res = await fetch("https://api.spacexdata.com/v4/payloads/" + mission_json.payloads[index]);
        let payload_json = await payload_res.json();

        if (payload_json.mass_kg === null) payload_json.mass_kg = "N/A";
        else payload_json.mass_kg += "kg";

        fieldValue += `**-- ${parseInt(index) + 1} --**\n`;
        fieldValue += `Name: ${payload_json.name}\nType: ${payload_json.type}\nOrbit: ${payload_json.orbit}\nMass: ${payload_json.mass_kg}\n\n`
      }

      embed.addFields(
        {
          name: "Payload Information",
          value: fieldValue,
        }
      );
    }

    // dragon capsule check
    if (mission_json.capsules.length > 0) {
      let capsule_res = await fetch("https://api.spacexdata.com/v4/capsules/" + mission_json.capsules[0]);
      let capsule_json = await capsule_res.json();

      let fieldValue = `Type: ${capsule_json.type}\nSerial: ${capsule_json.serial}\nReuse Counter: ${capsule_json.reuse_count}\nLast Update: \`${capsule_json.last_update}\``;

      embed.addFields(
        {
          name: "Dragon Information",
          value: fieldValue
        }
      );
    }

    // god i hate this notation, NEVER USE IT AGAIN!

    message.channel.send(embed);
  }

  // NASA INFO
  else if (message.content.startsWith(`${prefix}nasa`)) {
    let args = message.content.slice(6).toLowerCase();

    if (args.startsWith("apod")) {
      // attempt to load data from cache
      let apod_json = botCacheStorage.get("nasa-apod");

      // if nothing is cached:
      if (!apod_json) {
        let apod_res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${nasa_auth}`);
        apod_json = await apod_res.json();
        nasa_rate = parseInt(apod_res.headers.raw()["x-ratelimit-remaining"][0]);

        // set cache
        let success = botCacheStorage.set("nasa-apod", apod_json, 60 * 60); // TTL = 1h
        if (!success) {
          console.error(
            'ERR [EXEC] "' +
            message.content +
            '" - Error: Cache error! Failed to set cache value for "nasa_apod"'
          );
        }
      }

      let embed = new Discord.MessageEmbed()
        .setColor("#0b3d91")
        .setAuthor("NASA APOD", "https://botdata.ryzetech.live/perma/NASA.png")
        .setTitle(`"${apod_json.title}"`)
        .setDescription(`${apod_json.explanation}\n\n*Date: ${apod_json.date}*\n*© ${apod_json.copyright}*`)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);

      if (apod_json.media_type === "video") {
        embed.setDescription(`${apod_json.explanation}\n\n*Date: ${apod_json.date}*\n*© ${apod_json.copyright}*\n\n=> [VIDEO](${apod_json.url}) <=`)
      }

      return message.channel.send(embed);
    }

    // rover info
    else if (args.startsWith("rover")) {
      args = args.slice(6);

      // define rovers, including random
      let available_rovers = ["curiosity", "opportunity", "spirit", "random"];
      let random_rover = false;

      // get rover
      let rover = startsWithInArray(args, available_rovers);

      // reject invalid rover
      if (!rover) {
        return message.channel.send(
          new Discord.MessageEmbed()
            .setColor(embedColorFail)
            .setAuthor("NASA Rover", "https://botdata.ryzetech.live/perma/NASA.png")
            .setTitle("❌ Invalid Rover!")
            .setDescription(`You can choose between **Curiosity, Opportunity** and **Spirit**.\n*Syntax: ${prefix}nasa rover <rover> <cam>*`)
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`)
        );
      }

      // choose random rover
      if (rover === "random") {
        rover = available_rovers[Math.floor(Math.random() * (available_rovers.length-1))];
        random_rover = true;
      }

      // define cams
      let available_cams;
      rover == "curiosity" ? available_cams = ["mast", "chemcam", "mahli", "mardi"] : available_cams = ["pancam", "minites"];
      available_cams.push("fhaz", "rhaz", "navcam", "random"); // those cams are available on all three rovers, therefore we can add them every time

      // when the rover is randomly chosen, it doesn't make sense to choose the camera
      let cam = args.slice(rover.length + 1);
      cam = (random_rover || cam.startsWith("random")) ? available_cams[Math.floor(Math.random() * (available_cams.length-1))] : cam ;

      // reject invalid cam
      if (!available_cams.includes(cam)) {
        return message.channel.send(
          new Discord.MessageEmbed()
            .setColor(embedColorFail)
            .setAuthor("NASA Rover", "https://botdata.ryzetech.live/perma/NASA.png")
            .setTitle("❌ Invalid Cam!")
            .setDescription(`A matrix of available cams per rover is displayed below. Use the abbreviations!\n*Syntax: ${prefix}nasa rover <rover> <cam>*`)
            .setImage("https://botdata.ryzetech.live/perma/nasarovercams.png")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`)
        );
      }

      message.channel.startTyping();

      // get rover manifest
      let man_json = botCacheStorage.get("nasa-manifest-" + rover);

      // if the manifest has not been cached yet:
      if (!man_json){
        let man_res = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${nasa_auth}`);
        man_json = await man_res.json();

        let success = botCacheStorage.set("nasa-manifest-" + rover, man_json, 60 * 60); // TTL = 1h

        if (!success) {
          console.error(
            'ERR [EXEC] "' +
            message.content +
            '" - Error: Cache error! Failed to set cache value for "nasa-manifest-' + rover + '"'
          );
        }
      }

      // reverse the order to get the latest image
      let cam_data = man_json.photo_manifest.photos.reverse();
      let sol = 0;

      // find latest sol set where the cam has taken an image
      for (let i in cam_data) {
        if (cam_data[i].cameras.includes(cam.toUpperCase())) {
          sol = cam_data[i].sol;
          break;
        }
      }

      // resolve sol data
      let sol_res = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&camera=${cam}&api_key=${nasa_auth}`);
      let sol_json = await sol_res.json();

      // get last image
      let img = sol_json.photos[sol_json.photos.length - 1].img_src;

      message.channel.stopTyping();

      nasa_rate = parseInt(sol_res.headers.raw()["x-ratelimit-remaining"][0]);

      return message.channel.send(
        new Discord.MessageEmbed()
          .setColor("#0b3d91")
          .setAuthor("NASA Rover", "https://botdata.ryzetech.live/perma/NASA.png")
          .setTitle(`${rover.charAt(0).toUpperCase() + rover.slice(1)} ${cam.toUpperCase()} @ SOL ${sol}`)
          .setImage(img)
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );
    }

    else {
      return message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("NASA", "https://botdata.ryzetech.live/perma/NASA.png")
          .setTitle("❌ Syntax error!")
          .setDescription("There are multiple subcommands:")
          .addFields(
            {
              name: "nasa apod",
              value: "Get the Astronomic Picture of the Day"
            },
            {
              name: "nasa rover <rover> <cam>",
              value: "Get the lastest picture of a rover cam on Mars!"
            }
          )
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );
    }
  }

  //// ECONOMY SECTION
  // BANANO
  else if (message.content.startsWith(`${prefix}banano`)) {
    message.channel.startTyping();

    CoinGeckoClient.coins
      .fetch("banano", {})
      .then((d1) => {
        let stuff = d1.data.market_data;
        let ban_img = d1.data.image.large;

        CoinGeckoClient.coins // yes we need this, no i don't know how to do this better
          .fetchMarketChart("banano", { vs_currency: "eur", days: "1" })
          .then((d2) => {
            let prices = d2.data.prices; // get data list

            let plotdata = "a:", highest, lowest, counter = 0;
            prices.forEach(element => {

              if (counter === 0) { // set level values
                lowest = element[1];
                highest = element[1];
                plotdata += element[1];
              }
              else { // level out graph dimensions
                if (element[1] > highest) highest = element[1];
                else if (element[1] < lowest) lowest = element[1];

                plotdata += "," + element[1]; // generate data
              }

              counter++;
            });
            // expand graph view
            let diff = (highest - lowest) / 10;
            highest += diff;
            lowest -= diff;

            let img = ImageCharts() // i know that this is horrible but yolo
              .cht("ls")                                                  // chart type
              .chf("bg,s,2f313600")                                       // background (alpha set to 0, can be changed later)
              .chxt("y")                                                  // visible axis
              .chxs("0,FFFFFF")                                           // axis color
              .chxr("0," + lowest.toFixed(4) + "," + highest.toFixed(4))  // axis range
              .chg("0,50,1,1,FFFFFF")                                     // grid style
              .chtt("Banano 24h €")                                       // title
              .chts("FFFFFF,25")                                          // title style
              .chls("2")                                                  // graph thickness
              .chco("D7BB00")                                             // graph style
              .chd(plotdata)                                              // data
              .chs("999x500");                                            // image size

            // save the image | don't worry about disk space, old images will be cleaned up by cron
            img.toFile(`/usr/services/Mission-Control/data/temp/graph_ban_${exectime}.png`);

            message.channel.send(
              new Discord.MessageEmbed()
                .setColor(embedColorStandard)
                .setAuthor("Crypto Info", "https://botdata.ryzetech.live/perma/CoinGecko.png")
                .setTitle("Banano Stats")
                .setURL("https://www.coingecko.com/en/coins/banano")
                .setThumbnail(ban_img)
                .setImage(
                  `https://botdata.ryzetech.live/temp/graph_ban_${exectime}.png`
                )
                .setDescription(
                  "*Note: The data displayed here can be delayed by up to five minutes.*"
                )
                .addFields(
                  {
                    name: "Current value",
                    value: stuff.current_price.eur + "€"
                  },
                  {
                    name: "Highest value (24h)",
                    value: stuff.high_24h.eur + "€",
                    inline: true,
                  },
                  {
                    name: "Lowest value (24h)",
                    value: stuff.low_24h.eur + "€",
                    inline: true,
                  },
                  {
                    name: "Change (24h)",
                    value: stuff.price_change_percentage_24h.toFixed(2) + "%",
                  }
                )
                .setTimestamp()
                .setFooter(`Requested by ${message.author.tag}`)
            );
          })
          .catch((error) => {
            console.error(
              'ERR [EXEC] "' +
              message.content +
              '" - Error: "' +
              error.message
            );
          })
          .catch((error) => {
            console.error(
              'ERR [EXEC] "' +
              message.content +
              '" - Error: "' +
              error.message
            );
          });
      });

    message.channel.stopTyping();
  }

  // ETH
  // note: this is pretty much a "command subcommand" section because i need some subcommands again later for future item buying and selling
  else if (message.content.startsWith(`${prefix}eth`)) {
    let stuff = market;
    let args = message.content.slice(5);

    // get the user from the db
    let usr = await prisma.user.findUnique({
      where: { id: message.author.id },
    });

    // CURRENT STATS
    if (args.startsWith("stats")) {
      // please check the banano method for documentation, i hate this
      CoinGeckoClient.coins
        .fetchMarketChart("ethereum", { vs_currency: "eur", days: "1" })
        .then((d2) => {
          let prices = d2.data.prices;

          let plotdata = "a:", highest, lowest, counter = 0;
          prices.forEach(element => {

            if (counter === 0) {
              lowest = element[1];
              highest = element[1];
              plotdata += element[1];
            }
            else {
              if (element[1] > highest) highest = element[1];
              else if (element[1] < lowest) lowest = element[1];

              plotdata += "," + element[1];
            }

            counter++;
          });
          let diff = (highest - lowest) / 10;
          highest += diff;
          lowest -= diff;

          let img = ImageCharts() // i know that this is horrible but yolo
            .cht("ls")                                                  // chart type
            .chf("bg,s,2f313600")                                       // background (alpha set to 0, can be changed later)
            .chxt("y")                                                  // visible axis
            .chxs("0,FFFFFF")                                           // axis color
            .chxr("0," + Math.floor(lowest) + "," + Math.ceil(highest)) // axis range
            .chg("0,50,1,1,FFFFFF")                                     // grid style
            .chtt("Ethereum 24h €")                                     // title
            .chts("FFFFFF,25")                                          // title style
            .chls("2")                                                  // graph thickness
            .chco("8B93B3")                                             // graph style
            .chd(plotdata)                                              // data
            .chs("999x500");                                            // image size

          img.toFile(`/usr/services/Mission-Control/data/temp/graph_eth_${exectime}.png`);

          message.channel.send(
            new Discord.MessageEmbed()
              .setColor(embedColorStandard)
              .setAuthor("Crypto Info", "https://botdata.ryzetech.live/perma/CoinGecko.png")
              .setTitle("Ethereum Stats")
              .setURL("https://www.coingecko.com/en/coins/ethereum")
              .setThumbnail(eth_badge)
              .setImage(
                `https://botdata.ryzetech.live/temp/graph_eth_${exectime}.png`
              )
              .setDescription(
                "*Note: The data displayed here can be delayed by up to five minutes. However, you will always play around with this dataset!*"
              )
              .addFields(
                {
                  name: "Current value",
                  value: stuff.current_price.eur + "€"
                },
                {
                  name: "Highest value (24h)",
                  value: stuff.high_24h.eur + "€",
                  inline: true,
                },
                {
                  name: "Lowest value (24h)",
                  value: stuff.low_24h.eur + "€",
                  inline: true,
                },
                {
                  name: "Change (24h)",
                  value: stuff.price_change_percentage_24h.toFixed(2) + "%",
                }
              )
              .setTimestamp()
              .setFooter(`Requested by ${message.author.tag}`)
          );
        })
        .catch((error) => {
          console.error(
            'ERR [EXEC] "' +
            message.content +
            '" - Error: "' +
            error.message
          );
        });
    }

    // BUY FOR AMOUNT
    else if (args.startsWith("buyfor")) {
      let msg;

      // parse amount
      let amount = parseFloat(args.slice(7).replace(",", "."));

      // check if amount is valid
      if (isNaN(amount) || amount <= 0) {
        msg = new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("Trading", embedPB)
          .setTitle("❌ Invalid amount!")
          .setDescription(
            "The specified amount is not a number or invalid.\nPlease try again."
          )
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`);
      } else {
        // check if user has enough money to perform this action
        if (amount > usr.money) {
          msg = new Discord.MessageEmbed()
            .setColor(embedColorFail)
            .setAuthor("Trading", embedPB)
            .setTitle("❌ Invalid amount!")
            .setDescription(
              "The specified amount is too high or your balance is to low."
            )
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
        }

        // execute order
        else {
          usr = await prisma.user.update({
            where: { id: usr.id },
            data: {
              money: {
                decrement: amount,
              },
              eth: {
                increment: amount / price,
              },
            },
          });

          msg = new Discord.MessageEmbed()
            .setColor(embedColorConfirm)
            .setAuthor("Trading", embedPB)
            .setTitle("✅ Transaction confirmed!")
            .setDescription("This is your balance now:")
            .addFields(
              {
                name: "Balance",
                value: usr.money.toFixed(2) + "€",
                inline: true,
              },
              {
                name: "Ethereum",
                value:
                  usr.eth + " (approx. " + (price * usr.eth).toFixed(2) + "€)",
                inline: true,
              }
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
      let amount = parseFloat(args.slice(4).replace(",", "."));

      // check if amount is valid
      if (isNaN(amount) || amount <= 0) {
        msg = new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("Trading", embedPB)
          .setTitle("❌ Invalid amount")
          .setDescription(
            "The specified amount is not a number or invalid.\nPlease try again."
          )
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`);
      } else {
        // check if has enough money to perform this action
        if (amount * price > usr.money) {
          msg = new Discord.MessageEmbed()
            .setColor(embedColorFail)
            .setAuthor("Trading", embedPB)
            .setTitle("❌ Invalid amount")
            .setDescription(
              "The specified amount is too high or your balance is to low."
            )
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
        }

        // execute order
        else {
          usr = await prisma.user.update({
            where: { id: usr.id },
            data: {
              money: {
                decrement: amount * price,
              },
              eth: {
                increment: amount,
              },
            },
          });

          msg = new Discord.MessageEmbed()
            .setColor(embedColorConfirm)
            .setAuthor("Trading", embedPB)
            .setTitle("✅ Transaction confirmed!")
            .setDescription("This is your balance now:")
            .addFields(
              {
                name: "Balance",
                value: usr.money.toFixed(2) + "€",
                inline: true,
              },
              {
                name: "Ethereum",
                value:
                  usr.eth + " (approx. " + (price * usr.eth).toFixed(2) + "€)",
                inline: true,
              }
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
      let amount = parseFloat(args.slice(8).replace(",", "."));

      // check if amount is valid
      if (isNaN(amount) || amount <= 0) {
        msg = new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("Trading", embedPB)
          .setTitle("❌ Invalid amount")
          .setDescription(
            "The specified amount is not a number or invalid.\nPlease try again."
          )
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`);
      } else {
        // check if user has enough eth to perform this action
        if (amount / price > usr.eth) {
          msg = new Discord.MessageEmbed()
            .setColor(embedColorFail)
            .setAuthor("Trading", embedPB)
            .setTitle("❌ Invalid amount")
            .setDescription(
              "The specified amount is too high or your balance is to low."
            )
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
        }

        // execute order
        else {
          usr = await prisma.user.update({
            where: { id: usr.id },
            data: {
              money: {
                increment: amount,
              },
              eth: {
                decrement: amount / price,
              },
            },
          });

          msg = new Discord.MessageEmbed()
            .setColor(embedColorConfirm)
            .setAuthor("Trading", embedPB)
            .setTitle("✅ Transaction confirmed!")
            .setDescription("This is your balance now:")
            .addFields(
              {
                name: "Balance",
                value: usr.money.toFixed(2) + "€",
                inline: true,
              },
              {
                name: "Ethereum",
                value:
                  usr.eth + " (approx. " + (price * usr.eth).toFixed(2) + "€)",
                inline: true,
              }
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
      let amount = parseFloat(args.slice(5).replace(",", "."));

      // check if amount is valid
      if (isNaN(amount) || amount <= 0) {
        msg = new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("Trading", embedPB)
          .setTitle("❌ Invalid amount")
          .setDescription(
            "The specified amount is not a number or invalid.\nPlease try again."
          )
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`);
      } else {
        // check if user has enough eth to perform this action
        if (amount > usr.eth) {
          msg = new Discord.MessageEmbed()
            .setColor(embedColorFail)
            .setAuthor("Trading", embedPB)
            .setTitle("❌ Invalid amount")
            .setDescription(
              "The specified amount is too high or your balance is to low."
            )
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
        }

        // execute order
        else {
          usr = await prisma.user.update({
            where: { id: usr.id },
            data: {
              money: {
                increment: amount * price,
              },
              eth: {
                decrement: amount,
              },
            },
          });

          msg = new Discord.MessageEmbed()
            .setColor(embedColorConfirm)
            .setAuthor("Trading", embedPB)
            .setTitle("✅ Transaction confirmed!")
            .setDescription("This is your balance now:")
            .addFields(
              {
                name: "Balance",
                value: usr.money.toFixed(2) + "€",
                inline: true,
              },
              {
                name: "Ethereum",
                value:
                  usr.eth + " (approx. " + (price * usr.eth).toFixed(2) + "€)",
                inline: true,
              }
            )
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
        }
      }

      message.channel.send(msg);
    }

    // fallback to help message
    else {
      message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorStandard)
          .setAuthor("Trading", embedPB)
          .setTitle("❌ Syntax error!")
          .setDescription("There are multiple subcommands:")
          .addFields(
            { name: "eth stats", value: "Displays the current Ethereum stats" },
            {
              name: "eth buy <amount>",
              value: "Buy the amount of ETH specified with 'amount'.",
            },
            {
              name: "eth buyfor <amount>",
              value: "Buy ETH FOR the amount of money specified with 'amount'.",
            },
            {
              name: "eth sell <amount>",
              value: "Sell the amount of ETH specified with 'amount'.",
            },
            {
              name: "eth sellfor <amount>",
              value:
                "Sell ETH FOR the amount of money specified with 'amount'.",
            }
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
    let usr = await prisma.user.findUnique({
      where: { id: argument.id },
    });

    message.channel.send(
      new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("Coin System", embedPB)
        .setTitle(argument.user.tag + "'s Account")
        .addFields(
          { name: "Balance", value: usr.money.toFixed(2) + "€", inline: true },
          {
            name: "Ethereum",
            value: usr.eth + " (approx. " + (price * usr.eth).toFixed(2) + "€)",
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
    );
  }

  // SEND
  else if (message.content.startsWith(`${prefix}send`)) {
    // Tests for the following pattern and returns search results
    // prefix + send <@273...132> 123
    const pattern = new RegExp(prefix + "send <@!(\\d+)> (\\d+)", "s");
    const regres = pattern.exec(message.content);

    // handle case where pattern fails
    // handle case match is not len 3
    if (regres == null || regres.length !== 3) {
      return message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("Coin System", embedPB)
          .setTitle("❌ Syntax mistake!")
          .setDescription(
            "Sytntax is `" + prefix + "send @<user_to_send_to> <amount>`"
          )
          .addField(
            "`user_to_send_to`:",
            "This should be the user you want the transaction to go to"
          )
          .addField("`amount`:", "The amount you want to send to that user")
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );
    }

    // extract the values
    let [, userid, amount] = regres;
    amount = Number(amount);
    // get users from db
    let userFrom = await prisma.user.findUnique({
      where: { id: message.author.id },
    });
    let userTo = await prisma.user.findUnique({ where: { id: userid } });
    // Check if any value is not initilized
    if (!userTo || !amount || !userFrom) {
      return message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("Coin System", embedPB)
          .setTitle("❌ Transaction failed!")
          .setDescription(
            "We couldnt process your transaction, please contact our support if you think this is a mistake"
          )
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );
    }
    // check if balance is ok
    if (userFrom.money < amount) {
      return message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("Coin System", embedPB)
          .setTitle("❌ Transaction failed!")
          .setDescription(
            "You dont have the balance to cover for that transaction!"
          )
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );
    }

    // calc fee
    const fee = Math.round(amount * 0.05);

    // add fee to pot
    stats = await prisma.stat.update({
      where: { id: 0 },
      data: {
        casinoPot: { increment: fee }
      }
    });

    // transaction
    userFrom = await prisma.user.update({
      where: { id: userFrom.id },
      data: {
        money: {
          decrement: amount,
        },
      },
    });
    userTo = await prisma.user.update({
      where: { id: userTo.id },
      data: { money: { increment: amount - fee } },
    });
    // message after transaction is done
    message.channel.send(
      new Discord.MessageEmbed()
        .setColor(embedColorConfirm)
        .setAuthor("Coin System", embedPB)
        .setTitle("✅ Transaction successfull!")
        .setDescription(
          "You've sent " + amount + " Euros! Please be aware of our 5% fee"
        )
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
    let usr = await prisma.user.findUnique({
      where: { id: message.author.id },
    });

    // if no timestamp
    if (!usr.lastearnstamp) {
      usr = await prisma.user.update({
        where: {
          id: usr.id,
        },
        lastearnstamp: {
          set: new Date().toISOString(),
        },
      });
    }

    if (new Date(usr.lastearnstamp) < new Date().getTime() - p_cooldown) {
      // check if user is in cooldown defined by "p_cooldown"
      // calc amount
      let amount = Math.round(Math.random() * 950 + 50);

      // cooldown the user and calculate new amount
      usr = await prisma.user.update({
        where: {
          id: usr.id,
        },
        data: {
          lastearnstamp: {
            set: new Date().toISOString(),
          },
          money: {
            increment: amount,
          },
        },
      });

      // stats tracking
      stats = await prisma.stat.update({
        where: { id: 0 },
        data: { ecoPayoutTotal: { increment: amount } }
      });

      // display the data
      msg = new Discord.MessageEmbed()
        .setColor(embedColorConfirm)
        .setAuthor("Coin System", embedPB)
        .setTitle("✅ Payout successful!")
        .setDescription("You've got " + amount + " Euros today!")
        .addFields(
          {
            name: "Balance",
            value: usr.money.toFixed(2) + "€",
            inline: true,
          },
          {
            name: "Ethereum",
            value: usr.eth + " (approx. " + (price * usr.eth).toFixed(2) + "€)",
            inline: true,
          }
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
        .addField(
          "Next salary:",
          timediff(
            new Date(usr.lastearnstamp).getTime() + p_cooldown,
            new Date().getTime(),
            true
          )
        )
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
    let topMoney = await prisma.user.findMany({
      orderBy: { money: "desc" },
      take: 10,
    });
    let topEth = await prisma.user.findMany({
      orderBy: { eth: "desc" },
      take: 10,
    });
    // thx prisma issue 702!

    let topMoneyField = "",
      topEthField = "",
      usrCheck;

    // FIXME PLEASE COMMENT THIS SHIT FFS!!!!!!!!!!!!!!!!
    topMoney.forEach((u, i) => {
      if (u.money == 0) {
        topMoneyField += "\n";
      } else {
        usrCheck = client.users.cache.get(u.id);

        topMoneyField += `**${i + 1}** - ${usrCheck ? usrCheck.tag.substring(0, usrCheck.tag.length - 5) : "left"
          } [${u.money.toFixed(2)}€]\n`;
      }
    });
    topEth.forEach((u, i) => {
      if (u.eth == 0) {
        topEthField += "\n";
      } else {
        usrCheck = client.users.cache.get(u.id);

        topEthField += `**${i + 1}** - ${usrCheck ? usrCheck.tag.substring(0, usrCheck.tag.length - 5) : "left"
          } [${u.eth}eth]\n`;
      }
    });

    if (!topEthField || topEthField == "\n") topEthField = "[NO DATA]";
    if (!topMoneyField || topMoneyField == "\n") topMoneyField = "[NO DATA]";

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
    );
  }

  // COINFLIP
  else if (message.content.startsWith(`${prefix}coinflip`)) {
    let sides = ["heads", "tails"];
    let args = message.content.slice(10);

    // get the user from the db
    let usr = await prisma.user.findUnique({
      where: { id: message.author.id },
    });

    // parse amount
    let side = args.slice(0, 5).toLowerCase();
    let amount = parseFloat(args.slice(6).replace(",", "."));

    // check if side is valid
    if (!sides.includes(side)) {
      message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("Coinflip", embedPB)
          .setTitle("❌ Invalid side!")
          .setDescription(
            "The side must be either \"heads\" or \"tails\". Please check your syntax and try again.\n\n*Usage: " + prefix + "coinflip <{heads | tails}> <bet>*"
          )
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );
      return;
    }

    // check if amount is valid
    if (isNaN(amount) || amount <= 0) {
      message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("Coinflip", embedPB)
          .setTitle("❌ Invalid amount!")
          .setDescription(
            "The specified amount is not a number or invalid.\nPlease try again."
          )
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );
      return;
    }
    // check if user has enough money to perform this action
    if (amount > usr.money) {
      message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("Coinflip", embedPB)
          .setTitle("❌ Invalid amount")
          .setDescription(
            "The specified amount is too high or your balance is to low."
          )
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );
      return;
    }

    // predeterming if the user has won
    let won = (Math.floor(Math.random() * 2) == 0);
    // side note: i dont give a shit on what side the user gives me
    // im just determining if they won and display the if the other side if they didnt
    // well, lets hope that nobody will ever look here to verify chances or something...

    usr = await prisma.user.update({
      where: { id: usr.id },
      data: {
        money: {
          decrement: amount,
        },
      },
    });

    let sent = await message.channel.send(
      new Discord.MessageEmbed()
        .setColor(embedColorProcessing)
        .setAuthor("Coinflip", embedPB)
        .setTitle("Flipping Coin...")
        .setThumbnail("https://i.ryzetech.live/spinningcoin.gif")
        .setDescription("**AT RISK:** " + amount + "\n**POSSIBLE WIN:** " + (amount * coinflip_multiplicator))
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
    );


    await setTimeoutPromise(3500);

    // preassembling the embed
    let msg = new Discord.MessageEmbed()
      .setAuthor("Coinflip", embedPB)
      .setTimestamp()
      .setFooter(`Requested by ${message.author.tag}`);

    if (won) {
      usr = await prisma.user.update({
        where: { id: usr.id },
        data: {
          money: {
            increment: amount * coinflip_multiplicator,
          },
        },
      });

      // stats tracking
      stats = await prisma.stat.update({
        where: { id: 0 },
        data: { casinoWinnings: { increment: amount*coinflip_multiplicator } }
      });

      msg
        .setColor(embedColorConfirm)
        .setTitle("🏆 YOU WON!")
        .setDescription("**Side: **" + side.toUpperCase() + "\n**Payout:** " + amount * coinflip_multiplicator + "\n**New Balance:** " + usr.money.toFixed(2));
      sent.edit(msg);
    }
    else {
      // stats tracking
      stats = await prisma.stat.update({
        where: { id: 0 },
        data: {
          casinoLosses: { increment: amount },
          casinoPot: { increment: amount }
        }
      });

      msg
        .setColor(embedColorFail)
        .setTitle("❌ YOU LOST!")
        .setDescription("**Side: **" + ((side === "heads") ? "tails" : "heads").toUpperCase() + "\n**Loss: **" + amount + "\n**New Balance:** " + usr.money.toFixed(2));
      sent.edit(msg);
    }
  }

  //// MOD SECTION
  // old user removal
  // TODO comment this, it is highly retarded
  else if (message.content.startsWith(`${prefix}clearOldUsers`)) {
    if (!message.member.roles.cache.some((role) => modroles.includes(role.id)))
      return;

    let allUsers = await prisma.user.findMany({});
    let rmUsers = [];

    allUsers.forEach((u, i) => {
      if (!checkUserIsStillHere) rmUsers.push(u.id);
    })

    const { _count } = await prisma.user.deleteMany({
      where: {
        id: {
          in: rmUsers
        }
      }
    })

    await message.channel.send(
      new Discord.MessageEmbed()
        .setColor(embedColorProcessing)
        .setAuthor("The inactive User vacuum!", embedPB)
        .setTitle("REMOVED OLD USERS")
        .setDescription("Removed [**" + (_count || "0") + "**] Users from database")
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
    );
  }

  // VS CHECK
  else if (message.content.startsWith(`${prefix}vscheck`)) {
    let usrid;

    // check whether user has the permissions to run this command
    if (message.member.roles.cache.some((role) => modroles.includes(role.id))) {
      // gets the id from the arguments while determining if a user is mentioned or not
      if (typeof message.mentions.members.first() === "undefined")
        usrid = message.content.slice(9);
      else usrid = message.mentions.members.first().user.id;

      // send processing message
      let sent = await message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorProcessing)
          .setAuthor("VS Check", "https://botdata.ryzetech.live/perma/virgin.png")
          .setTitle("Hold on!")
          .setDescription(
            "I'm asking Virgin Slayer about the ban status of this user, give me a second..."
          )
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );

      // ask Virgin Slayer if the user is banned on the global network
      let response = await axios.post("https://dvs.stefftek.de/api/bans", {
        data: { userID: usrid },
      });
      let res = await response.data;

      // if the user is unknown to Virgin Slayer:
      if (res.status === "error" && res.msg === "api.error.notBanned") {
        sent.edit(
          new Discord.MessageEmbed()
            .setColor(embedColorConfirm)
            .setAuthor("VS Check", "https://botdata.ryzetech.live/perma/virgin.png")
            .setTitle("User is not banned!")
            .setDescription("This user is unknown to our global database.")
            .addFields(
              {
                name: "\u200b",
                value: "Ban information provided by https://dvs.stefftek.de/"
              }
            )
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
            .setAuthor("VS Check", "https://botdata.ryzetech.live/perma/virgin.png")
            .setTitle("User is banned!")
            .setDescription(
              "This user is known to us for inappropriate behaviour."
            )
            .addFields(
              { name: "UserID", value: res.data.UserID },
              { name: "Ban Reason", value: res.data.Reason },
              { name: "User Tag at Ban", value: res.data.DisplayName },
              {
                name: "Ban Timestamp",
                value:
                  date + "\n(" + timediff(Date.now(), date.getTime()) + " ago)",
              },
              {
                name: "\u200b",
                value: "Ban information provided by https://dvs.stefftek.de/"
              }
            )
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`)
        );
      }
    } else {
      message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("VS Check", "https://botdata.ryzetech.live/perma/virgin.png")
          .setTitle("❌ Insufficent Permissions!")
          .setDescription("This command is reserved for mods and admins!")
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );
    }
  }

  // EVALUATE LOCAL VARS
  else if (message.content.startsWith(`${prefix}localvars`)) {
    if (!message.member.roles.cache.some((role) => modroles.includes(role.id))) {
      return message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("Debug", embedPB)
          .setTitle("❌ Insufficent Permissions!")
          .setDescription("This command is reserved for mods and admins!")
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );
    }

    message.channel.send(
      "```--- LOCAL VARS ---\nmessageCounter = " + messageCounter +
      "\njoinCounter = " + joinCounter +
      "\nprice = " + price +
      "\nnasa_rate = " + nasa_rate +
      "\n\n--- STATS DB ENTRY ---\nmessagesRead = " + stats.messagesRead +
      "\nusersGreeted = " + stats.usersGreeted +
      "\necoPayoutTotal = " + stats.ecoPayoutTotal +
      "\ncasinoWinnings = " + stats.casinoWinnings +
      "\ncasinoLosses = " + stats.casinoLosses +
      "\ncasinoPot = " + stats.casinoPot +
      "```"
      );
  }

  // random reward for chatting
  else {
    if (Math.round(Math.random() * 4 + 1) === 5 && !message.author.bot) {
      let usr = await prisma.user.update({
        where: { id: message.author.id },
        data: {
          money: {
            increment: Math.round(Math.random() * 8 + 1) / 100,
          },
        },
      });
    }
  }
});

// start this abomination
client.login(token);
