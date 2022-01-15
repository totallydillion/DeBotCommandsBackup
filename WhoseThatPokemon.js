//apis 
const webscrape = require('webscrape'); //for scraping websites
var scraper = webscrape.default(); //for scraping websites

const discord = require('discord.js') //for message collectors

const colors = require('./Lists/EmbedColors.json')[0]; //for embeds

//options 
const gameTime = 30; //how many seconds should each game last
const defaultGuesses = 5; // how many guesses should people get?

//variables
var playingChannels = []; // an array of every channel being played
var playingPlayers = []; // an array of every game playing player

//bug: the url of the image gives the ID of a pokemon, so they are able to do =pokemon [that number]

module.exports = {
    name:'wtp',
    description:'Play a game of "Whose That Pokemon"!',
    subnames:['whosethatpokemon'],
    category:'Fun',
    async execute(message, args){
        //on command ran
        
        /* error handling */
        if(playingChannels.includes(message.channel.id)) // game is already being played in the channel
        return message.channel.send({embeds:[{
            title:'There is already a game being played in this channel!',
            color: colors.error,
            footer:{
                text: '=wtp'
            }
        }]})
        
        if(playingPlayers.includes(message.author.id)) // user is already playing a game
        return message.channel.send({embeds:[{
            title:'You are already playing a game!',
            color: colors.error,
            footer:{
                text: '=wtp'
            }
        }]})
        
        /* end error handling */
        
        //add player & channel to the array
        playingChannels.push(message.channel.id);
        playingPlayers.push(message.author.id);
        
        //scraping website
        var GameResultsJSON = await ScrapeWebsite();
        
        //starting the game, show the user what the pokemon is
        message.channel.send({embeds:[{
            title:'Guess That Pokemon!',
            color: colors.fun,
            image:{
                url: GameResultsJSON.sprites.other.home.front_default
            },
            footer:{
                text:'Not sure? Type "Cancel" and the game will cancel!'
            }
        }]}).then(function(WTPMessage){
            //we are officially in the game
            
            
            //"is the sent message from the user?"
            const filter = m => m.author == message.author.id;
            
            //creating a message listener that listens to the filter
            const collector = new discord.MessageCollector(WTPMessage.channel, filter,{time: gameTime * 60000})
            
            //variables 
            var guesses = defaultGuesses;
            
            
            
            collector.on('collect', collected => {
                
                //on every message while a game is going on
                
                //make sure that it is not another user talking
                if(collected.author.id != message.author.id)
                return;
                
                
                //otherwise
                
                //if the user guesses correctly
                if(collected.content.toLowerCase() == GameResultsJSON.name.toLowerCase()){
                    //on correct answer
                    
                    //let the user know they were correct!
                    message.channel.send({embeds:[{
                        title:'You are correct!',
                        description:`The Pokemon was: **${GameResultsJSON.name.toUpperCase()}** !`,
                        color: colors.fun,
                        footer:{
                            text:'=wtp'
                        }
                    }]})
                    
                    //stop the collector
                    collector.stop();
                }
                
                //if the user types "cancel"
                else if(collected.content.toLowerCase() == "cancel"){
                    //tell them that they cancelled the game
                    message.channel.send({embeds:[{
                        title:'Game Cancelled!',
                        description:'You have decided to stop the game!',
                        color: colors.error,
                        footer:{
                            text:'=wtp'
                        }
                    }]})
                    
                    //stop the game
                    collector.stop();
                }
                
                else {
                    //if they did not guess correctly
                    
                    //take away a guess
                    guesses--;
                    
                    //if they have ran out of guesses
                    if(guesses == 0){ 
                        //on no more guesses
                        
                        // send a message with the correct answer
                        message.channel.send({embeds:[{
                            title:'Game Over!',
                            description:`You were incorrect, and have ran out of guesses! The correct answer is: **${GameResultsJSON.name.toUpperCase()}**`,
                            color: colors.fun,
                            footer:{
                                text: '=wtp'
                            }
                        }]})
                        
                        //stop the collector
                        collector.stop();
                    }
                    
                    else{
                        //if they guessed wrong, but still have guesses remaining:
                        return message.channel.send({embeds:[{
                            title:'Incorrect!',
                            description:`You have: **${guesses}** guesses remaining!`,
                            color: colors.error
                        }]})
                    }
                }
            })
            
            collector.on('end', collected => {
                //when the game is over
                
                //take the user & channel out of the array
                playingPlayers.splice(playingPlayers.indexOf(message.author.id), 1)
                playingChannels.splice(playingChannels.indexOf(message.channel.id), 1)
                
                //return
                return;
            })
        })
        
        
    }
}

async function ScrapeWebsite(){
    //called after getting a pokemon, and before starting the game
    
    
    //try to get a pokemon with the id between 1-898 [the amount of pokemon the pokeAPI has without being weird]
    let rawResults = await scraper.get(`https://pokeapi.co/api/v2/pokemon/${Math.floor(Math.random() * 897 + 1)}`).catch(function(err){
    //if there is an error, ie the PokeAPI website did not have the pokemon, redo
    if(err) ScrapeWebsite()
})

//make sure there are going to be results, if not, then redo
if(!rawResults || !rawResults.json || !rawResults.json.sprites)
ScrapeWebsite();

//if there are results, return them
else
return rawResults.json;
}
