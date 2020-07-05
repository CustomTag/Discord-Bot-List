const Discord = require('discord.js')
const util = require('util');
const tokenwarning = `Error: Unexpected token`
const db = require('quick.db');

exports.run = async (client, message, args, msg) => {
  let prefix = await db.fetch(`${client.settings.prefix}`)
	if(!args[0]) {
		const embed = new Discord.RichEmbed()
			.setDescription(`Write code!`)
			.setColor(client.settings.color)
			.setTimestamp()
		message.channel.send({embed})
		return
	}
	const code = args.join(' ');
	

	function clean(text) {
		if (typeof text !== 'string')
			text = require('util').inspect(text, { depth: 0 })
		text = text
			.replace(/`/g, '`' + String.fromCharCode(8203))
			.replace(/@/g, '@' + String.fromCharCode(8203))
		return text;
	};

	const evalEmbed = new Discord.RichEmbed().setColor(client.settings.color)
	try {
		var evaled = clean(await eval(code));
		if(evaled.startsWith('NTQ3M')) evaled = tokenwarning;
		if (evaled.constructor.name === 'Promise') evalEmbed.setDescription(`\`\`\`\n${evaled}\n\`\`\``)
		else evalEmbed.setDescription(`\`\`\`js\n${evaled}\n\`\`\``)
		const newEmbed = new Discord.RichEmbed()
			.addField('📤 Login', `\`\`\`javascript\n${code}\n\`\`\``)
			.addField('📥 Exit', `\`\`\`js\n${evaled}\`\`\``)
			.setColor(client.settings.color)
		message.channel.send(newEmbed);
	}
	catch (err) {
		evalEmbed.addField('There was an error;', `\`\`\`js\n${err}\n\`\`\``);
		evalEmbed.setColor('#FF0000');
		message.channel.send(evalEmbed);
	}
}

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: ["e"],
	permLevel: 4,
	kategori: 'owner'
}

exports.help = {
	name: 'eval',
	description: 'Runs the typed code!',
	usage: 'eval [kod]'
}