module.exports = {
    name: "ping",
    category: "info",
    description: "return bot latency and API ping.",
    run: async (bot, message, args) => {
        var msg = await message.channel.send("Allah iniyor!")
        msg.edit(`Ping: ${Math.floor(msg.createdAt - message.createdAt)}ms. \n API Ping: ${Math.round(bot.ping)}ms.`)
    }
}