const webscrape = require('webscrape');
const colors = require('./Lists/EmbedColors.json')[0];
var url = "https://www.timeanddate.com/on-this-day/";


/* this is for if you want to get the current events of the day in history */

module.exports = {
    name:'otd',
    description:'Look at the famous events that took play on this day!',
    category:'Helpful',
    usage:'[Month] [Day]',
    async execute(message,){
        
        var scraper = webscrape.default();
        const rawResult = await scraper.get(url);
        const rawHTML = rawResult.$(`section`).text();
        
        let cutUPHTML = rawHTML.split("\n");
        
        let Results = new Array();
        var isInTodayInHistory = false;
        for(var i = 0; i < cutUPHTML.length; i++){
            if(cutUPHTML[i].includes("Today in History")){
                isInTodayInHistory = true;
            }
            else if(cutUPHTML[i].includes("Deaths On This Day") || cutUPHTML[i].includes("Births On This Day"))
            break;
            
            if(isInTodayInHistory && (cutUPHTML[i].includes("1") ||cutUPHTML[i].includes("2") || cutUPHTML[i].includes("3") || cutUPHTML[i].includes("4") || cutUPHTML[i].includes("5") || cutUPHTML[i].includes("6") || cutUPHTML[i].includes("7") || cutUPHTML[i].includes("8") || cutUPHTML[i].includes("9") || cutUPHTML[i].includes("0"))){
                Results.push("**" + cutUPHTML[i] + "**\n" + cutUPHTML[i+1])
            }
        }
        
        return message.channel.send({embeds:[{
            title:"On This Day In History:",
            description: Results.join("\n"),
            color: colors.helpful
        }]})
    }
}
