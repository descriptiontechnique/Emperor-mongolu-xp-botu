var { RichEmbed } = require("discord.js");
var mongoose = require("mongoose");
var botConfig = require('../../botconfig.json');

mongoose.connect(botConfig.dbLink, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
var Users = require('../../model/xp.js')

module.exports = {
    name: "top",
    category: "info",
    description: "Show the top 10 leaderboard!",
    run: async (bot, message, args) => {
        Users.find({
            serverID: message.guild.id
        }).sort([
            ['xp', 'descending']
        ]).exec((err, res) => {
        if(err) console.log(err);
        let embed = new RichEmbed()
        .setThumbnail(bot.user.displayAvatarURL)
        .setDescription("top10!")
        if(res.length === 0){
            embed.setColor("red")
            embed.addField("No Data :c")
        }else if(res.length < 10){
            //if less than 10
            embed.setColor("#351B96")
            for(i = 0; i < res.length; i++){
                let member = message.guild.members.get(res[i].did) || "Bu Kişi Çıkmış :/"
                if(member === "Bu Kişi Çıkmış :/"){
                    embed.addField(`${i+1}. ${member}`, `**Level**: ${res[i].level} || **XP**: ${res[i].xp}`)
    
                }else{
                    embed.addField(`${i+1}. ${member.user.username}`, `**Level**: ${res[i].level} || **XP**: ${res[i].xp}`)
                }
            }
        }else{
            //if more than 10
            embed.setColor("#351B96")
            for(i = 0; i < 10; i++){
                let member = message.guild.members.get(res[i].did) || "Bu Kişi Çıkmış  :/"
                if(member === "Bu Kişi Çıkmış :/"){
                    embed.addField(`${i+1}. ${member}`, `**Level**: ${res[i].level} || **XP**: ${res[i].xp}`)
    
                }else{
                    embed.addField(`${i+1}. ${member.user.username}`, `**Level**: ${res[i].level} || **XP**: ${res[i].xp}`, true)
                }
            }
        }
        message.channel.send(embed)
    });
    
    }
}