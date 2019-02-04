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

var p1, p2, you;
// return all values to original
function varReset() {
    // who is player 1
    p1 = {name: "", army: "", choice: "", wins: 0};
    //who is player 2
    p2 = {name: "", army: "", choice: "", wins: 0};
    // who are you?
    you = {
        // What is your key in the database?
        key: "",
        // What is your name?
        name: "",
        // What role do you have in this match?
        role: "",
        // What army do you command?
        army: "",
        // What did you pick this round?
        choice: "",
        // How many times have you won or lost before?
        wins: 0,
        losses: 0
    };
};

// function for logging in
function loginScreen() {
    // opening visuals
    // reset everything
    $("body").html("");
    var newArea = $("<div id='play-area'>");
    $("body").append(newArea);
    // picture of Nell
    var nell = $("<img src='assets/images/Nell3.png' id='nell' />");
    $("#play-area").append(nell);
    // dialogue box comes up after brief delay
    setTimeout(function() {dialogue()}, 1000);
    // first line: Welcome to Advance Wars: Rock Paper Scissors
    setTimeout(function() {
        $("#text").append("<p>Welcome to Advance Wars: Rock Paper Scissors!</p>");
    }, 1500);
    // Second line: Please enter your name
    setTimeout(function() {
        $("#nell-face").css("background-image", "url('assets/images/NellFace3.png')");
        $("#text p").html("Please enter your name.")
    }, 3500)
    // Input Field and button
    var input = $("<input>");
    input.attr({"type": "text", "name": "username", "id": "username", "placeholder": "Type name"});
    var button = $("<button>");
    button.attr({"type": "button", "id": "login"});
    // add them to the #play-area
    $("#play-area").append(input);
    $("#play-area").append(button);    
    // Button gonna log you in
    button.on("click", function () {
        event.preventDefault();
        // Make sure there is a name
        if (input.val() != "") { 
            // search database for that username
            var users = firebase.database().ref('users'); // pull the directory
            var search = users.orderByChild('username').equalTo(input.val()); // search keys for matching username
            // perform the search
            search.once('value', function(snap1) {
                // if the user does not exist, create it
                if (!snap1.exists()) {
                    // values created for username and lifetime wins and losses
                    database.ref("users").push({
                        username: input.val(),
                        wins: 0,
                        losses: 0
                    }).then(function(snap2) {
                        // local variables are stored for browser to reference player identity
                        you.key = snap2.key;
                        you.name = input.val();
                        you.wins = 0;
                        you.losses = 0;
                    })
                }
                else {
                    // If user already exists, grab the data key for the user and store to local object for later
                    database.ref().child('users').orderByChild('username').equalTo(input.val()).once("value", function(snap3) {
                        snap3.forEach(function(data) {
                            you.key = data.key;
                            you.name = input.val();
                        });
                        database.ref('users/' + you.key).once('value', function(snap4) {
                            you.wins = snap4.val().wins,
                            you.losses = snap4.val().losses
                        })
                    });
                }
            }).then(function() {
                // Then check to see if we have a player 1 yet
                firebase.database().ref('game').child('p1name').once('value', function(snap5) {
                    // if player 1 does not exist, the user becomes player one and values are set
                    if (!snap5.exists()) {
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
                        firebase.database().ref('game').child('p2name').once('value', function(snap6) {
                            if (snap6.val() === "") {
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
};

// Choose army 
function chooseArmy(){
    // I need a brief delay here to make sure everything is loaded from the database
    setTimeout(function () { 
        setTimeout(function () {dialogue();}, 1000);
        setTimeout(function() {
            $("#text").append("<p>Choose your army and CO.</p>");
        }, 1500);
        // clear the screen
        $("#play-area").html("");
        $("#play-area").css({"display": "flex","justify-content": "space-between", "align-items": "center"})
        // Make boxes
        function armyBox(color) {
            // create a box
            var box = $("<div>");
            // give it a class for clicking and an idea for color selection 
            box.attr({"class": "army", "id": color});
            return box;
        }
        // make the army boxes
        $("#play-area").append(armyBox("orange"));
        $("#play-area").append(armyBox("blue"));
        $("#play-area").append(armyBox("yellow"));
        $("#play-area").append(armyBox("green"));

        // Don't let it be clickable if it's a spectator
        if (you.role === "spectator") {
            $("#play-area").prepend("<p>You are spectating</p>")
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
                    $("#" + you.army).append("<div id='p1'>");
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
                    $("#" + you.army).append("<div id='p2'>");                    
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
                database.ref('game').child(pString + 'army').on('value', function(snap7) {
                    // update the local variable for the enemy army 
                    pVar.army = snap7.val();
                    // if it got updated to be something
                    if (pVar.army != "") {
                        // mark the option and make it unclickable
                        $("#" + pVar.army).append("<div id=" + pString + ">");
                        $("#" + pVar.army).off("click");
                        // Have you selected anything yet?
                        database.ref('game').child(pNot + 'army').once('value', function(snap8) {
                            if (snap8.val() != '') {
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
        // Get the names of both players
        database.ref('game').once("value", function (snap9) {
            p1.name = snap9.val().p1name;
            p2.name = snap9.val().p2name;
        });
        // clear the screen
        $("#play-area").html("");
        // creat play area ****
        $("#play-area").css({"height":"720px", "display": "flex", "flex-direction": "column", "align-items": "center"});
        // Visulaization of wins this match
        var matchStatus = $("<div id='match-status'>");
        var p1Status = $("<div class='status' id='p1-status'>");
        // Eventually, this will be auromated as 
        // the players will be able to select the number of rounds they want in th ematch
        p1Status.append(" \
        <img src='assets/images/City3.png' /> \
        <img src='assets/images/City3.png' /> \
        <img src='assets/images/City3.png' /> \
        <img src='assets/images/" + p1.army + "HQ3.png' /> \
        ");
        var p2Status = $("<div class='status' id='p2-status'>");
        p2Status.append(" \
        <img src='assets/images/City3.png' /> \
        <img src='assets/images/City3.png' /> \
        <img src='assets/images/City3.png' /> \
        <img src='assets/images/" + p2.army + "HQ3.png' /> \
        ");
        matchStatus.append(p1Status);
        matchStatus.append(p2Status);
        console.log(matchStatus);
        $("#play-area").append(matchStatus);
        
        $("#play-area").append("<div>MAP</div>");
        // the function that creates the RPS boxes
        function choiceBox(choice) {
            var box = $("<div>");
            // give it a class for clicking and an idea for color selection 
            box.attr({"class": "choice", "id": choice});
            box.append("<img src='assets/images/" + choice + "3.png' >");
            box.append("<img src='assets/images/" + you.army + choice + "3.png' >");
            return box;
        }
        // Add choices
        $("#play-area").append("<div id='choices'>");

        $("#choices").append(choiceBox("Tank"));
        $("#choices").append(choiceBox("BCoptr"));
        $("#choices").append(choiceBox("AA"));
        // create victory status
        // Start the round!
        roundStart();
    }, 500);
}

var checkFoe;

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
                checkFoe = setInterval(function() {
                    console.log("check");
                    database.ref('game').child('p2choice').once('value', function(snap10) {
                        p2.choice = snap10.val();
                    }).then(function() {
                        if (p2.choice != '') {
                            roundJudge();
                        }
                    });
                }, 1000);
            }

            // else you must be p2. WET code alert
            else {
                p2.choice = you.choice;
                database.ref('game').update({
                    p2choice: you.choice,
                });
                checkFoe = setInterval(function() {
                    console.log("check");
                    database.ref('game').child('p1choice').once('value', function(snap11) {
                        p1.choice = snap11.val();
                    }).then(function() {
                        if (p1.choice != '') {
                            roundJudge();
                        }
                    });
                }, 1000);
            }
        })
    }
}

// Judge the winner from the choices
function roundJudge() {
    clearInterval(checkFoe);
    // Delay to make sure the database has caught up with us
    setTimeout(function() {
        console.log("P1: " + p1.choice + " P2: " + p2.choice) // Checking
        // If it's a tie, no wins go up
        if (p1.choice === p2.choice) {}

        else if (p1.choice === "Tank") {
            if (p2.choice === "AA") {p1.wins++}
            else {p2.wins++}
        }

        else if (p1.choice === "BCoptr") {
            if (p2.choice === "Tank") {p1.wins++}
            else {p2.wins++}
        }

        else {
            if (p2.choice === "BCoptr") {p1.wins++}
            else {p2.wins++}
        }

        console.log("P1 wins: " + p1.wins + " P2 wins: " + p2.wins);
        database.ref('game').update({
            p1wins: p1.wins,
            p2wins: p2.wins
        })

        if (p1.wins >= 2) {
            $("#play-area").html("<p>" + p1.name + " of " + p1.army + " wins!</p>");
            if (you.role === "p1") {
                you.wins++;
                database.ref('users/' + you.key).update({
                    wins: you.wins
                })
            }
            if (you.role === "p2") {
                you.losses++;
                database.ref('users/' + you.key).update({
                    losses: you.losses
                })
            }
            gameReset();
        }
        else if (p2.wins >= 2) {
            $("#play-area").html("<p>" + p2.name  + " of " + p2.army + " wins!</p>");
            if (you.role === "p2") {
                you.wins++;
                database.ref('users/' + you.key).update({
                    wins: you.wins
                })
            }
            if (you.role === "p1") {
                you.losses++;
                database.ref('users/' + you.key).update({
                    losses: you.losses
                })
            }
            gameReset();
        }
        else {
            p1.choice = "";
            p2.choice = "";
            you.choice = "";
            database.ref('game').update({
                p1choice: "",
                p2choice: "",
            })
            roundStart();
        }
    } , 2000);
}

// Reset the server for next game
function gameReset() {
    setTimeout(function() {
        $("#play-area").html("");
        database.ref('game').remove();
    }, 4000);
    setTimeout(function() {
        varReset();
        console.log(you);
        console.log($("#play-area"));
        loginScreen();
    }, 4000);
}


// variables for scrolling the background
var backT = 0;
var sheetPos = 0;

// function to scroll background
function backgroundScroll(timestamp) {
    if (backT % 2 === 0) {
        sheetPos -= 3;
        $("body").css("backgroundPositionX", sheetPos + "px");
        $("body").css("backgroundPositionY", -sheetPos + "px");
    }
    // console.log(backT);
    backT++;
    requestAnimationFrame(backgroundScroll);
}

// function for dialogue box pup up
function dialogue() {
    console.log("dialogue");
    var dialogueBox = $("<div id='dialogue'>");
    var nellFace = $("<div id='nell-face'>");
    dialogueBox.append(nellFace);
    var textBox = $("<div id='text'>");
    dialogueBox.append(textBox);
    $("#play-area").append(dialogueBox);
    var boxY = -144;
    function boxRise(timestamp) {
        if (boxY < 0) {
            boxY +=12;
            dialogueBox.css("bottom", boxY + "px");
            requestAnimationFrame(boxRise)
        }
    }
    requestAnimationFrame(boxRise);
}

varReset();
requestAnimationFrame(backgroundScroll);
loginScreen();
















    // // How to respond to other players picking
    // function roundChoice(pVar, pString, pNot) {
    //     // Only execute if you are not the first player listed
    //     if (you.role != pString) {
    //         // has there been a change to opponent choice?
    //         database.ref('game').child(pString + 'choice').on('value', function(snapshot) {
    //             // Update local variable with that change
    //             pVar.choice = snapshot.val();
    //             console.log(pString + " became " + pVar.choice);
    //             // if it became something
    //             if (pVar.choice != "") {
    //                 // The spectator gets to see what the player chose
    //                 if (you.role === "spectator") {
    //                     $("#" + pVar.army).append(pString);
    //                 }
    //                 // Check if you have made your choice yet. If so, move to judgement
    //                 database.ref('game').child(pNot + 'choice').once('value', function(snap) {
    //                     if (snap.val() != '') {
    //                         roundJudge();
    //                     }
    //                 })
    //             }
    //         });
    //     };
    // };
    // respond to other player choices
    // roundChoice(p1, "p1", "p2");
    // roundChoice(p2, "p2", "p1");