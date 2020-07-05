const Discord = require('discord.js');
const db = require('quick.db');

exports.run = async (client, message, args, msg) => {
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
	}
  
  if (db.has('bots')) {
  if (db.has(`bots.${args[0]}.certificate`) === true) return message.reply("Sorry, there are already Certified bots with this ID.")
  }
  
  message.channel.send(`Successfully Added \`${args[0]}\` To Certificate`)
  client.channels.get(client.settings.kayıt).send(`\`${message.author.tag}\` Has added \`${db.fetch(`bots.${args[0]}.name`)}\` To Certificate https://discord4bots.herokuapp.com/bot/${args[0]}`)
	
  db.set(`bots.${args[0]}.certificate`, "Available") // can i change something like what?
  
};

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: [],
	permLevel: 'special',
	kategori: 'authorized'
}

exports.help = {
	name: 'certificate',
	description: 'Makes the bot in the written ID certified!',
	usage: 'certificate [id]'
}
