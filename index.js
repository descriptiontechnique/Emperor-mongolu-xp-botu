var { Client, RichEmbed, Collection, Attachment, Utils, MessageCollector } = require('discord.js');
var botConfig = require('./botconfig.json');
var fs = require("fs");
var Canvas = require('canvas');
var mongoose = require("mongoose");
var {getMember} = require("./function")

var bot = new Client({
    disableEveryone: true
});

var active = new Map();

mongoose.connect(botConfig.dbLink, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(error => handleError(error));
mongoose.connection.on('error', function (e) {
    console.log('Emperor Mongo DB Connect: Bağlanamıyor Hata: ' + e);
    var { bot } = new discord.Client({ disableEveryone: true });
    bot.commands = new discord.Collection();
    process.exit();
});
mongoose.connection.once('open', function (d) {
    console.log("\x1b[32mEmperor Mongo DB Connect:\x1b[0m bağlı \x1b[31m" + mongoose.connection.host + " \x1b[0m");
})
var Users = require('./model/xp.js')
var Cards = require('./model/card.js')

bot.commands = new Collection();
bot.aliases = new Collection();
bot.categories = fs.readdirSync("./commands/");

["command"].forEach(handler => {
    require(`./handler/${handler}`)(bot);
})

bot.on('disconnect', () => console.log("\x1b[32m${bot.user.username}\x1b[0m is Bağlantı Kesildi... Bağlantıyı Bekleyin"));
bot.on('reconnecting', () => console.log("\x1b[32m${bot.user.username}\x1b[0m  Yeniden bağlandı!."))

console.log('Bot Ayarlandı...')
let statues = ["Emperor", "Of", "Developed!"]
bot.on('ready', () => {
    setInterval(function() {
        let status = statues[Math.floor(Math.random()*statues.length)];
        bot.user.setStatus('dnd');
        bot.user.setPresence({game: { name: status, type: "PLAYING"}
    })
}, 600000)
console.log(`\x1b[32m${bot.user.username}\x1b[0m şimdi başladı ve devam ediyor \x1b[31m${process.env.NODE_ENV} \x1b[0menvironement!`);
});

bot.on('message', async message => {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    let messageArray = message.content.split(" ");
    let args = messageArray.slice(1);
    let xpAdd = Math.ceil(Math.random() * 15);
    let messageAdd = +1


    Users.findOne({
        did: message.author.id,
        serverID: message.guild.id
    }, (err, users) => {
        if (err) console.log(err);
        if (!users) {
            var newUsers = new Users({
                did: message.author.id,
                username: message.author.username,
                serverID: message.guild.id,
                xp: xpAdd,
                level: 0,
                message: messageAdd,
                warns: 0,
                avatarURL: message.author.displayAvatarURL
            })

            newUsers.save().catch(error => console.log(error));
        } else {
            users.xp = users.xp + xpAdd;
            users.message = users.message + messageAdd
            users.username = message.author.username
            users.avatarURL = message.author.displayAvatarURL

            let nxtlvl = 300 * Math.pow(2, users.level)
            if (users.xp >= nxtlvl) {
                users.level = users.level + 1

                var sendimg = async function sendimg() {
                    await lvlupimg(message, users);

                }
                sendimg()
            }
            users.save().catch(error => console.log(error));
        }
    });

    Cards.findOne({
        did: message.author.id
    }, (err, cards) => {
        if (err) console.log(err)
        if (!cards) {
            var newCards = new Cards({
                did: message.author.id,
                link: "https://cdn.asthriona.com/DefaultYukikocard.jpg"
            })
            newCards.save().catch(error => console.log(error));
        }
    })


})

bot.on('message', async message => {
    if(message.author.bot) return;

    var date = new Date();
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); 
    var yyyy = date.getFullYear();
    var hs = String(date.getHours()).padStart(2, '0');
    var min = String(date.getMinutes()).padStart(2, '0');
    var sec = String(date.getSeconds()).padStart(2, '0');
    var ms = String(date.getMilliseconds()).padStart(2);
    date = hs + ':' + min + ':' + sec + ':' + ms + ' -- ' + mm + '/' + dd + '/' + yyyy + ' ->';

    if (message.channel.type === "dm") return console.log(`${date} Tarih | Mesaj Atan ${message.author.username} | Mesaj Atan ${message.content}`);
    console.log(`${date} Tarih | Sunucu İsmi ${message.guild.name} | Yazan Kişi ${message.author.username} | Mesaj Atan ${message.content}`)


    let prefix = botConfig.prefix;
    let messageArray = message.content.split(" ");
    let args = messageArray.slice(1);
    let cmd = messageArray[0];

    let filter = m => !m.author.bot;
    if(!prefix) return
    var options = {
        active: active
    }

    if (message.author.id === "" || "") {
        if (cmd === `${prefix}leave`) {
            return message.guild.leave();
        }
    }
    let commandfile = bot.commands.get(messageArray[0].slice(prefix.length));
    if (commandfile) commandfile.run(bot, message, args, options);
})
bot.login(botConfig.token)

//Kart Üretme

async function lvlupimg(message, users) {
    const applyText = (canvas, text) => {
        const ctx = canvas.getContext('2d');
        let fontSize = 70;
        do {
            ctx.font = `${fontSize -= 10}px sans-serif`;
        } while (ctx.measureText(text).width > canvas.width - 300);
        return ctx.font;
    };
    var canvas = Canvas.createCanvas(934, 282);
    var ctx = canvas.getContext('2d');
    Cards.findOne({
        did: message.author.id
    }, async (err, cards)=>{
        var cardbg = cards.link
    var member = getMember(message);
    var background = await Canvas.loadImage(cardbg);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(260, 80, 650, 160);
    ctx.closePath();
    ctx.stroke();
    //İsim Gösterme
    ctx.font = applyText(canvas, member.displayName);
    ctx.fillStyle = '#fff';
    ctx.fillText(member.displayName + " Level up!", 280, 136);
    //Level & XP Gösterme
    let nxtlvl = 300 * Math.pow(2, users.level);
    var xpleft = nxtlvl - users.xp;
    ctx.font = '40px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText("Şuan ki levelin " + users.level + " - " + users.xp + " XP", 280, 180);
    //xp
    ctx.font = '50px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText("Bir sonraki levelin " + xpleft + " xp", 280, 225);
    //avatar
    await GetAvatar(message, ctx);
    //canvas gönderme
    var lvlupimg = new Attachment(canvas.toBuffer(), 'lvlup-image.png');
    message.channel.send(lvlupimg);
})
}

async function WelcomeCad(member, channel) {
    const applyText = (canvas, text) => {
        const ctx = canvas.getContext('2d');
        let fontSize = 70;
        do {
            ctx.font = `${fontSize -= 10}px sans-serif`;
        } while (ctx.measureText(text).width > canvas.width - 300);
        return ctx.font;
    };
Cards.findOne({
    did: member.user.id
}, async (err, cards)=>{
    var canvas = Canvas.createCanvas(934, 282);
    var ctx = canvas.getContext('2d');
    var cardbg = cards.link
    var background = await Canvas.loadImage(cardbg);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(260, 80, 650, 130);
    ctx.stroke();
    ctx.font = applyText(canvas, member.user.username);
    ctx.fillStyle = '#fff';
    ctx.fillText(member.user.username, 280, 141);
    ctx.font = applyText(canvas, member.guild.name);
    ctx.fillStyle = '#fff';
    ctx.fillText("Sunucuya Giriş Yaptı! ", 280, 195);
    var avatar = await Canvas.loadImage(member.user.displayAvatarURL);
    ctx.beginPath();
    ctx.arc(140, 128, 110, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 25, 15, 256, 256);
    var attachment = new Attachment(canvas.toBuffer(), 'welcome-image.png');
    channel.send(`Hoşgeldin! ${member.user}`, attachment)
});
}

async function farewell(member, channel) {
    const applyText = (canvas, text) => {
        const ctx = canvas.getContext('2d');
        let fontSize = 70;
        do {
            ctx.font = `${fontSize -= 10}px sans-serif`;
        } while (ctx.measureText(text).width > canvas.width - 300);
        return ctx.font;
    };
    Cards.findOne({
        did: member.user.id
    }, async (err, cards) =>{
    var cardbg = cards.link
    var background = await Canvas.loadImage(cardbg);
    var canvas = Canvas.createCanvas(934, 282);
    var ctx = canvas.getContext('2d');
    var cardsbg = cards.link
    var background = await Canvas.loadImage(cardsbg);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(260, 80, 650, 130);
    ctx.stroke();
    ctx.font = applyText(canvas, member.user.username);
    ctx.fillStyle = '#fff';
    ctx.fillText(member.user.username, 280, 141);
    ctx.font = applyText(canvas, member.guild.name);
    ctx.fillStyle = '#fff';
    ctx.fillText("Sunucudan Çıktı!", 280, 195);
    var avatar = await Canvas.loadImage(member.user.displayAvatarURL);
    ctx.beginPath();
    ctx.arc(140, 128, 110, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 25, 15, 256, 256);
    var attachment = new Attachment(canvas.toBuffer(), 'farewell-image.png');
    channel.send(attachment)
})
};

async function GetAvatar(message, ctx) {
    var avatar = await Canvas.loadImage(message.author.displayAvatarURL);
    ctx.beginPath();
    ctx.arc(125, 140, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 25, 40, 200, 200);
}