const Discord = require('discord.js');
const db = require('quick.db');

exports.run = async (client, message, args, msg) => { // who r u he jappe chill he is fixing the domain
	if(!args[0]) {
		const embed = new Discord.RichEmbed()
			.setDescription(`You must write an ID!`)
			.setColor(client.settings.color)
		message.channel.send({embed})
		return
	}
  
  if(!client.users.has(args[0])) {
		const embed = new Discord.RichEmbed()
			.setDescription(`Invalid ID!`)
			.setColor(client.settings.color)
		message.channel.send({embed})
		return
	}
  
  if(!client.users.get(args[0]).bot) {
		const embed = new Discord.RichEmbed()
			.setDescription(`Sorry, this person is not a bot, what the head?!`)
			.setColor(client.settings.color)
		message.channel.send({embed})
		return
	}
  
	if (db.has('bots')) {
			if (Object.keys(db.fetch('bots')).includes(args[0]) === false)  return message.reply("Sorry, the bot that wrote the ID is missing in the system!")
	} else {
    return message.reply("No bots are in the system!")
  }
  
  let id = client.ayar['botid']
  
  const embed = new Discord.RichEmbed()
  .setTitle("Bot Info")
  .setColor("RANDOM")
  .addField({name: "Bot Name", value:db.fetch(`bots.${id}.name`)})
  .addField({name: "Bot Owner", value:db.fetch(`bots.${id}.owner`)})
  .addField({name: "Short Description", value:db.fetch(`bots.${id}.ShortDesc`)}) // yay yey
  
  message.channel.send(embed)
};

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: ["info", "search"],
	permLevel: 0,
	kategori: 'authorized'
}

exports.help = {
	name: 'botinfo',
	description: 'Get info for a bot!',
	usage: 'botinfo [botid]'
}