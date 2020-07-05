const Discord = require('discord.js');
const db = require('quick.db')

exports.run = async (client, message, args, msg) => {
  let prefix = await db.fetch(`${client.settings.prefix}`)
  var embed = new Discord.RichEmbed()
  .setColor('RANDOM')
  .setAuthor("Discord4Bots - information", client.user.avatarURL)
  .addField("Website Creator","CustomTag#0001")
	.addField("Add a bot?","[Click here](https://discord4bots.glitch.me/addbot)")
  .addField("Hosted by","[Glitch](https://glitch.com)")
  .addField("Website","[Click here](https://discord4bots.glitch.me/)")
  .addField("Help Cmds","c!help")
  message.channel.send({embed: embed})
  
};

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: ['help', 'information', 'info'],
	permLevel: 0,
	kategori: 'general'
}

exports.help = {
	name: 'help',
	description: 'Shows information about the system!',
	usage: 'help'
}