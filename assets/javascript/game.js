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
