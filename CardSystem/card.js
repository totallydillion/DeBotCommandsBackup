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
        description:`Get An Anime Card that you can claim!`,
        category: 'Cc',
        async execute(message, args){
            /* on command ran */
            
            
            anime.get_random_character().then(result => {
                /* get random anime character from npm */
                
                
                /* show the user */
                message.channel.send({embeds:[{
                    title: `${result.name} | ${result.gender}`,
                    description: result.desc,
                    color: colors.fun,
                    image:{
                        url: result.character_image
                    }
                }], components: [ClaimBTN]}).then(function(animeMessage){
                    
                    /* a filter for the "Claim" button */
                    const filter = (interaction) => {
                        if(interaction.user.id == message.author.id ) return true;
                        else interaction.reply({ content: 'This is not you character to claim!', ephemeral: true });
                    }
                    
                    /* create an event listener */
                    const collector = animeMessage.createMessageComponentCollector({filter, time: 120000})
                    
                    collector.on('collect', async (interaction) => {
                        /* on collect, get the button pressed */ 
                        let choice = interaction.customId;
                        
                        
                        /* on claiming waifu */
                        if(choice == "Claim"){
                            
                            /* Call Claiming Card */
                            ClaimCard(result, message.author)
                            
                            /* Update the interaction, so it does not give "Interaction failed" */
                            interaction.deferUpdate();
                            
                            /* Let the user know that they have claimed the waifu */
                            message.reply(`You Have Claimed: **${result.name}**\nTo view your cards, type **=cardinv**`)
                            
                            /* stop the listener */
                            collector.stop();
                            
                            /* return */
                            return;
                        }
                    })
                })
            })
        }
    }
    
    function ClaimCard(card, user){
        
        /* on claiming card */
        
        
        /* read json */
        fs.readFile('./commands/PerServer/UserCards.json', 'utf-8', function(err, data){
            
            /* if error, throw it like it's a baseball. */
            if(err) throw err;
            
            /* get all of the users */
            var users = JSON.parse(data);
            
            /* has the user been found ? */
            let isUserFound = false;
            
            /* map out all of the users, this is so we are not using a for statement for every user */
            users.map((thisUser) => {
                
                /* if the map finds an ID that is the same as the user's id */
                if(thisUser.id == user.id){
                    
                    /* user has been found */ 
                    isUserFound = true;
                    
                    /* set up the card entry, this is what is being saved */
                    let cardEntry = {
                        name: card.name,
                        gender: card.gender,
                        character_image: card.character_image.toString()
                    }
                    
                    /* push the card entry into the user's owned cards */
                    thisUser.CardsOwned.push(cardEntry);
                    
                    /* saving */
                    fs.writeFile('./commands/PerServer/UserCards.json', JSON.stringify(users), 'utf-8', function(err){
                        if(err) throw err;
                        else return;
                    })
                    
                    /* returning */
                    return;
                }
            })
            
            /* map the users again */
            users.map(function(thisUser){
                
                /* this time, we are finding a specific user */
                switch(thisUser.id){ 
                    
                    /* find the user's id, if it is found, break */
                    case user.id:
                    break;
                    
                    
                    /* if it has not been found, aka: this is the first card being collected */
                    default:
                    
                    /* double check, and making sure it was not found */
                    if(isUserFound) break;

                    /* set up a default entry, this is what is being saved and searched for when inventory is called */
                    var defaultEntry = {
                        "id": user.id,
                        "CardsOwned": [],
                        "CardsWishlist": [],
                    }

                    /* get the card entry, this is what is being saved */
                    let cardEntry = {
                        name: card.name,
                        gender: card.gender,
                        character_image: card.character_image.toString()
                    }
                    
                    /* in the user's default entry, push the card */
                    defaultEntry.CardsOwned.push(cardEntry);
                    
                    /* in the json, push the user and default entry */
                    users.push(defaultEntry);
                    
                    /* save */
                    fs.writeFile('./commands/PerServer/UserCards.json', JSON.stringify(users), 'utf-8', function(err){
                        if(err) throw err;
                        else return;
                    })
                    /* break, we are done here. */
                    break;
                    
                }
            })
        })
    }
