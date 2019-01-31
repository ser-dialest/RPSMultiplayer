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

// Let's do it. Declare the database
var database = firebase.database();

var wins = 0;
var losses = 0;

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
            // FIREBASE COMPONENT - check if p1 has been declared yet ****
            // set p1Name
            database.ref().update({
                p1Name: input.val()
            });
        };
        console.log(input.val());
        // STUFF ABOUT WAITING FOR PLAYER TWO
        // Move to Army Select
        chooseArmy();
    })
}

function chooseArmy(){
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
    // make the boxes
    $("body").append(armyBox("orange"));
    $("body").append(armyBox("blue"));
    $("body").append(armyBox("yellow"));
    $("body").append(armyBox("green"));
    // make the armies selectable
    $(".army").on("click", function () {
        console.log($(this).attr("id"));
        database.ref().update({
            p1Army: $(this).attr("id")
        });
        loadGame();
    })
}

function loadGame() {
    // clear the screen
    $("body").html("");
    // creat play are ****
    $("body").css({"height":"600px", "display": "flex","justify-content": "column", "align-items": "center"})

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

    $(".army").on("click", function () {
        console.log($(this).attr("id"));
        database.ref().update({
            p1Army: $(this).attr("id")
        });
        loadGame();
    })

}

loginScreen();

