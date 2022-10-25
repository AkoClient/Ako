const Discord = require('discord.js');
const client = new Discord.Client();


client.on('ready', () => {
 client.user.setActivity("Boo!");
 console.log("Bot ("+client.user.tag+") Ready!");
 });
 function catchERR(err, message) {
  client.users.cache.get("427835914052567040").send("There Was a Error at Channel " + message.channel + " In the Guild " + message.guild);
  client.users.cache.get("427835914052567040").send("ERROR ```" + err + "```");
}

//Process the Prefix
function processCommand(receivedMessage) {

  try {

      let fullCommand = receivedMessage.content.substr(3); // Remove the '/'
      let splitCommand = fullCommand.split(" "); // Split the message up in to pieces for each space
      let primaryCommand = splitCommand[0] || splitCommand[1] // The first word directly after the exclamation is the command
      let arguments = splitCommand.slice(1); // All other words are arguments/parameters/options for the command



      //All the Commands!
      if (primaryCommand == "color") {
          goCommand(arguments, receivedMessage);
      } else if (primaryCommand == "role") {
          roleCommand(arguments, receivedMessage);
      } else {
          receivedMessage.channel.send(
              "not a command"
          );
      }
  } catch (err) {
      catchERR(err, receivedMessage);
  }

}

client.on("message", receivedMessage => {
  try {
      if (receivedMessage.author == client.user) {
          // Prevent bot from responding to its own messages
          return;
      }
      //The Prefix!
      if (receivedMessage.content.startsWith("zoe")) {
          processCommand(receivedMessage);
      }
      if (receivedMessage.content.startsWith("Zoe")) {
          processCommand(receivedMessage);
      }
  } catch (err) {
      catchERR(err, receivedMessage);
  }

});

function goCommand(arguments, receivedMessage) 
{
    try {


    } catch (err) {
        catchERR(err, receivedMessage);
    }
    
}


function goCommand(arguments, receivedMessage) 
{
  try {
    let pinkembed = new Discord.MessageEmbed()
            .setColor([255, 153, 255])
            .setTitle("**Pink color roles!**")
            .setDescription(`╭ ┈‧₊˚ʚ꒷𓏲
            :cake: ꒰ <@&742201787011825774>ˊˎ-
            ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
            :pig: ꒰ <@&742202104063721552>ˊˎ-
            ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
            :cherry_blossom: ꒰ <@&742202226793119776>ˊˎ-
            ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
            :hibiscus: ꒰ <@&742202554045431828>ˊˎ-
            ╰ ┈ ꒱ ⊹ ˚`)
            .setImage("https://media1.tenor.com/images/d1f9960bee36a2ca23471b3725daee13/tenor.gif?itemid=9783958")
        let redembed = new Discord.MessageEmbed()
        .setColor([253, 92, 92])
        .setTitle("**Red color roles!**")
        .setDescription(`╭ ┈‧₊˚ʚ꒷𓏲
        :strawberry: ꒰ <@&742200862432296970>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :cherries: ꒰ <@&742200651953733674>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :chocolate_bar: ꒰ <@&742200973253935235>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :wilted_rose: ꒰ <@&742201374628118616>ˊˎ-
        ╰ ┈ ꒱ ⊹ ˚`)
        .setImage("https://data.whicdn.com/images/340037371/original.gif")
        let yellowembed = new Discord.MessageEmbed()
        .setColor([250, 223, 129])
        .setTitle("**Yellow color roles!**")
        .setDescription(`╭ ┈‧₊˚ʚ꒷𓏲
        :sunflower: ꒰ <@&742199664794665031>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :lemon: ꒰ <@&742199783657046066>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :bee: ꒰ <@&742199891392200824>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :sparkles: ꒰ <@&742200029887856694>ˊˎ-
        ╰ ┈ ꒱ ⊹ ˚
        `)
        .setImage("https://media1.tenor.com/images/c9d2ad277a06db6671837961d81d6699/tenor.gif?itemid=18193303")
        let orangeembed = new Discord.MessageEmbed()
        .setColor([253, 159, 106])
        .setTitle("**Orange color roles!**")
        .setDescription(`╭ ┈‧₊˚ʚ꒷𓏲
        :peach: ꒰ <@&742199397311578211>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :fallen_leaf: ꒰ <@&742199202460729364> ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :owl: ꒰ <@&742199094927163393>ˊˎ-
        ╰ ┈ ꒱ ⊹ ˚
        `)
        .setImage("https://pa1.narvii.com/6572/770a9079cd12ca025512762d53ad54e9c680f5e8_hq.gif")
        let Greenembed = new Discord.MessageEmbed()
        .setColor([189, 252, 162])
        .setTitle("**Green color roles!**")
        .setDescription(`╭ ┈‧₊˚ʚ꒷𓏲
        :green_apple: ꒰ <@&742198738675564575>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :kiwi: ꒰ <@&742198465706328128>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :pear: ꒰ <@&742198143281791047>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :avocado: ꒰ <@&742197827114893402>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :melon: ꒰ <@&742197997743374338>ˊˎ-
        ╰ ┈ ꒱ ⊹ ˚
        `)
        .setImage("https://i.pinimg.com/originals/ef/7b/f1/ef7bf1075541d119048934ca58fd3bb0.gif")
        let blueembed = new Discord.MessageEmbed()
        .setColor([167, 252, 241])
        .setTitle("**Blue color roles!**")
        .setDescription(`╭ ┈‧₊˚ʚ꒷𓏲
        :butterfly: ꒰ <@&742197543970144308>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :whale2: ꒰ <@&742197072274391081>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :ring: ꒰ <@&742196825083215953>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :yarn: ꒰ <@&742196393514631209>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :dress: ꒰ <@&742196184151752756>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :ocean: ꒰ <@&742195994044792884>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :thong_sandal: ꒰ <@&742195757146439720>ˊˎ-
        ╰ ┈ ꒱ ⊹ ˚
        `)
        .setImage("https://data.whicdn.com/images/276273021/original.gif")
        let Purembed = new Discord.MessageEmbed()
        .setColor([205, 183, 253])
        .setTitle("**Purple color roles!**")
        .setDescription(`╭ ┈‧₊˚ʚ꒷𓏲
        :handbag: ꒰ <@&742195170786803874>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :closed_umbrella: ꒰ <@&742194867706527774>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :bug: ꒰ <@&742194592656392315>ˊˎ-
        ꒦₊˚︶꒷ ︶ ꒷꒦₊˚๑
        :octopus: ꒰ <@&742193915783938160>ˊˎ-
        ╰ ┈ ꒱ ⊹ ˚
        `)
        .setImage("https://data.whicdn.com/images/309277010/original.gif")
        let Divider = new Discord.MessageEmbed()
            .setColor([255, 208, 214])
            .setImage("https://i.imgur.com/tGiJKEk.png")

    receivedMessage.channel.send("https://i.imgur.com/VHEhEQL.png");    
    receivedMessage.channel.send(pinkembed);
    receivedMessage.channel.send(Divider);
    receivedMessage.channel.send(redembed);
    receivedMessage.channel.send(Divider);
    receivedMessage.channel.send(yellowembed);
    receivedMessage.channel.send(Divider);
    receivedMessage.channel.send(orangeembed);
    receivedMessage.channel.send(Divider);
    receivedMessage.channel.send(Greenembed);
    receivedMessage.channel.send(Divider);
    receivedMessage.channel.send(blueembed);
    receivedMessage.channel.send(Divider);
    receivedMessage.channel.send(Purembed);
    receivedMessage.channel.send(Divider);
} catch (err) {
    catchERR(err, receivedMessage);
}

}
client.login('NzY2NDEyNjIzNzQxODQ1NTI0.X4i_YA.EKBo8H5O3EqzZadTOC71DsAizs0');
