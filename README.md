# RPS-Multiplayer

This is an on-line, multi-player rock/paper/scissors-style game utilizing Firebase Realtime Database.

## Installation
The app can be accessed on-line at https://ser-dialest.github.io/RPS-Multiplayer/
It can be run locally by cloning the GitHub repository and opening index.html in the browser of your choice.
(Internet access is still required when running locally.)

## Player requirements
It currently requires a second player on a different device or browser.
A future version will contain the option for single player against a computer opponent with random behavior.

## Program structure
index.html is the hub for everything. All other used files are located in the assets directory.
The CSS directory contains a reset file to attempt consistency across platforms.
All style specific to this site is indicated within the style.css file or controlled dynamically in game.js.
game.js is where all game logic and behavior is contained.
The multiplayer components are contolled through a Firebase real-time database.
The directories images and sounds contain all the visual and auditory assets called by the game. 
(database.html and offline.html are vesigial files unused by the application.)

##Flow of the game
Players provide their usernames.
Players choose an army and commander as their avatar.
The player will then wait for an opponent to do the same.

The player is then presented with the turn selection screen.
When both players have made their selection, the reult is displayed.
Wins/Losses stored in firebase.
The next round follows until one player has emerged victorious often enough to win. (Best 2 out of 3.)

Tanks, Battle Copters, and Anti-Air have a rock/paper/scissors relationship.

## Copyrights
While this application has been written by me, Jeffrey Lloyd Heatherly, all assets (sound, images, characters, animation) are copywritten and owned by Nintendo and Intelligent Systems.