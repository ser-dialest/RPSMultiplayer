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
var p1 = {name: "", army: "", choice: ""};
//who is player 2
var p2 = {name: "", army: "", choice: ""};
// who are you?
var you = {
    // What is your key in the database?
    key: "keybutt",
    // What is your name?
    name: "namebutt",
    // What role do you have in this match?
    role: "rolebutt",
    // What army do you command?
    army: ""
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
            console.log(input.val()); // check name was entered
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
                    })
                }
                else {
                    // If user already exists, grab the data key for the user and store to local object for later
                    database.ref().child('users').orderByChild('username').equalTo(input.val()).once("value", function(snap) {
                        snapshot.forEach(function(data) {
                            you.key = data.key;
                            you.name = input.val();
                            console.log(you); // checking
                        });
                    });
                }
                console.log(input.val() + ' does '+(snapshot.exists()?'':'not ')+'exist.'); // checking
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
                                console.log(you); // checking
                            }
                            else { // if player 1 and 2 both exist
                                console.log("There are already 2 players");
                                you.role = "spectator";
                                // IDEALLY, PLAYERS WILL BE ABLE TO SPECTATE GAMES AND THEN PLAY AGAINST THE WINNER
                                // THIS FEATURE IS NOT IMPLEMENTED YET 
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
    setTimeout(function () { 
        // clear the screen
        $("body").html("");
        $("body").css({"height":"300px", "display": "flex","justify-content": "space-around", "align-items": "center"})
        console.log(you.role);
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
                console.log($(this).attr("id"));
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
            if (you.role != pString) {                
                database.ref('game').child(pString + 'army').on('value', function(snapshot) {
                    pVar.army = snapshot.val();
                    if (pVar.army != "") {
                        $("#" + pVar.army).css("background", "gray");
                        $("#" + pVar.army).text(pString);
                        $("#" + pVar.army).off("click");
                        database.ref('game').child(pNot + 'army').once('value', function(snap) {
                            if (snap.val() != '') {
                                loadGame();
                            }
                        })
                    }
                });
            };
        };

        armySelected(p1, "p1", "p2");
        armySelected(p2, "p2", "p1");
        
    }, 500);
}

function loadGame() {
    // clear the screen
    $("body").html("");
    // creat play are ****
    $("body").css({"height":"600px", "display": "flex","justify-content": "column", "align-items": "center"});
    $("body").append("<div>MAP</div>");
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
}

// Playing a round
function roundStart() {
    if (you.role != "spectator") {
        $(".choice").on("click", function () {
            $(".choice").off("click");
            console.log($(this).attr("id"));
            you.choice = $(this).attr("id");
            if (you.role === "p1") {
                database.ref('games').update({
                    p1choice: you.choice,
                })   
            }
            if (you.role === "p2") {
                database.ref('games').update({
                    p2choice: you.choice,
                })   
            }
        })
    }
    
    // roundJudge(choice);

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
