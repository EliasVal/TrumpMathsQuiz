const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const usernameCheck = /[^A-z\d._\-]/

// INITIALIZE FIREBASE
firebase.default.initializeApp({
    apiKey: "AIzaSyCW4Fh2A-l2eijGYi0Z0op7i-Ctmd0RatI",
    authDomain: "mathstrump.firebaseapp.com",
    projectId: "mathstrump",
    storageBucket: "mathstrump.appspot.com",
    messagingSenderId: "534763888909",
    databaseURL: "https://mathstrump-default-rtdb.europe-west1.firebasedatabase.app",
    appId: "1:534763888909:web:b4b21a3e411e0a09bc1044"
})

firebase.default.auth().onAuthStateChanged((user) => {
    if (user) {
        window.location.pathname = "/main"
    }
})


// ALIGN FORM LABELS
var field = document.getElementById('email_login').offsetLeft - document.getElementById('formCont').offsetLeft;
var itemArr = document.getElementsByTagName("label")

for (var i = 0; i < itemArr.length; i++)
{
    itemArr[i].style.marginLeft = field+"px"
}

function blockButton_login() {
    var em = document.getElementById("email_login").value
    var pass = document.getElementById("password_login").value

    var submit = document.getElementById("submit_login")

    if (pass == "" || em == "")
    {
        submit.disabled = true;
    }
    else {
        submit.disabled = false;
    }
}

function updatePassUI_login(elm) {
    if (elm.value == "") {
        document.getElementById("invpass_login").style.display = "block"
        elm.style.border = "1px solid red"
    }
    else {
        document.getElementById("invpass_login").style.display = "none"
        elm.style.border = "1px solid darkgray"
    }
    blockButton_login()
}

function updateEmailUI_login(elm) {
    if (elm.value == "") {
        document.getElementById("invem_login").style.display = "block"
        elm.style.border = "1px solid red"
    }
    else {
        document.getElementById("invem_login").style.display = "none"
        elm.style.border = "1px solid darkgray"
    }
    blockButton_login()
}


function signIn() {
    blockButton_login()

    if (document.getElementById("submit_login").disabled) return;

    var email = document.getElementById('email_login').value
    var pass = document.getElementById('password_login').value

    firebase.default.auth().setPersistence(firebase.default.auth.Auth.Persistence.LOCAL)
    .then(() => {
        firebase.default.auth().signInWithEmailAndPassword(email, pass)
        .then((user) => {
            console.log(user)
            window.location.pathname = "/homepage.html"
        })
        .catch((error) => {
            var errorMessage = error.message;
            alert(errorMessage)
        });
    })
    .catch((error) => {
        var errorMessage = error.message;
        alert(errorMessage)
    });
}







function signUp(/*email, password*/) {
    blockButton_signup()

    const submitBtn = document.getElementById("submit_signup")

    if (submitBtn.disabled) return;

    var email = document.getElementById('email_signup').value
    var pass = document.getElementById('password_signup')
    var username = document.getElementById('username').value
    

    firebase.default.app().auth().createUserWithEmailAndPassword(email, pass.value)
    .then((user) => {
        firebase.default.auth().currentUser.updateProfile({
            displayName: username
        }).catch((e) => {
            var errorMessage = e.message;
            alert(errorMessage)
        })
        // Signed in 
        // ...
    })
    .catch((error) => {
        var errorMessage = error.message;
        alert(errorMessage)
        // ..
    });
}

function blockButton_signup() {
    var email = document.getElementById('email_signup')
    var pass = document.getElementById('password_signup')
    var username = document.getElementById('username')

    var submitBtn = document.getElementById("submit_signup")

    if (CheckEmail(email.value) && CheckPass(pass.value).isValid && CheckUsername(username.value))
    {
        submitBtn.disabled = false
    }
    else {
        submitBtn.disabled = true
        /*updateEmailUI_signup(email)
        updatePassUI_signup(pass)
        updateUsernameUI_signup(username)*/
    }
}

function updatePassUI_signup(passObj) {
    var reqsElm = document.getElementById('reqs')

    if (passObj.value == "") {
        // @ts-ignore
        for (var elm of reqsElm.children)
        {
            elm.style.color = "#8b0000"
        }
        return
    };

    var res = CheckPass(passObj)
    var invpass = document.getElementById("invpass_signup")

    if (res.longEnough) reqsElm.children[0].style.color = "#3d7b2f"
    else reqsElm.children[0].style.color = "#8b0000"

    if (res.hasUppercase) reqsElm.children[1].style.color = "#3d7b2f"
    else reqsElm.children[1].style.color = "#8b0000"

    if (res.hasLowercase) reqsElm.children[2].style.color = "#3d7b2f"
    else reqsElm.children[2].style.color = "#8b0000"

    if (res.hasDigit) reqsElm.children[3].style.color = "#3d7b2f"
    else reqsElm.children[3].style.color = "#8b0000"

    if (res.hasSpecialSymbol) reqsElm.children[4].style.color = "#3d7b2f"
    else reqsElm.children[4].style.color = "#8b0000"

    if (!res.isValid) {
        passObj.style.border = "1px solid red"
        invpass.style.display = "block"
    }
    else {
        passObj.style.border = "1px solid darkgray"
        invpass.style.display = "none"
    }

    blockButton_signup()
}

function updateEmailUI_signup(_email) {
    if (_email.value == "") return;

    var res = CheckEmail(_email.value)

    var invem = document.getElementById("invem_signup")
    
    if (!res) {
        _email.style.border = "1px solid red"
        invem.style.display = "block"
    }
    else {
        _email.style.border = "1px solid darkgray"
        invem.style.display = "none"
    }

    blockButton_signup()
}

function updateUsernameUI_signup(_username) {
    if (_username.value == "") return;

    var res = CheckUsername(_username.value)

    var invusr = document.getElementById("invusr")

    if (!res) {
        _username.style.border = "1px solid red"
        invusr.style.display = "block"
    }
    else {
        _username.style.border = "1px solid darkgray"
        invusr.style.display = "none"
    }

    blockButton_signup()
}

function CheckEmail(email) {
    return new RegExp(emailRegex).test(email)
}

function CheckUsername(username) {
    return (!new RegExp(usernameCheck).test(username) && username.length > 2)
}

function CheckPass(_pass) {
    const pass = isElement(_pass) ? _pass.value : _pass

    const _hasSpecialSymbol = new RegExp(/([^A-z\d]|(\^|_|\[|\]|\\))/).test(pass)
    const _hasUppercase = new RegExp(/[A-Z]/).test(pass)
    const _hasLowercase = new RegExp(/[a-z]/).test(pass)
    const _hasDigit = new RegExp(/\d/).test(pass)
    const _longEnough = (pass.length >= 6)
    return {
        longEnough: _longEnough,
        hasDigit: _hasDigit,
        hasLowercase: _hasLowercase,
        hasUppercase: _hasUppercase,
        hasSpecialSymbol: _hasSpecialSymbol,
        isValid: (_longEnough && _hasDigit && _hasLowercase && _hasUppercase && _hasSpecialSymbol)
    }
}

//Returns true if it is a DOM element    
function isElement(o){
    return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
        o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
    );
}