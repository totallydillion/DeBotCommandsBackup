const webscrape = require('webscrape'); //for scraping websites
var scraper = webscrape.default(); //for scraping websites

const colors = require('./Lists/EmbedColors.json')[0]
const wikipedia = require('wikipedia');

module.exports = {
    name:'randwiki',
    subnames:['randarticle'],
    description:'Get a random article from wikipedia!',
    category:'Random',
    async execute(message, args){
        
        //get random article
        var RandomArticleName = await GetArticleName();
        
        //filter out what we actually need from it 
        const pg = await wikipedia.page(RandomArticleName)
        const intro = await pg.intro();
        const url = await pg.images()


        //if not a valid photo is on the page, use the wikipedia symbol
        let displayedURL = url ? url[0].url : ".svg";
        if(displayedURL.includes('.svg')) //no icon
        displayedURL = "https://pngimg.com/uploads/wikipedia/wikipedia_PNG24.png"
        
        
        //send message
        return message.channel.send({embeds:[{
            color: colors.helpful,
            thumbnail:{
                url:  displayedURL.toString()
            },
            title:RandomArticleName.toString(),
            description: intro.toString().substr(0,4000),
            footer:{
                text:'=randwiki'
            }
        }]})
        
    }
}

async function GetArticleName(){
    //essentially, click "random article" on wikipedia
    const result = await scraper.get(`https://en.wikipedia.org/wiki/Special:Random`)
    
    //get the title of the tab
    var title = result.$('title').text();
    
    //get rid of "- WikiPedia"
    title = title.replace("- Wikipedia", "");
    
    //return the fixed results
    return title;
}
