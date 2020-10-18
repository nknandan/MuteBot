const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = 'mb';
const low = require('lowdb');

const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('Database.json');
const db = low(adapter);
db.defaults({ users : {}})
    .write()

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    let msgContents = msg.content.split(" ");
    if (msgContents[0] === prefix){
        if (msgContents[1] === 'start'){
            const channel = msg.member.voice.channel;
            if (channel){
                db.set(`users.${msg.member.user.id}`, channel).write();
                msg.reply('MuteBot Started !');
            }else {
                msg.reply("You need to be in a Voice Channel to Start Mute Bot")
            }
        }
        if(msgContents[1] === "stop"){
            db.unset(`users.${msg.member.user.id}`).write();
            msg.reply('MuteBot Stopped!');
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
