# RPS-Multiplayer

This is a rock/paper/scissors style game meant to be played on-line.
Javascript (and JQuery) are the primary languages. 

index.html is the hub for everything. All other files are located in the assets directory.
The CSS directory contains a reset file to attempt consistency across platforms.
All style specific to this site is indicated within the style.css file or controlled dynamically in game.js.
game.js is where approxiamately all the action happens.
The multiplayer components are contolled through a Firebase database.
Images and sounds contain all the visual and auditory assets called by the game. (I blame sounds for the site size.)

What should happen:
The player provides a username.
The player chooses an army for their avatar.
The player then waits for an opponent or plays against the computer.
Both players will choose the number of rounds.

p1Name, p1Army, p2Name, p2Army p1Ready, p2Ready are stored in the firebase database.

Then the screen appears showing the battle map, the results area, and the three choices.
When both players have selected their options, the conlict animation will play, then the results animation.
Wins/Losses stored in firebase.
The next round follows until one player has emerged victorious often enough to win.

Victory and Loss screeen appears and next round is proposed.



