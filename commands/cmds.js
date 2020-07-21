const Discord = require('discord.js');
const db = require('quick.db')
const fs = require('fs')

exports.run = async (client, message, args, msg) => {
  var prefix = await db.fetch(`${client.settings.prefix}`)
  fs.readdir(__dirname, async (err, files) => {
    var jsfiles = files.filter(f => f.split(".").pop() === "js")
    var embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setAuthor("Discord4Bots - Commands", client.user.avatarURL)
    jsfiles.forEach(async f => {
      let props = require('./{f}')
      embed.addField(prefix + props.help.name, props.help.description)
    })  
    message.channel.send({embed: embed})
  })
};

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: ['cmds', 'commands', 'command'],
	permLevel: 0,
	kategori: 'general'
}

exports.help = {
	name: 'cmds',
	description: 'All commands!',
	usage: 'cmds'
}