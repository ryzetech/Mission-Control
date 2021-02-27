const Discord = require("discord.js");
const client = new Discord.Client();
const si = require("systeminformation");
const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();
const fs = require("fs");
const fetch = require("node-fetch");
const axios = require("axios");
const { prefix, welcomeChannelID, autodelete, modroles, p_cooldown } = require("./config.json");
const { token } = require("./token.json");

const embedColorStandard = "#75d3fc";
const embedColorConfirm = "#16c60c";
const embedColorFail = "#f03a17";
const embedPB = "https://i.ryzetech.live/arctic-mission-control.png";

var messageCounter = 0;
var joinCounter = 0;

var market;
var price = 0;

var currentPolls = [];
var currentVerifications = [];
var jackpotRound;

var userData = [];
var clanData = [];
var db = [];

const startDate = new Date();

//// HELP METHODS
// GET USER FROM MENTIONS
function userident(msg) {
  let arg = msg.mentions.members.first();
  if (typeof (arg) === "undefined") {
    arg = msg.member;
  }
  return arg;
}

// GET DIFFERENCE BETWEEN TO TIMESTAMPS AS TEXT
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

// LOAD THE DB FROM db.json
function loadDB() {
  let stuff = fs.readFileSync("./db.json", "utf8");
  db = JSON.parse(stuff);
  userData = db[0];
  clanData = db[1];
}

// SAVE THE DB TO db.json
function saveDB() {
  fs.writeFileSync("./db.json", JSON.stringify(db), "utf8", (err) => {
    if (err) {
      console.log(`Error writing file: ${err}`);
    } else {
    }
  });
}

// FINDS A USER IN THE DB AND RETURNS THE OBJECT
function finduser(usrid) {
  let result;
  let found = false;
  let i = 0;
  while (found === false && i < userData.length) {
    if (userData[i].u == usrid) {
      // console.log("MATCH")
      found = true;
      result = userData[i];
    }
    else i++;
  }
  if (found) return result;
  else return undefined;
}

function fetchdata() {
  CoinGeckoClient.coins.fetch('ethereum', {}).then(d => {
    market = d.data.market_data;
    price = market.current_price.eur;
  })
    .catch(error => {
      console.log("--- ERR DUMP ---\nFailed: [TIMED] CoinGecko Data Fetch\nError: " + error.message + "\n--- ERR DUMP END ---");
    });
}

//// SUCC CLASSES
class EzField {
  constructor(name, value, inline) {
    this.name = name;
    this.value = value;
    this.inline = inline;
  }
}

class User {
  constructor(user) {
    this.u = user.id;
    this.money = 10000;
    this.eth = 0;
    this.lastearnstamp = 0;
    userData.push(this);
    saveDB();
  }
}

//// BOT MANAGEMENT
// READY EVENT
client.on('ready', () => {
  client.user.setActivity(prefix + "help | made by ryzetech.live | I love you <3");
  loadDB();
  console.log(`Logged in as ${client.user.tag}!`);

  fetchdata();

  setInterval(function () { fetchdata(); }, 60000);
});

// WELCOME MESSAGE
client.on('guildMemberAdd', member => {
  joinCounter++;

  let channel = member.guild.channels.cache.get(welcomeChannelID);

  axios.post('https://dvs.stefftek.de/api/bans', { data: { userID: member.user.id } })
    .then(function (response) {
      let res = response.data;

      if (res.status === "error" && res.msg === "api.error.notBanned") {
        channel.send(`Hey ${member}, welcome on our little spaceship! 🚀`).then(sent => {
          sent.delete({ timeout: autodelete });
        });
      }
      else if (res.status === "success") {
        let date = new Date(res.data.Timestamp);
        channel.send(
          new Discord.MessageEmbed()
            .setColor(embedColorFail)
            .setAuthor("Banned User Alert", embedPB)
            .setTitle("Virgin Slayer Global DB Match")
            .setDescription("An user known for inappropriate behaviour joined.\nYou can view the details down below.")
            .addFields(
              { name: "UserID", value: res.data.UserID },
              { name: "Ban Reason", value: res.data.Reason },
              { name: "User Tag at Ban", value: res.data.DisplayName },
              { name: "Ban Timestamp", value: date + "\n(" + timediff(Date.now(), date.getTime()) + " ago)" },
            )
            .setTimestamp()
            .setFooter(`This Message was sent automagically`)
        )
      }
    });
});

// MESSAGE HANDLER
client.on('message', message => {

  if (!message.author.bot) {
    messageCounter++;
    if (!finduser(message.author)) {
      new User(message.author);
      console.log(userData.length)
      console.log("new user created u stupid fuk")
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
          { name: "work", value: "You can get free money every 24 hours!" },
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

    message.channel.send(
      new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("Mission Control Info", embedPB)
        .setTitle("🏓 Pong!")
        .addFields(
          { name: "Response Time", value: "Calculating...", inline: true },
          { name: "Status", value: "Service is healthy", inline: true },
          { name: "Bot Uptime", value: timediff(Date.now(), startDate) },
          { name: "Messages since bot start", value: `Calculating...` },
          { name: "Joins since bot start", value: `Calculating...` }
        )
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
    ).then(sent => {
      let diff = sent.createdTimestamp - timestamp;
      sent.edit(
        new Discord.MessageEmbed()
          .setColor(embedColorStandard)
          .setAuthor("Mission Control Info", embedPB)
          .setTitle("🏓 Pong!")
          .addFields(
            { name: "Response Time", value: `${diff}ms`, inline: true },
            { name: "Status", value: "Service is healthy", inline: true },
            { name: "Bot Uptime", value: timediff(new Date().getTime(), startDate.getTime()) },
            { name: "Messages since bot start", value: `${messageCounter} Messages` },
            { name: "Joins since bot start", value: `${joinCounter} Users` }
          )
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      )
    });
  }

  // SYS INFO
  else if (message.content.startsWith(`${prefix}info`)) {
    let load, temp, memuse, ping;

    si.cpuCurrentSpeed().then(data => {
      load = data.avg;

      si.mem().then(data => {
        memuse = ((data.used / data.total) * 100).toFixed(1) + "%";

        si.mem().then(data => {
          swapuse = ((data.used / data.total) * 100).toFixed(1) + "%";

          si.inetLatency("1.1.1.1").then(data => {
            ping = Math.floor(data) + "ms";

            si.cpuTemperature().then(data => {
              temp = data.main;
              if (typeof (temp) != "undefined" && temp != -1) temp = temp.toFixed(1) + "°C";
              else temp = "(READ FAILED)";

              message.channel.send(
                new Discord.MessageEmbed()
                  .setColor(embedColorStandard)
                  .setAuthor("Info and Credits", embedPB)
                  .setTitle("Mission Control by ryzetech")
                  .setDescription("Information about the bot and server health")
                  .addFields(
                    { name: "\u200b", value: "\u200b" },
                    { name: "Special Thanks", value: "some-random-api.ml\ncrafatar.com" },
                    { name: "\u200b", value: "\u200b" },
                    { name: "Hosted by ZAP-Hosting", value: "Use promocode 'ryzetech-a-4247' to get 20% discount on the entire runtime of your next product!" },
                    { name: "CPU Usage", value: load, inline: true },
                    { name: "CPU Temp", value: temp, inline: true },
                    { name: "RAM Use", value: memuse },
                    { name: "Ping to Cloudflare", value: ping },
                    { name: "\u200b", value: "\u200b" },
                    { name: "Forked from", value: "Schrödinger by ryzetech\nhttps://schroedinger.ryzetech.live/" },
                    { name: "Made by ryzetech", value: "https://ryzetech.live/ | I love you! <3" }
                  )
                  .setTimestamp()
                  .setFooter(`Requested by ${message.author.tag}`)
              );
            });
          });
        });
      });
    });
  }

  // AVATAR
  else if (message.content.startsWith(`${prefix}avatar`)) {
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
  }

  // SRA SECTION
  // ANIMAL
  else if (message.content.startsWith(`${prefix}animal`)) {
    let animals = ["dog", "cat", "panda", "fox", "koala", "birb"];
    let arg = message.content.slice(8).toLocaleLowerCase();

    if (animals.slice(0, 7).includes(arg)) {
      message.channel.startTyping();
      fetch("https://some-random-api.ml/animal/" + arg)
        .then(res => res.json())
        .then(json => {
          message.channel.send(
            new Discord.MessageEmbed()
              .setColor(embedColorStandard)
              .setAuthor("Animal Fetch: " + arg, embedPB)
              .setDescription(json.fact)
              .setImage(json.image)
              .setTimestamp()
              .setFooter(`Requested by ${message.author.tag}`)
          );
        });
      message.channel.stopTyping();
    }

    else if (arg.startsWith("red panda")) {
      message.channel.startTyping();
      fetch("https://some-random-api.ml/img/red_panda")
        .then(res => res.json())
        .then(json => {
          message.channel.send(
            new Discord.MessageEmbed()
              .setColor(embedColorStandard)
              .setAuthor("Animal Fetch: red panda", embedPB)
              .setImage(json.link)
              .setTimestamp()
              .setFooter(`Requested by ${message.author.tag}`)
          );
        });
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

    else {
      message.channel.send(
        new Discord.MessageEmbed()
          .setColor(embedColorFail)
          .setAuthor("Animal Fetch", embedPB)
          .setTitle("Error")
          .setDescription("That animal isn't available in our database (yet)\nCheck **" + prefix + "animal list** for a list of all animals!")
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      );
    }
  }

  // MEME
  else if (message.content.startsWith(`${prefix}meme`)) {
    message.channel.startTyping();
    fetch("https://some-random-api.ml/meme")
      .then(res => res.json())
      .then(json => {
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
      });
  }

  // POKEDEX / POKEMON
  else if (message.content.startsWith(`${prefix}pokedex`) || message.content.startsWith(`${prefix}pokemon`)) {
    let arg = message.content.slice(9);
    message.channel.startTyping();
    fetch("https://some-random-api.ml/pokedex?pokemon=" + encodeURIComponent(arg))
      .then(res => res.json())
      .then(json => {
        if (!json.error) {
          let typelist = "", genderlist = "", evoLine = "", abilities = "", eggGroups = "", species = "";

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

        else {
          message.channel.send(
            new Discord.MessageEmbed()
              .setColor(embedColorFail)
              .setAuthor("Pokédex", embedPB)
              .setTitle("An error occured! :(")
              .setThumbnail("https://static.wikia.nocookie.net/nintendo/images/8/85/MissingNoNormal.png/revision/latest?cb=20131114211037&path-prefix=en")
              .setDescription("Error Message: *" + json.error + "*")
              .setTimestamp()
              .setFooter(`Requested by ${message.author.tag}`)
          );
        }

      }).catch(error => {
        message.channel.send("Something went terribly wrong. Sry :(\n\nERRMSG:\n" + error.message);
        console.log("----- ERR DUMP -----\nFailed: " + message.content + "\nError: " + error.message + "\nLink: https://some-random-api.ml/pokedex?pokemon=" + encodeURIComponent(arg) + "\n--- ERR DUMP END ---");
      });
    message.channel.stopTyping();
  }

  // MC
  else if (message.content.startsWith(`${prefix}mc`)) {
    let arg = message.content.slice(4);
    message.channel.startTyping();
    fetch("https://some-random-api.ml/mc?username=" + encodeURIComponent(arg))
      .then(res => res.json())
      .then(json => {
        if (!json.error) {
          let namelist = [];
          for (let i in json.name_history) namelist.push(new EzField(json.name_history[i].name, json.name_history[i].changedToAt, false));

          message.channel.send(
            new Discord.MessageEmbed()
              .setColor(embedColorStandard)
              .setAuthor("MC Fetch", embedPB)
              .setTitle(json.username)
              .setDescription(`${json.uuid}\n\n**Name History (old to new):**`)
              .setThumbnail("https://crafatar.com/avatars/" + json.uuid)
              .setImage("https://crafatar.com/renders/body/" + json.uuid)
              .addFields(namelist)
              .setTimestamp()
              .setFooter(`Requested by ${message.author.tag}`)
          );
        }

        else {
          message.channel.send(
            new Discord.MessageEmbed()
              .setColor(embedColorFail)
              .setAuthor("MC Fetch", embedPB)
              .setTitle("An error occured! :(")
              .setDescription("Error Message: *" + json.error + "*")
              .setTimestamp()
              .setFooter(`Requested by ${message.author.tag}`)
          );
        }

        message.channel.stopTyping();
      })
  }

  // AVATAR MOD
  else if (message.content.startsWith(`${prefix}avmod`)) {
    let msg = "error lmao";
    let usr = userident(message);
    let args = message.content.slice(7);

    if (args.startsWith("filters")) {
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
          { name: "bright", value: "pls dont" },
          { name: "threshold", value: "this is cursed" },
          { name: "sepia", value: '"I was born in 1869!"' },
          { name: "pixel", value: "even 144p is luxury" },
          { name: "lolice", value: "you belong in jail" }
        )
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
    }

    else if (args.startsWith("glass")) {
      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription("Modifier: GLASS")
        .setURL(`https://some-random-api.ml/canvas/glass/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setImage(`https://some-random-api.ml/canvas/glass/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }

    else if (args.startsWith("wasted")) {
      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription("Modifier: WASTED")
        .setURL(`https://some-random-api.ml/canvas/wasted/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setImage(`https://some-random-api.ml/canvas/wasted/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }

    else if (args.startsWith("greyscale")) {
      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription("Modifier: GREYSCALE")
        .setURL(`https://some-random-api.ml/canvas/greyscale/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setImage(`https://some-random-api.ml/canvas/greyscale/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }

    else if (args.startsWith("invert")) {
      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription("Modifier: INVERT")
        .setURL(`https://some-random-api.ml/canvas/invert/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setImage(`https://some-random-api.ml/canvas/invert/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }

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

    else if (args.startsWith("bright")) {
      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription("Modifier: BRIGHTNESS")
        .setURL(`https://some-random-api.ml/canvas/brightness/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setImage(`https://some-random-api.ml/canvas/brightness/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }

    else if (args.startsWith("threshold")) {
      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription("Modifier: THRESHOLD")
        .setURL(`https://some-random-api.ml/canvas/threshold/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setImage(`https://some-random-api.ml/canvas/threshold/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }

    else if (args.startsWith("sepia")) {
      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription("Modifier: SEPIA")
        .setURL(`https://some-random-api.ml/canvas/sepia/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setImage(`https://some-random-api.ml/canvas/sepia/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }

    else if (args.startsWith("pixel")) {
      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription("Modifier: PIXELATE")
        .setURL(`https://some-random-api.ml/canvas/pixelate/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setImage(`https://some-random-api.ml/canvas/pixelate/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }

    else if (args.startsWith("red")) {
      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription("Modifier: RED")
        .setURL(`https://some-random-api.ml/canvas/red/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setImage(`https://some-random-api.ml/canvas/red/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }

    else if (args.startsWith("green")) {
      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription("Modifier: GREEN")
        .setURL(`https://some-random-api.ml/canvas/green/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setImage(`https://some-random-api.ml/canvas/green/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }

    else if (args.startsWith("blue")) {
      msg = new Discord.MessageEmbed()
        .setColor(embedColorStandard)
        .setAuthor("AvatarMod", embedPB)
        .setTitle(`${usr.user.tag}' Avatar`)
        .setDescription("Modifier: BLUE")
        .setURL(`https://some-random-api.ml/canvas/blue/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setImage(`https://some-random-api.ml/canvas/blue/?avatar=${usr.user.displayAvatarURL({ format: 'png' })}`)
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }

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

    else {
      msg = new Discord.MessageEmbed()
        .setColor(embedColorFail)
        .setAuthor("Option missing or undefined", embedPB)
        .setDescription("Either you didn't specify a filter, or the one specified wasn't found.\n**To get a list with all filters, type '" + prefix + "avmod filters'.**\n\n*Usage: " + prefix + "avatarmod <filter> [User Ping]*")
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }

    message.channel.send(msg);
  }

  //// CASINO SECTION
  // ETH
  else if (message.content.startsWith(`${prefix}eth`)) {
    CoinGeckoClient.coins.fetch('ethereum', {}).then(d => {
      let stuff = market;
      let args = message.content.slice(5);

      let usr = finduser(message.author.id);

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
        let amount = parseFloat(args.slice(7).replace(',', '.'));
        let msg;

        if (isNaN(amount) || amount <= 0) {
          msg = new Discord.MessageEmbed()
            .setColor(embedColorFail)
            .setAuthor("Invalid amount", embedPB)
            .setDescription("The specified amount is not a number or invalid.\nPlease try again.")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
        }
        else {
          if ((amount) > usr.money) {
            msg = new Discord.MessageEmbed()
              .setColor(embedColorFail)
              .setAuthor("Invalid amount", embedPB)
              .setDescription("The specified amount is too high or your balance is to low.")
              .setTimestamp()
              .setFooter(`Requested by ${message.author.tag}`);
          }
          else {
            usr.money -= amount;
            usr.eth += amount / price;

            msg = new Discord.MessageEmbed()
              .setColor(embedColorConfirm)
              .setAuthor("Transaction confirmed!", embedPB)
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
        let amount = parseFloat(args.slice(4).replace(',', '.'));
        let msg;

        if (isNaN(amount) || amount <= 0) {
          msg = new Discord.MessageEmbed()
            .setColor(embedColorFail)
            .setAuthor("Invalid amount", embedPB)
            .setDescription("The specified amount is not a number or invalid.\nPlease try again.")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
        }
        else {
          if ((amount * price) > usr.money) {
            msg = new Discord.MessageEmbed()
              .setColor(embedColorFail)
              .setAuthor("Invalid amount", embedPB)
              .setDescription("The specified amount is too high or your balance is to low.")
              .setTimestamp()
              .setFooter(`Requested by ${message.author.tag}`);
          }
          else {
            usr.money -= amount * price;
            usr.eth += amount;

            msg = new Discord.MessageEmbed()
              .setColor(embedColorConfirm)
              .setAuthor("Transaction confirmed!", embedPB)
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
        let amount = parseFloat(args.slice(8).replace(',', '.'));
        let msg;

        if (isNaN(amount) || amount <= 0) {
          msg = new Discord.MessageEmbed()
            .setColor(embedColorFail)
            .setAuthor("Invalid amount", embedPB)
            .setDescription("The specified amount is not a number or invalid.\nPlease try again.")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
        }
        else {
          if ((amount / price) > usr.eth) {
            msg = new Discord.MessageEmbed()
              .setColor(embedColorFail)
              .setAuthor("Invalid amount", embedPB)
              .setDescription("The specified amount is too high or your balance is to low.")
              .setTimestamp()
              .setFooter(`Requested by ${message.author.tag}`);
          }
          else {
            usr.money += amount;
            usr.eth -= amount / price;

            msg = new Discord.MessageEmbed()
              .setColor(embedColorConfirm)
              .setAuthor("Transaction confirmed!", embedPB)
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
        let amount = parseFloat(args.slice(5).replace(',', '.'));
        let msg;

        if (isNaN(amount) || amount <= 0) {
          msg = new Discord.MessageEmbed()
            .setColor(embedColorFail)
            .setAuthor("Invalid amount", embedPB)
            .setDescription("The specified amount is not a number or invalid.\nPlease try again.")
            .setTimestamp()
            .setFooter(`Requested by ${message.author.tag}`);
        }
        else {
          if ((amount) > usr.eth) {
            msg = new Discord.MessageEmbed()
              .setColor(embedColorFail)
              .setAuthor("Invalid amount", embedPB)
              .setDescription("The specified amount is too high or your balance is to low.")
              .setTimestamp()
              .setFooter(`Requested by ${message.author.tag}`);
          }
          else {
            usr.money += amount * price;
            usr.eth -= amount;

            msg = new Discord.MessageEmbed()
              .setColor(embedColorConfirm)
              .setAuthor("Transaction confirmed!", embedPB)
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
            .setAuthor("Argument missing", embedPB)
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
    });
  }

  // BALANCE
  else if (message.content.startsWith(`${prefix}balance`)) {
    let argument = userident(message);
    let usr = finduser(argument.user.id);

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

    // FIXME: Debugging info
    console.log(`[DBG]: SEND command invoked - ${message.content}`)
    console.dir(regres)

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
    const userFrom = finduser(message.author.id);
    const userTo = finduser(userid);
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
    new Discord.MessageEmbed()
      .setColor(embedColorConfirm)
      .setAuthor("Coin System", embedPB)
      .setTitle("✅ Transaction successfull!")
      .setDescription("You've sent " + amount + " Euros! Please be aware of our 5% fee")
      .addFields(
        { name: "Amount", value: amount + "€" },
        { name: "Fee   ", value: fee + "€" }
      )
      .setTimestamp()
      .setFooter(`Requested by ${message.author.tag}`);
    // Save changes to database to persist
    saveDB();
  }

  // WORK
  else if (message.content.startsWith(`${prefix}work`)) {
    let user = finduser(message.author.id);
    let msg;

    if (user.lastearnstamp < new Date().getTime() - p_cooldown) {
      let amount = Math.round(Math.random() * 950 + 50);
      user.lastearnstamp = new Date().getTime();
      user.money += amount;
      msg = new Discord.MessageEmbed()
        .setColor(embedColorConfirm)
        .setAuthor("Coin System", embedPB)
        .setTitle("✅ Payout successful!")
        .setDescription("You've got " + amount + " Euros today!")
        .addFields(
          { name: "Balance", value: user.money.toFixed(2) + "€", inline: true },
          { name: "Ethereum", value: user.eth + " (approx. " + (price * user.eth).toFixed(2) + "€)", inline: true }
        )
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
      saveDB();
    }
    else {
      msg = new Discord.MessageEmbed()
        .setColor(embedColorFail)
        .setAuthor("Coin System", embedPB)
        .setTitle("❌ Payout failed!")
        .setDescription("You can't get salary at the moment!")
        .addField("Next salary:", timediff(user.lastearnstamp + p_cooldown, new Date().getTime(), true))
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`);
    }
    message.channel.send(msg);
  }

  // LEADERBOARD
  else if (message.content.startsWith(`${prefix}leaderboard`)) {
    message.channel.send(
      new Discord.MessageEmbed()
        .setColor("#8C8C8C")
        .setAuthor("Leaderboard - Top 25", embedPB)
        .setTitle("Fetching Data...")
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)
    ).then(sent => {
      let yeet = new Map();
      userData.forEach(shit => {
        let sus = client.users.cache.get(shit.u);
        if (!sus) console.log("[WARN] USER ID " + shit.u + " HAS DB ENTRY BUT COULD NOT BE FOUND. SKIPPING...");
        else {
          sus = sus.tag;
          let amogus = parseFloat(shit.money + (shit.eth * price)).toFixed(2);
          yeet.set(sus, amogus);
        }
      });
      let lmao = new Map([...yeet.entries()].sort((a, b) => b[1] - a[1]));

      let meme = 1;
      let xd = [];
      lmao.forEach((value, key, map) => {
        if (meme <= 25) {
          xd.push(new EzField(meme + ". - " + key, value));
          meme++;
        }
      });

      sent.edit(
        new Discord.MessageEmbed()
          .setColor(embedColorStandard)
          .setAuthor("Leaderboard - Top " + xd.length, embedPB)
          .setTitle("Cash and ETH combined")
          .addFields(xd)
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)
      )
    });
  }

  else {
    // random reward for chatting
    if (Math.round(Math.random() * 4 + 1) === 5 && !message.author.bot) {
      let usr = finduser(message.author.id);
      usr.money += (Math.round(Math.random() * 8 + 1) / 100);
    }
  }

  saveDB();
});

client.login(token);
