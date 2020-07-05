const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const db = require('quick.db');
const useful = require('useful-tools');
client.ayar = db;

client.htmll = require('cheerio');
client.useful = useful;
client.tags = require('html-tags');

let profile = JSON.parse(fs.readFileSync('./profile.json', 'utf8'))
client.profile = profile

client.settings = {
  "prefix": "c!", //prefix
  "oauthSecret": "hCeVH3zaAC_7GYf_tsMac8hq9qGEiIaI", // bot secreti
	"callbackURL": "https://discord4bots.glitch.me/callback", // change the urls of my site with "/ callback"!
	"kayıt": "714504216370085929", // approved, rejected, you have applied, you will write the ID of the channel where the recordings will go
  "color": "RANDOM" // get the color of the embeds from here, something like that
};

client.authorities = ["484010160981934100", "600743415948509216", "343793233815535626", "422456282948042753", "349936436373618689"]// ids of all authorities gelece array // ids of all authorities gelcek array
client.web_officials = ["484010160981934100", "600743415948509216", "343793233815535626", "422456282948042753","349936436373618689"]// ids of web officials future array
client.server_authorities = ["484010160981934100", "600743415948509216", "343793233815535626", "422456282948042753","349936436373618689"]// ids of server authorities future array

//["id", "id2"]

client.on('ready', async () => {
   client.appInfo = await client.fetchApplication();
  setInterval( async () => {
    client.appInfo = await client.fetchApplication();
  }, 60000);
  
   require("./app.js")(client);
  
  client.user.setActivity(`${client.settings.prefix}help & Discord4Bots`, { type:"WATCHING" })
  console.log("Active!")
});

setInterval(() => {

	if (db.has('bots') && db.has('kbots')) {

for (var i = 0; i < Object.keys(db.fetch('kbots')).length; i++) {
for (var x = 0; x < Object.keys(db.fetch('bots')).length; x++) {
var bot = Object.keys(db.fetch('bots'))[x]
var user = Object.keys(db.fetch('kbots'))[i]
if (db.has(`vote.${bot}.${user}`)) {
   setTimeout(() => {
      db.delete(`votes.${bot}.${user}`)
    }, require('ms')(`${client.useful.seg(db.fetch(`vote.${bot}.${user}`), 3)}h`));
}
}
}

	}

}, 10000);

client.on("guildMemberAdd", member => {
      if (member.user.bot === true) {
          member.addRole(member.guild.roles.find(r=>r.name==='Bots').id) //bot role
       } else {
          member.addRole(member.guild.roles.find(r=>r.name==='Members').id) //member role
       }
});

const chalk = require('chalk')

client.commands = new Discord.Collection()
client.aliases = new Discord.Collection()
fs.readdir(`./commands/`, (err, files) => {
	let jsfiles = files.filter(f => f.split(".").pop() === "js")

	if(jsfiles.length <= 0) {
		console.log("Discord4Bots! I couldn't find any scripts!")
	} else {
		if (err) {
			console.error("Error! There is no name or aliases part of a command!")
		}
		console.log(`${jsfiles.length} command will be loaded`)

		jsfiles.forEach(f => {
			let props = require(`./commands/${f}`)
			client.commands.set(props.help.name, props)
			props.conf.aliases.forEach(alias => {
				client.aliases.set(alias, props.help.name)
			})
			console.log(`Installed command: ${props.help.name}`)
		})
	}
});

client.on("message", async message => {

	if (message.author.bot) return
	if (!message.content.startsWith('c!')) return
	var command = message.content.split(' ')[0].slice('c!'.length)
	var args = message.content.split(' ').slice(1)
	var cmd = ''

	if (client.commands.has(command)) {
		var cmd = client.commands.get(command)
	} else if (client.aliases.has(command)) {
		var cmd = client.commands.get(client.aliases.get(command))
	}

	if (cmd) {
    if (cmd.conf.permLevel === 'special') { // you can use that command just by web officials
      if (client.authorities.includes(message.author.id) === false) {
        const embed = new Discord.RichEmbed()
					.setDescription(`Sorry, you are not a WebSite officer. Do not deal with silly things!`)
					.setColor(client.settings.color)
					.setTimestamp()
				message.channel.send(embed)
				return
      }
    }
    
		if (cmd.conf.permLevel === 1) {
			if (!message.member.hasPermission("MANAGE_MESSAGES")) {
				const embed = new Discord.RichEmbed()
					.setDescription(`You learn to manage messages first and then use this command.`)
					.setColor(client.settings.color)
					.setTimestamp()
				message.channel.send(embed)
				return
			}
		}
		if (cmd.conf.permLevel === 2) {
			if (!message.member.hasPermission("KICK_MEMBERS")) {
				const embed = new Discord.RichEmbed()
					.setDescription(`You are not competent to discard members.`)
					.setColor(client.settings.color)
					.setTimestamp()
				message.channel.send(embed)
				return
			}
		}
		if (cmd.conf.permLevel === 3) {
			if (!message.member.hasPermission("ADMINISTRATOR")) {
				const embed = new Discord.RichEmbed()
					.setDescription(`Insufficient authority.`)
					.setColor(client.settings.color)
					.setTimestamp()
				message.channel.send(embed)
				return
			}
		}
		if (cmd.conf.permLevel === 4) {
			const x = await client.fetchApplication()
      var arr = [x.owner.id, '484010160981934100']
			if (!arr.includes(message.author.id)) {
				const embed = new Discord.RichEmbed()
					.setDescription(`Your competence is insufficient.`)
					.setColor(client.settings.color)
					.setTimestamp()
				message.channel.send(embed)
				return
			}
		}
		if (cmd.conf.enabled === false) {
			const embed = new Discord.RichEmbed()
				.setDescription(`This command is disabled.`)
				.setColor(client.settings.color)
				.setTimestamp()
			message.channel.send(embed)
			return
		}
		if(message.channel.type === "dm") {
			if (cmd.conf.guildOnly === true) {
				const embed = new Discord.RichEmbed()
					.setDescription(`You cannot use this command in private messages.`)
					.setColor(client.settings.color)
					.setTimestamp()
				message.channel.send(embed)
				return
			}
		}
		cmd.run(client, message, args)
	}
});

client.login(process.env.TOKEN)