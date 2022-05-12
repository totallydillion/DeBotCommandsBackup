//apis 
const anime = require('acb-api');
const fs = require('fs');

const colors = require('./Lists/EmbedColors.json')[0]
const { MessageActionRow, MessageButton, Message, ButtonInteraction } = require('discord.js')
const ClaimBTN = new MessageActionRow().addComponents(
    new MessageButton()
    .setCustomId('Claim')
    .setLabel('Claim')
    .setStyle("SUCCESS"),
    )
    
    module.exports = {
        name:'card',
        description:`Get Anime Cards to collect, trade, and more! [WIP]`,
        category: 'Card',
        async execute(message, args){
            anime.get_random_character().then(result => {
                message.channel.send({embeds:[{
                    title: `${result.name} | ${result.gender}`,
                    description: result.desc,
                    color: colors.fun,
                    image:{
                        url: result.character_image
                    }
                }], components: [ClaimBTN]}).then(function(animeMessage){
                    const filter = (interaction) => {
                        if(interaction.user.id == message.author.id ) return true;
                        else interaction.reply({ content: 'This is not you character to claim!', ephemeral: true });
                    }
                    const collector = animeMessage.createMessageComponentCollector({filter, time: 120000})
                    
                    collector.on('collect', async (interaction) => {
                        let choice = interaction.customId;
                        
                        
                        /* on claiming waifu */
                        if(choice == "Claim"){
                            ClaimCard(result, message.author)
                            
                            interaction.deferUpdate();

                            message.reply(`You Have Claimed: **${result.name}**`)
                            collector.stop();
                            return;
                        }
                    })
                })
            })
        }
    }
    
    function ClaimCard(card, user){
        fs.readFile('./commands/PerServer/UserCards.json', 'utf-8', function(err, data){
            if(err) throw err;
            
            var users = JSON.parse(data);
            
            // if(!users.includes(user.id)){
            
            users.map((thisUser) => {
                if(thisUser.id == user.id){
                    thisUser.CardsOwned.push(card);
                    fs.writeFile('./commands/PerServer/UserCards.json', JSON.stringify(users), 'utf-8', function(err){
                        if(err) throw err;
                        else return;
                    })
                    return;
                }
            })
            
            users.map(function(thisUser){
                switch(thisUser.id){    
                    
                    case user.id:
                    break;
                    
                    
                    default:
                    var defaultEntry = {
                        "id": user.id,
                        "CardsOwned": [],
                        "CardsWishlist": [],
                    }
                    
                    defaultEntry.CardsOwned.push(card);
                    
                    users.push(defaultEntry);
                    
                    fs.writeFile('./commands/PerServer/UserCards.json', JSON.stringify(users), 'utf-8', function(err){
                        if(err) throw err;
                        else return;
                    })
                    
                    break;
                    
                }
            })
            
            
            
            
            // }
        })
    }
