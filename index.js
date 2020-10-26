const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = '_mb';
const low = require('lowdb');

const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('Database.json');
const db = low(adapter);
db.defaults({ users : {}})
    .write()

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(` ${prefix}`, { type: 'PLAYING' })
        .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
        .catch(console.error);
});


client.on('message', msg => {
    let msgContents = msg.content.split(" ");
    if (msgContents[0] === prefix){
        if(msgContents[1] === "ping"){
            msg.reply('Pong !');
        }
        if (msgContents[1] === 'start'){
            const channel = msg.member.voice.channel;
            if (channel){
                db.set(`users.${msg.member.user.id}`, channel).write();
                msg.reply('MuteBot Started !');
            }else {
                msg.reply("You need to be in a Voice Channel to Start MuteBot !")
            }
        }
        if(msgContents[1] === "stop"){
            db.unset(`users.${msg.member.user.id}`).write();
            msg.reply('MuteBot Stopped!');
        }
        if(msgContents[1] === "help"){
            msg.reply({embed: {
                    color: 3447003,
                    title: "MuteBot !",
                    fields: [
                        { name: `${prefix}`, value: "start\nstop", inline: true},
                        { name: "Prefix", value: "start an instance of the bot.\nstop an instance of the bot.", inline: true}
                    ]
                }
            });
        }
    }
});

client.on('voiceStateUpdate', (voiceState, voiceState1) => {
    const userId = voiceState1.member.user.id;
    const channel = db.get(`users.${userId}`).value();
    if(channel){
        try {
            channel.members.forEach((member) => {
                if(member.id !== userId){
                    member.voice.setMute(voiceState1.member.voice.selfMute);
                }
            })
        }catch (e) {
            console.error(e);
        }
    }
})



client.login('token');
