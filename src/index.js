require("dotenv").config();
require("colors");

const { API } = require("vandal.js");

const Eris = require("eris");
const bot = new Eris(process.env.TOKEN);

bot.on("ready", () => {
  console.log("[" + "LOGGED".green + "]" + " Le bot est connecté");
});

bot.on("messageCreate", async (message) => {
  if (message.content.startsWith("^info")) {
    try {
      const args = message.content.slice("^".length).trim().split(/ +/g);
      const user_name_tag = args[1].split("#");

      const [user_name, user_tag] = user_name_tag;
      const infos = await API.fetchUser(user_name, user_tag);

      const { name, avatar, rank, peakRank } = infos.info();
      const {
        kills,
        kDRatio,
        matchesWinPct,
        killsPerRound,
        damagePerRound,
        headshotsPercentage,
      } = infos.ranked();

      const { timePlayed } = infos.gamemodes().Competitive;
      const agents = infos.agents();

      const allFields = [
        { name: "Rank", value: romain(rank) },
        {
          name: "Peak Rank (all time)",
          value: romain(peakRank),
        },
        {
          name: "Playtime",
          value: formatStr(`${(timePlayed / 3600).toFixed(0)} heure(s)`),
        },
        {
          name: "Degat / Round",
          value: formatInt(damagePerRound, 1),
        },
        {
          name: "Kill / Round",
          value: formatInt(killsPerRound, 1),
        },
        {
          name: "K/D Ratio",
          value: formatInt(kDRatio, 2),
        },
        {
          name: "Headshot",
          value: formatStr(`${headshotsPercentage.toFixed(1)}%`),
        },
        {
          name: "Win",
          value: formatStr(`${matchesWinPct.toFixed(1)}%`),
        },
        {
          name: "Kills",
          value: formatInt(kills, 0),
        },
        {
          name: "Agent le + joué",
          value: formatStr(
            `${mostPlayedAgent(agents).name} (${(
              mostPlayedAgent(agents).time / 3600
            ).toFixed(1)} heures)`
          ),
        },
      ];

      bot.createMessage(message.channel.id, {
        embeds: [
          {
            color: 0xfcb603,
            title: name + " - Compétition (cet act)",
            author: {
              icon_url: message.author.avatarURL,
              name: `Valorant Tracker`,
            },

            thumbnail: { url: avatar },
            fields: allFields.map(({ name, value }) => {
              return { name, value, inline: true };
            }),

            footer: {
              text: new Date().toLocaleString(),
              icon_url: bot.user.avatarURL,
            },
          },
        ],
      });
    } catch {
      bot.createMessage(message.channel.id, {
        embeds: [
          {
            color: 0xff0000,
            author: { name: "Impossible de trouver ce profil" },
          },
        ],
      });
    }
  }
});

bot.connect();

function formatInt(value, cs) {
  return String(value).indexOf(".") === -1
    ? `\`\`\`css\n${String(value)}\`\`\``
    : `\`\`\`css\n${String(value.toFixed(cs))}\`\`\``;
}

function formatStr(value) {
  return `\`\`\`css\n${value}\`\`\``;
}

function romain(str) {
  const [rank, index] = str.split(" ");

  return rank + " " + "I".repeat(index);
}

function mostPlayedAgent(agents) {
  const result = { time: 0, name: "" };

  const names = Object.keys(agents);
  const values = Object.values(agents);

  names.map((_, index) => {
    if (values[index].timePlayed > result.time) {
      result.time = values[index].timePlayed;
      result.name = names[index];
    }
  });

  return result;
}
