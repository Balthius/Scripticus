<<<<<<< HEAD

=======
>>>>>>> 36ac65243a0847068fa36b571d37e36c0ccc7490
const { MessageEmbed } = require('discord.js');
module.exports = {
   name: 'toolbox',
   description: 'Provides direct access to the Legends of Idleon Toolbox',
<<<<<<< HEAD
=======
   // eslint-disable-next-line no-unused-vars
>>>>>>> 36ac65243a0847068fa36b571d37e36c0ccc7490
   execute(message, args) {
    const embed = new MessageEmbed()
       .setColor('#F9AF9F')
       .setTitle('Click here to reach the Idleon Toolbox!')
       .setURL('https://docs.google.com/spreadsheets/d/1cY3vg1Z-AgOtIcV128D6kSLQRJE_-MUMtyqW0086Zmk/edit?usp=sharing')
       .addFields(
          { name: 'Credit', value: 'Created by Abgreyd and Hateling' },
       );
    message.channel.send(embed);
 },
<<<<<<< HEAD
};
=======
};
>>>>>>> 36ac65243a0847068fa36b571d37e36c0ccc7490
