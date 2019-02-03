// Initialize Firebase
var config = {
    apiKey: "AIzaSyCMaqmQ3QpoK6L8uFRhvpFyGJoZTbxckLE",
    authDomain: "aw-rps.firebaseapp.com",
    databaseURL: "https://aw-rps.firebaseio.com",
    projectId: "aw-rps",
    storageBucket: "aw-rps.appspot.com",
    messagingSenderId: "279238216909"
};
firebase.initializeApp(config);

var database = firebase.database();

// who is player 1
var p1 = {name: "", army: "", choice: "", wins: 0};
//who is player 2
var p2 = {name: "", army: "", choice: "", wins: 0};
// who are you?
var you = {
    // What is your key in the database?
    key: "keybutt",
    // What is your name?
    name: "namebutt",
    // What role do you have in this match?
    role: "rolebutt",
    // What army do you command?
    army: "",
    // What did you pick this round?
    choice: "",
    // How many times have you won or lost before?
    wins: 0,
    losses: 0
};

// function for logging in
function loginScreen() {
    // Clear screen
    $("body").html("");
    // create input and button
    var input = $("<input>");
    input.attr({"type": "text", "name": "username", "id": "username", "placeholder": "Type name"});
    var button = $("<button>");
    button.text("Log In");
    button.attr({"type": "button", "id": "login"});
    // add them to the body
    $("body").append(input);
    $("body").append(button);
    
    // Button gonna log you in
    button.on("click", function () {
        event.preventDefault();
        // Make sure there is a name
        if (input.val() != "") { 
            // search database for that username
            var users = firebase.database().ref('users'); // pull the directory
            var search = users.orderByChild('username').equalTo(input.val()); // search keys for matching username
            // perform the search
            search.once('value', function(snapshot) {
                // if the user does not exist, create it
                if (!snapshot.exists()) {
                    // values created for username and lifetime wins and losses
                    database.ref("users").push({
                        username: input.val(),
                        wins: 0,
                        losses: 0
                    }).then(function(snap) {
                        // local variables are stored for browser to reference player identity
                        you.key = snap.key;
                        you.name = input.val();
                        you.wins = 0;
                        you.losses = 0;
                    })
                }
                else {
                    // If user already exists, grab the data key for the user and store to local object for later
                    database.ref().child('users').orderByChild('username').equalTo(input.val()).once("value", function(snap) {
                        snapshot.forEach(function(data) {
                            you.key = data.key;
                            you.name = input.val();
                        });
                        database.ref('users/' + you.key).once('value', function(snap) {
                            you.wins = snap.val().wins,
                            you.losses = snap.val().losses
                        })
                    });
                }
            }).then(function(snapshot) {
                // Then check to see if we have a player 1 yet
                firebase.database().ref('game').child('p1name').once('value', function(snap) {
                    // if player 1 does not exist, the user becomes player one and values are set
                    if (!snap.exists()) {
                        database.ref('game').set({
                            p1name: you.name,
                            p1army: '',
                            p1choice: '',
                            p1wins: 0,
                            p2name: '',
                            p2army: '',
                            p2choice: '',
                            p2wins: 0,
                        })
                        you.role = 'p1';
                        p1.name = you.name;
                    }
                    else { // only if there is a player 1
                        // check if there is a player 2. 
                        // if player 2 does not exist, the user becomes player one and values are set
                        firebase.database().ref('game').child('p2name').once('value', function(snap) {
                            if (snap.val() === "") {
                                database.ref('game').update({
                                    p2name: you.name,
                                })
                                you.role = 'p2';
                                p2.name = you.name;
                            }
                            else { // if player 1 and 2 both exist
                                ("There are already 2 players");
                                you.role = "spectator";
                            }
                        });
                    }
                }).then(chooseArmy());
            });
        // Don't do nothing if they ain't put in no name!
        }
    });
            
            
            // STUFF ABOUT WAITING FOR PLAYER TWO
            // Move to Army Select
            // chooseArmy();
};


// Imported from offline version
function chooseArmy(){
    // I need a brief delay here to make sure everything is loaded from the database
    setTimeout(function () { 
        // clear the screen
        $("body").html("");
        $("body").css({"height":"300px", "display": "flex","justify-content": "space-around", "align-items": "center"})
        // Make boxes
        function armyBox(color) {
            // create a box
            var box = $("<div>");
            // give it a class for clicking and an idea for color selection 
            box.attr({"class": "army", "id": color});
            box.css({"height": "100px", "width": "100px", "background": color})
            return box;
        }
        // make the army boxes
        $("body").append(armyBox("orange"));
        $("body").append(armyBox("blue"));
        $("body").append(armyBox("yellow"));
        $("body").append(armyBox("green"));

        // Don't let it be clickable if it's a spectator
        if (you.role === "spectator") {
            $("body").prepend("<p>You are spectating</p>")
        }
        else {
            // make the armies selectable
            $(".army").on("click", function () {
                $(".army").off("click");
                you.army = $(this).attr("id");
                // Assign choice to your army and move on if opponent has already picked
                if (you.role === 'p1') {
                    database.ref('game').update({
                        p1army: you.army
                    });
                    p1.army = you.army;
                    if (p2.army != '') {
                        loadGame()
                    }
                }
                // It's a little wet, but I don't know what to do about it now.
                else if (you.role === 'p2') {
                    database.ref('game').update({
                        p2army: you.army
                    });
                    p2.army = you.army;
                    if (p1.army != '') {
                        loadGame()
                    }
                }
            })
        };
        
        // What happens when an opponent selects an army
        function armySelected(pVar, pString, pNot) {
            // if you aren't the one being picked
            if (you.role != pString) {
                // check to see if your opponent chose an army yet
                database.ref('game').child(pString + 'army').on('value', function(snapshot) {
                    // update the local variable for the enemy army 
                    pVar.army = snapshot.val();
                    // if it got updated to be something
                    if (pVar.army != "") {
                        // mark the option and make it unclickable
                        $("#" + pVar.army).css("background", "gray");
                        $("#" + pVar.army).text(pString);
                        $("#" + pVar.army).off("click");
                        // Have you selected anything yet?
                        database.ref('game').child(pNot + 'army').once('value', function(snap) {
                            if (snap.val() != '') {
                                // If so, load the game
                                loadGame();
                            }
                        })
                    }
                });
            };
        };

        // By checking both options, the spectator can also move to the next field
        armySelected(p1, "p1", "p2");
        armySelected(p2, "p2", "p1");
        
    }, 500);
}

// loading the play area
function loadGame() {
    setTimeout(function() {
        // clear the screen
        $("body").html("");
        // creat play area ****
        $("body").css({"height":"600px", "display": "flex","justify-content": "column", "align-items": "center"});
        $("body").append("<div>MAP</div>");
        // the function that creates the RPS boxes
        function choiceBox(choice) {
            var box = $("<div>");
            // give it a class for clicking and an idea for color selection 
            box.attr({"class": "choice", "id": choice});
            box.css({"height": "100px", "width": "100px",})
            box.text(choice);
            return box;
        }
        // Add choices
        $("body").append(choiceBox("rock"));
        $("body").append(choiceBox("paper"));
        $("body").append(choiceBox("scissors"));
        // create victory status
        $("body").append("<div>VICTORY AREA</div>");
        // Start the round!
        roundStart();
    }, 7000);
}

// Playing a round
function roundStart() {
    // Spectators don't get to choose
    if (you.role != "spectator") {
        console.log("New Round"); // checking
        // Activate all the choice buttons
        $(".choice").on("click", function () {
            // You only get to pick once
            $(".choice").off("click");
            // ($(this).attr("id")); I don't know what the purpose of this was supposed to be
            // Set choice from selection div ID
            you.choice = $(this).attr("id");
            console.log("You chose " + you.choice); // Checking
            // make the selection a p1 selection if you are p1
            if (you.role === "p1") {
                p1.choice = you.choice;
                database.ref('game').update({
                    p1choice: you.choice,
                });
                // if the other player selected already, move to judgement
                if (p2.choice != '') {
                    roundJudge();
                }
            }
            // else you must be p2. WET code alert
            else {
                p2.choice = you.choice;
                database.ref('game').update({
                    p2choice: you.choice,
                });
                if (p1.choice != '') {
                    roundJudge();
                } 
            }
        })
    }

    // How to respond to other players picking
    function roundChoice(pVar, pString, pNot) {
        // Only execute if you are not the first player listed
        if (you.role != pString) {
            // has there been a change to opponent choice?
            database.ref('game').child(pString + 'choice').on('value', function(snapshot) {
                // Update local variable with that change
                pVar.choice = snapshot.val();
                console.log(pString + " became " + pVar.choice);
                // if it became something
                if (pVar.choice != "") {
                    // The spectator gets to see what the player chose
                    if (you.role === "spectator") {
                        $("#" + pVar.army).append(pString);
                    }
                    // Check if you have made your choice yet. If so, move to judgement
                    database.ref('game').child(pNot + 'choice').once('value', function(snap) {
                        if (snap.val() != '') {
                            roundJudge();
                        }
                    })
                }
            });
        };
    };
    // respond to other player choices
    roundChoice(p1, "p1", "p2");
    roundChoice(p2, "p2", "p1");
}

// Judge the winner from the choices
function roundJudge() {
    // Delay to make sure the database has caught up with us
    setTimeout(function() {
        console.log("P1: " + p1.choice + " P2: " + p2.choice) // Checking
        // If it's a tie, no wins go up
        if (p1.choice === p2.choice) {}

        else if (p1.choice === "rock") {
            if (p2.choice === "scissors") {p1.wins++}
            else {p2.wins++}
        }

        else if (p1.choice === "paper") {
            if (p2.choice === "rock") {p1.wins++}
            else {p2.wins++}
        }

        else {
            if (p2.choice === "paper") {p1.wins++}
            else {p2.wins++}
        }

        console.log("P1 wins: " + p1.wins + " P2 wins: " + p2.wins);
        database.ref('game').update({
            p1wins: p1.wins,
            p2wins: p2.wins
        })

        // if (p1.wins >= 2) {
        //     $("body").html("<p>" + p1.name + " of " + p1.army + " wins</p>");
        //     if (you.role === "p1") {
        //         you.wins++;
        //         database.ref('users/' + you.key).update({
        //             wins: you.wins
        //         })
        //     }
        //     if (you.role === "p2") {
        //         you.losses++;
        //         database.ref('users/' + you.key).update({
        //             losses: you.losses
        //         })
        //     }
        // }
        // else if (p2.wins >= 2) {
        //     $("body").html("<p>" + p2.name  + " of " + p2.army + " loses</p>");
        //     if (you.role === "p2") {
        //         you.wins++;
        //         database.ref('users/' + you.key).update({
        //             wins: you.wins
        //         })
        //     }
        //     if (you.role === "p1") {
        //         you.losses++;
        //         database.ref('users/' + you.key).update({
        //             losses: you.losses
        //         })
        //     }
        // }
        // else {
            p1.choice = "";
            p2.choice = "";
            you.choice = "";
            database.ref('game').update({
                p1choice: "",
                p2choice: "",
            })
            roundStart();
        // }
    } , 2000);
}

// This was to learn
// database.ref().once("value", function(snapshot) {
//     if (snapshot.val() === null) {
//         database.ref("users").push({
//             name: "Bob"
//         }).then(function(snap) {
//             var key = snap.key;
//             console.log(key);
//         })     
//     }
// })






loginScreen();
