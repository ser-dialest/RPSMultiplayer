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
            database.ref().set({
                p1Name: input.val()
            });
        };
        console.log(input.val());
        // STUFF ABOUT WAITING FOR PLAYER TWO
        // Move to Army Select
        chooseArmy();
    })
}

loginScreen();

