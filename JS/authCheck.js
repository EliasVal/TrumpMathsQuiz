"use strict";
// INITIALIZE FIREBASE
firebase.default.initializeApp({
    apiKey: "AIzaSyCW4Fh2A-l2eijGYi0Z0op7i-Ctmd0RatI",
    authDomain: "mathstrump.firebaseapp.com",
    projectId: "mathstrump",
    storageBucket: "mathstrump.appspot.com",
    messagingSenderId: "534763888909",
    databaseURL: "https://mathstrump-default-rtdb.europe-west1.firebasedatabase.app",
    appId: "1:534763888909:web:b4b21a3e411e0a09bc1044"
});
firebase.default.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.pathname = "/";
    }
});
