var mongoose = require("mongoose");
var botConfig = require('../../botconfig.json');
mongoose.connect(botConfig.dbLink, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var Cards = require('../../model/card.js')
module.exports = {
    name: "kart",
    aliases: ["emperor", "of", "developer", "kart-değiştir"],
    category: "info",
    description: "give you the possibility to change your card background!",
    usage: "<link> | <info>",
    run: async (bot, message, args) => {
        if(args[0] === "info"){
            message.reply("Gönderdiginiz resimler .jpg veya .png olmalı \n 934x282 bir resim kaydı olmassa bot tarafından sıkıştırılır!")
        }
        if(!args[0]) return message.reply("Lütfen Bir Link Yollayın1");
        if(!args[0].startsWith("http" || "https")) return message.reply("Http/Https içeren linkler gecerli değildir!");
        if(!args[0].endsWith(".png" || ".jpg")) return message.reply("jpg veya png ek dosyası yollayınız!")
        Cards.findOne({
            did: message.author.id
        }, (err, cards)=>{
            if(err) console.log(err)
            if (!cards) {
                var newCards = new Cards({
                    did: message.author.id,
                    link: args[0]
                })
                newCards.save().catch(error => console.log(error));
                message.reply("Başarıyla Kayıt edildi!")
            } else {
                cards.link = args[0]
                cards.save().catch(error => console.log(error))
                message.reply("Başarıyla Kayıt edildi!")
            }
        })
    }

}
