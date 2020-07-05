const request = require('request');
const db = require('quick.db');
const fs = require('fs');

const url = require("url");
const path = require("path");

const Discord = require("discord.js");

var express = require('express');
var app = express();
const moment = require("moment");
require("moment-duration-format");

const passport = require("passport");
const session = require("express-session");
const LevelStore = require("level-session-store")(session);
const Strategy = require("passport-discord").Strategy;

const helmet = require("helmet");

const md = require("marked");

module.exports = (client) => {

const templateDir = path.resolve(`${process.cwd()}${path.sep}html`);

app.use("/css", express.static(path.resolve(`${templateDir}${path.sep}css`)));

passport.serializeUser((user, done) => {
done(null, user);
});
passport.deserializeUser((obj, done) => {
done(null, obj);
});

passport.use(new Strategy({
clientID: client.user.id,
clientSecret: client.settings.oauthSecret,
callbackURL: client.settings.callbackURL,
scope: ["identify"]
},
(accessToken, refreshToken, profile, done) => {
process.nextTick(() => done(null, profile));
}));

app.use(session({
secret: '123',
resave: false,
saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());

app.locals.domain = process.env.PROJECT_DOMAIN;

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 
extended: true
})); 

function checkAuth(req, res, next) {
if (req.isAuthenticated()) return next();
req.session.backURL = req.url;
res.redirect("/login");
}

const renderTemplate = (res, req, template, data = {}) => {
const baseData = {
bot: client,
path: req.path,
user: req.isAuthenticated() ? req.user : null
};
res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
};

app.get("/login", (req, res, next) => {
if (req.session.backURL) {
req.session.backURL = req.session.backURL;
} else if (req.headers.referer) {
const parsed = url.parse(req.headers.referer);
if (parsed.hostname === app.locals.domain) {
req.session.backURL = parsed.path;
}
} else {
req.session.backURL = "/";
}
next();
},
passport.authenticate("discord"));

app.get("/connection-error", (req, res) => {
renderTemplate(res, req, "autherror.ejs");
});

app.get("/callback", passport.authenticate("discord", { failureRedirect: "/autherror" }), async (req, res) => {
if (req.session.backURL) {
const url = req.session.backURL;
req.session.backURL = null;
res.redirect(url);
} else {
res.redirect("/");
}
});

app.get("/logout", function(req, res) {
req.session.destroy(() => {
req.logout();
res.redirect("/");
});
});

app.get("/", (req, res) => {
renderTemplate(res, req, "index.ejs");
});
  
  app.get("/purchase", (req, res) => { renderTemplate (res, req, "purchase.ejs") });

app.get("/certificate", (req, res) => {

renderTemplate (res, req, "certificate.ejs");
});

app.get("/about", (req, res) => {
  
renderTemplate(res, req, "about.ejs");
});

app.get("/bots", (req, res) => {
 
renderTemplate(res, req, "bots.ejs")
});

app.get("/management/error", (req, res) => {
  
renderTemplate(res, req, "fault.ejs")
});

app.get("/addbot/error", (req, res) => {
 
renderTemplate(res, req, "failed.ejs")
});

app.get("/addbot", checkAuth, (req, res) => {
 
renderTemplate(res, req, "addbot.ejs")
});

app.post("/addbot", checkAuth, (req, res) => {

let ayar = req.body

if (ayar === {} || !ayar['botid'] || !ayar['prefix'] || !ayar['library'] || !ayar['short-description'] || !ayar['long-description'] || !ayar['label']) return res.redirect('/management/error')

let ID = ayar['botid']

if (db.has('bots')) {
    if (Object.keys(db.fetch('bots')).includes(ID) === true) return res.redirect('/addbot/error')
}
  
  var tag = ''
  if (Array.isArray(ayar['label']) === true) {
    var tag = ayar['label']
  } else {
    var tag = new Array(ayar['label'])
  }

request({
url: `https://discordapp.com/api/v7/users/${ID}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
var sistem = JSON.parse(body)

db.set(`bots.${ID}.id`, sistem.id)
db.set(`bots.${ID}.name`, sistem.username+"#"+sistem.discriminator)

db.set(`bots.${ID}.avatar`, `https://cdn.discordapp.com/avatars/${sistem.id}/${sistem.avatar}.png`)

request({
url: `https://discordapp.com/api/v7/users/${req.user.id}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
var owner = JSON.parse(body)

db.set(`bots.${ID}.prefix`, ayar['prefix'])
db.set(`bots.${ID}.library`, ayar['library'])
db.set(`bots.${ID}.owner`, owner.username+"#"+owner.discriminator)
db.set(`bots.${ID}.ownerid`, owner.id)
db.set(`bots.${ID}.ShortDesc`, ayar['short-description'])
db.set(`bots.${ID}.longexplanation`, ayar['long-description'])
db.set(`bots.${ID}.tag`, tag)
if (ayar['botsite']) {
db.set(`bots.${ID}.site`, ayar['botsite'])
}
if (ayar['github']) {
db.set(`bots.${ID}.github`, ayar['github'])
}
if (ayar['botsupport']) {
db.set(`bots.${ID}.support`, ayar['botsupport'])
}

db.set(`kbots.${req.user.id}.${ID}`, db.fetch(`bots.${ID}`))

res.redirect("/user/"+req.params.userID+"/panel");

client.channels.get(client.settings.kayıt).send(`\`${req.user.username}#${req.user.discriminator}\` just added \`${sistem.username}#${sistem.discriminator}\` https://discord4bots.herokuapp.com/bot/${db.fetch(`bots.${ID}.id`)}`)

if (client.users.has(db.fetch(`bots.${ID}.ownerid`)) === true) {
client.users.get(db.fetch(`bots.${ID}.ownerid`)).send(`\`${db.fetch(`bots.${ID}.name`)}\` Has been added to pending https://discord4bots.herokuapp.com/bot/${db.fetch(`bots.${ID}.id`)}`)
}

}})
}})

});

app.get("/users", (req, res) => {
  renderTemplate(res, req, "users.ejs")
});

app.get("/user/:userID", (req, res) => {

  request({
    url: `https://discordapp.com/api/v7/users/${req.params.userID}`,
    headers: {
      "Authorization": `Bot ${process.env.TOKEN}`
    },
  }, function(error, response, body) {
    if (error) return console.log(error)
    else if (!error) {
      var kisi = JSON.parse(body)

      renderTemplate(res, req, "user.ejs", {kisi})
    };
  });

});

app.get("/user/:userID/profile", (req, res) => {

  request({
    url: `https://discordapp.com/api/v7/users/${req.params.userID}`,
    headers: {
      "Authorization": `Bot ${process.env.TOKEN}`
    },
  }, function(error, response, body) {
    if (error) return console.log(error)
    else if (!error) {
      var kisi = JSON.parse(body)

      renderTemplate(res, req, "profile.ejs", {kisi})
    };
  });

});

app.get("/user/:userID/profile/adjust", checkAuth, (req, res) => {

  renderTemplate(res, req, "adjust.ejs")

});

app.post("/user/:userID/profile/adjust", checkAuth, (req, res) => {

  if (req.params.userID !== req.user.id) return res.redirect('/');

  var profil = JSON.parse(fs.readFileSync('./profile.json', 'utf8'));

  var libs = ''
  if (Array.isArray(req.body['libs']) === true) {
    var libs = req.body['libs']
  } else {
    var libs = new Array(req.body['libs'])
  }

  request({
    url: `https://discordapp.com/api/v7/users/${req.params.userID}`,
    headers: {
      "Authorization": `Bot ${process.env.TOKEN}`
    },
  }, function(error, response, body) {
    if (error) return console.log(error)
    else if (!error) {
      var kisi = JSON.parse(body)

  var veri = JSON.parse(`{
  "tag": "${kisi.username}#${kisi.discriminator}",
  "name": "${req.body['name']}",
  "age": "${req.body['age']}",
  "bio": "${req.body['bio']}",
  "favlib": "${req.body['favlib']}",
  "libs": "${libs}",
  "avatar": "https://cdn.discordapp.com/avatars/${kisi.id}/${kisi.avatar}.png"
  }`)

  profile[req.user.id] = veri;

  var obj = JSON.stringify(profile)

  fs.writeFile('./profile.json', obj)

  res.redirect('/user/'+req.user.id)

    }
  })

});

app.get("/user/:userID/panel", checkAuth, (req, res) => {

renderTemplate(res, req, "panel.ejs")

});

app.get("/user/:userID/panel/:botID/edit", checkAuth, (req, res) => {

var id = req.params.botID


renderTemplate(res, req, "edit.ejs", {id})

});


app.post("/user/:userID/panel/:botID/edit", checkAuth, (req, res) => {

let ayar = req.body
let ID = req.params.botID
let s = req.user.id

var tag = ''
  if (Array.isArray(ayar['label']) === true) {
    var tag = ayar['label']
  } else {
    var tag = new Array(ayar['label'])
  }

request({
url: `https://discordapp.com/api/v7/users/${ID}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
var sistem = JSON.parse(body)

db.set(`bots.${ID}.name`, sistem.username+"#"+sistem.discriminator)

db.set(`bots.${ID}.avatar`, `https://cdn.discordapp.com/avatars/${sistem.id}/${sistem.avatar}.png`)

request({
url: `https://discordapp.com/api/v7/users/${req.user.id}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
var owner = JSON.parse(body)
db.set(`bots.${ID}.prefix`, ayar['prefix'])
db.set(`bots.${ID}.library`, ayar['library'])
db.set(`bots.${ID}.owner`, owner.username+"#"+owner.discriminator)
db.set(`bots.${ID}.ownerid`, owner.id)
db.set(`bots.${ID}.ShortDesc`, ayar['short-description'])
db.set(`bots.${ID}.longexplanation`, ayar['long-description'])
db.set(`bots.${ID}.tag`, tag)
if (ayar['botsite']) {
db.set(`bots.${ID}.site`, ayar['botsite'])
}
if (ayar['github']) {
db.set(`bots.${ID}.github`, ayar['github'])
}
if (ayar['botsupport']) {
db.set(`bots.${ID}.support`, ayar['botsupport'])
}

res.redirect("/user/"+req.params.userID+"/panel");

client.channels.get(client.settings.kayıt).send(`\`${req.user.username}#${req.user.discriminator}\` Has Edited \`${sistem.username}#${sistem.discriminator}\` https://discord4bots.herokuapp.com/bot/${db.fetch(`bots.${ID}.id`)}`)
}

})
}})

});

app.get("/bot/:botID/report", checkAuth, (req, res) => {

renderTemplate (res, req, "report.ejs");
});

app.post("/bot/:botID/report", checkAuth, (req, res) => {

let ayar = req.body

if(ayar['mesaj-1']) {
db.push(`bots.${req.params.botID}.reports`, JSON.parse(`{ "report":"${ayar['mesaj-1']}" }`))
client.channels.get('715618857946972191').send(`User Name: \`${req.user.username}#${req.user.discriminator}\` Reported bot \`${db.fetch(`bots.${req.params.botID}.name`)}\` For Reason \n**Reason:** \`${ayar['mesaj-1']}\``)
}
if(ayar['mesaj-2']) {
db.push(`bots.${req.params.botID}.reports`, JSON.parse(`{ "report":"${ayar['mesaj-2']}" }`))
client.channels.get('715618857946972191').send(`User Name: \`${req.user.username}#${req.user.discriminator}\` Reported bot \`${db.fetch(`bots.${req.params.botID}.name`)}\` For Reason \n**Reason:** \`${ayar['mesaj-2']}\``)
}

res.redirect('/bot/'+req.params.botID);
});

app.get("/user/:userID/panel/:botID/delete", checkAuth, (req, res) => {
  var id = req.params.botID
  renderTemplate(res, req, "delete.ejs", {id}) 
});

app.post("/user/:userID/panel/:botID/delete", checkAuth, (req, res) => {

let ID = req.params.botID

db.delete(`bots.${ID}`) 
db.delete(`kbots.${req.user.id}.${ID}`)

res.redirect("/user/"+req.params.userID+"/panel");
});

app.get("/bot/:botID", (req, res) => {
var id = req.params.botID

request({
url: `https://discordapp.com/api/v7/users/${id}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
var sistem = JSON.parse(body)

if (db.fetch(`${id}.avatar`) !== `https://cdn.discordapp.com/avatars/${sistem.id}/${sistem.avatar}.png`) {
db.set(`${id}.avatar`, `https://cdn.discordapp.com/avatars/${sistem.id}/${sistem.avatar}.png`)
}

}
})

renderTemplate(res, req, 'bot.ejs', {id})

});

app.get("/bot/:botID/error", (req, res) => {
renderTemplate(res, req, "error.ejs")
});

app.get("/bot/:botID/vote", checkAuth, (req, res) => {

var id = req.params.botID
let user = req.user.id

var hour = `${new Date().getHours() + 12}:${new Date().getMinutes()}:${new Date().getSeconds()}`

if (db.has(`votes.${id}.${user}`) === true) {
  if (db.fetch(`vote.${id}.${user}`) !== hour) {
    res.redirect('/bot/'+req.params.botID+'/error')
    return
  } else if (db.fetch(`vote.${id}.${user}`) === hour) {
  db.add(`bots.${id}.vote`, 1)
  db.set(`votes.${id}.${user}`, hour)
  }
} else {
  db.add(`bots.${id}.vote`, 1)
  db.set(`vote.${id}.${user}`, hour)
}

res.redirect('/bot/'+req.params.botID)

});
  
  app.get("/authorized/error", (req, res) => {renderTemplate(res, req, "error.ejs")})

app.get("/authorized", checkAuth, (req, res) => {
  if(!client.authorities.includes(req.user.id) ) return res.redirect('/authorized/error')
renderTemplate(res, req, "authorized.ejs") 
});

app.get("/botmanager/approve/:botID", checkAuth, (req, res) => {
  if(!client.authorities.includes(req.user.id) ) return res.redirect('/authorized/error')
let id = req.params.botID

db.set(`bots.${id}.status`, 'Approved')

res.redirect("/authorized")

client.channels.get(client.settings.kayıt).send(`\`${db.fetch(`bots.${id}.name`)}\` Was Approved https://discord4bots.herokuapp.com/bot/${db.fetch(`bots.${id}.id`)}`)

if (client.users.has(db.fetch(`bots.${id}.ownerid`)) === true) {
client.users.get(db.fetch(`bots.${id}.ownerid`)).send(`\`${db.fetch(`bots.${id}.name`)}\` Has been approved! https://discord4bots.herokuapp.com/bot/${db.fetch(`bots.${id}.id`)}`)
}

});

app.get("/botmanager/wait/:botID", checkAuth, (req, res) => {
  if(!client.authorities.includes(req.user.id) ) return res.redirect('/authorized/error')
let id = req.params.botID

db.set(`bots.${id}.status`, 'Pending')

res.redirect("/authorized")

client.channels.get(client.settings.kayıt).send(`\`${db.fetch(`bots.${id}.owner`)}\` just added \`${db.fetch(`bots.${id}.name`)}\` To pending https://discord4bots.herokuapp.com/bot/${db.fetch(`bots.${id}.id`)}`)

if (client.users.has(db.fetch(`bots.${id}.ownerid`)) === true) {
client.users.get(db.fetch(`bots.${id}.ownerid`)).send(`\`${db.fetch(`bots.${id}.name`)}\` Os under Pending/Review!`)
}

});

app.get("/botmanager/rejected/:botID", checkAuth, (req, res) => {
  if(!client.authorities.includes(req.user.id) ) return res.redirect('/authorized/error')
  renderTemplate(res, req, "rejected.ejs")
});

app.post("/botmanager/rejected/:botID", checkAuth, (req, res) => {
  if(!client.authorities.includes(req.user.id) ) return res.redirect('/authorized/error')
  let id = req.params.botID
  
  db.set(`bots.${id}.status`, 'Removed')
  
  res.redirect("/authorized")
  
  client.channels.get(client.settings.kayıt).send(`\`${req.user.username}#${req.user.discriminator}\` declined/removed \`${db.fetch(`bots.${id}.name`)}\` Reason: \`${req.body['red-reason']}\``)
  
  if (client.users.has(db.fetch(`bots.${id}.ownerid`)) === true) {
  client.users.get(db.fetch(`bots.${id}.ownerid`)).send(`\`${db.fetch(`bots.${id}.name`)}\` Was declined/removed due to \`${req.body['red-reason']}\``)
  }

  });

//API
  
app.get("/api", (req, res) => {
  renderTemplate(res, req, "api.ejs")
});

app.get("/api/bots", (req, res) => {
  res.json({
    error: 'Write a bot ID.'
  });
});

app.get("/api/bots/:botID/votes", (req, res) => {
  res.json({
    error: 'Write a user ID.'
  });
});

app.get("/api/bots/:botID", (req, res) => {
   var id = req.params.botID

   if (db.has('bots')) {
      if (Object.keys(db.fetch('bots')).includes(id) === false) {
     res.json({
       error: 'A bot with the ID you typed is not in the system.'
     });
   }
  }

res.json({
name: db.fetch(`bots.${id}.name`),
id: id,
avatar: db.fetch(`bots.${id}.avatar`),
prefix: db.fetch(`bots.${id}.prefix`),
library: db.fetch(`bots.${id}.library`),
owner: db.fetch(`bots.${id}.owner`),
ownerid: db.fetch(`bots.${id}.ownerid`),
short_description: db.fetch(`bots.${id}.ShortDesc`),
long_explanation: db.fetch(`bots.${id}.longexplanation`),
labels: db.fetch(`bots.${id}.tag`),
support_server: db.fetch(`bots.${id}.support`) || 'Unspecified',
website: db.fetch(`bots.${id}.site`) || 'Unspecified',
github: db.fetch(`bots.${id}.github`) || 'Unspecified',
status: db.has(`bots.${id}.status`) ? db.fetch(`bots.${id}.status`) : 'Pending',
votes: db.fetch(`bots.${id}.vote`) || 0,
certificate: db.fetch(`bots.${id}.certificate`) || 'no'
    });
});

  app.get("/api/allbots", (req, res) => {
    res.json(Object.keys(db.fetch('bots')));
  });
  
app.get("/api/bots/:botID/votes/:userID", (req, res) => {
  var id = req.params.botID
  var user = req.params.userID

  if (db.has('bots')) {
      if (Object.keys(db.fetch('bots')).includes(id) === false) {
     res.json({
       hata: 'A bot with the ID you typed is not in the system.'
     });
   }
  }
 
   res.json({
     vote_status: db.has(`vote.${id}.${user}`) ? `Voted today` : null,
     votes: db.fetch(`bots.${id}.votes`) || 0
   });

});

app.listen(3000);
};
