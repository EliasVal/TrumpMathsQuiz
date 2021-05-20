firebase.default.database().ref(`users/${fbUser.uid}`).once('value', async val => {
    let dt = await val.val()
    $("#usrname").html(fbUser.displayName)
    $("#usrWins").html(dt.wins)
    $("#usrLoses").html(dt.loses)

    let ratio: number | Array<string> | string = dt.wins / (dt.loses >= 1 ? dt.loses : 1)
    ratio = ratio.toString().split(".")
    if (!ratio[1]) {
        ratio[1] = "0"
    }
    else {
        ratio[1] = ratio[1].substr(0, 2)
    }
    ratio = ratio.join(".")
    
    $("#usrWLR").html(ratio)
})

sessionStorage.removeItem("waitingFinish")

var globalData: Array<Question>
$.getJSON('/questions.json', (data: object) => {
    globalData = data["questions"]
    //displayQuestion(0)
})
var questionIdx = 0
var score = 0
function Submit() {
    $($('#questionAnswers').children("button")[0]).attr("onclick", null)
    for (let elm of $('#questionAnswers').children('div').children("input")) {
        $(elm).attr("readonly", "")
        $(elm).addClass("unselectable")
    }
    let question = globalData[questionIdx]
    let ppa;
    let possibleAnswers = question.answers

    if (question.answerType == "x") {
        ppa = 100 / (question.answers.length + question.notAnswers.length)
        let possibleNotAnswers = question.notAnswers
        for (let elm of $('#questionAnswers').children('div').children('.ans')) {

            if (possibleAnswers.includes(parseFloat(elm.value))) {
                possibleAnswers.splice(possibleAnswers.indexOf(parseFloat(elm.value)), 1)
                elm.style.backgroundColor = "#68c653"
                score += ppa
            }
            else {
                elm.style.backgroundColor = "#8b0000"
                elm.style.color = "#FFFFFF"
            }
        }
        for (let elm of $('#questionAnswers').children('div').children('.notAns')) {
            if (possibleNotAnswers.includes(parseFloat(elm.value))) {
                possibleNotAnswers.splice(possibleNotAnswers.indexOf(parseFloat(elm.value)), 1)
                elm.style.backgroundColor = "#68c653"
                score += ppa
            }
            else {
                elm.style.backgroundColor = "#8b0000"
                elm.style.color = "#FFFFFF"
            }
        }
    }
    else if (question.answerType == "multi") {
        ppa = 100 / (question.answers.length * 2)
        let elms = $('#questionAnswers').children('div').children('.ans');
        let checkQuestionIdx = 0
        for (let i = 0; i < elms.length; i+=2, checkQuestionIdx++) {
            if (possibleAnswers[checkQuestionIdx][0] == parseFloat(elms[i].value)) {
                score += ppa
                elms[i].style.backgroundColor = "#68c653"
            }
            else {
                elms[i].style.backgroundColor = "#8b0000"
                elms[i].style.color = "#FFFFFF"
            }
            if (possibleAnswers[checkQuestionIdx][1] == parseFloat(elms[i+1].value)) {
                score += ppa
                elms[i+1].style.backgroundColor = "#68c653"
            }
            else {
                elms[i+1].style.backgroundColor = "#8b0000"
                elms[i+1].style.color = "#FFFFFF"
            }
        }
    }

    score = Math.floor(score)
    $("#score").html(score.toString())
    let db = firebase.default.database()
    db.ref(`occupied_rooms/${sessionStorage.getItem("roomID")}/participants/${fbUser.uid}`).update({
        pts: score
    })
    setTimeout(() => {
        questionIdx++
        if (questionIdx >= globalData.length || sessionStorage.getItem("waitingFinish") == "true")
        {
            
            questionIdx = globalData.length + 1
            db.ref(`occupied_rooms/${sessionStorage.getItem("roomID")}/participants/${fbUser.uid}`).update({
                finished: true
            })
            
            if (sessionStorage.getItem("waitingFinish"))
            {
                db.ref(`occupied_rooms/${sessionStorage.getItem("roomID")}/participants/${sessionStorage.getItem("opponent")}`).on("value", async (_roomDT) => {
                    let roomDT = await _roomDT.val()
                    EndGame(roomDT)
                })
            }
            else {
                $('#questionContainer').fadeOut(1000)
                $($('#questionsTab').children('h1')[0]).fadeOut(1000)
                setTimeout(() => {
                    $("#wait").fadeIn(1000)
                }, 1500)
            }
        }
        else {
            displayQuestion(questionIdx)
        }
    }, 3000)
    
}

function displayQuestion(idx:number) {
    $('#questionHeader').html(globalData[idx].question)
    $('#questionImage').attr('src', globalData[idx].link)
    $('#questionAnswers').html('')
    
    if (globalData[idx].answerType == "multi") {
        for (var letter of globalData[idx].letters) {
            let letterElm = document.createElement("div")
            letterElm.style.textAlign = "center"
            let p: any = document.createElement("p")
            let input: any = document.createElement("input")

            $(input).attr('oninput', `numValidate(this)`)
            $(input).addClass("ans")

            p = document.createElement("p").innerHTML = `${letter} (`

            letterElm.append(p)
            letterElm.append(input)

            p = document.createElement("p").innerHTML = "), ("

            input = document.createElement("input")
            $(input).attr('oninput', `numValidate(this)`)
            $(input).addClass("ans")

            letterElm.append(p)
            letterElm.append(input)

            p = document.createElement("p").innerHTML = ")"

            letterElm.append(p)

            $("#questionAnswers").append(letterElm)
        }
    }
    else if (globalData[idx].answerType == "x") {
        for (let answer of globalData[idx].answers) {
            let answerElm = document.createElement("div")
            answerElm.style.textAlign = "center"


            let p: any = document.createElement("p")
            let input: any = document.createElement("input")

            $(input).attr('oninput', `numValidate(this)`)
            $(input).addClass("ans")

            p = document.createElement("p").innerHTML = `x = `

            answerElm.append(p)
            answerElm.append(input)

            $("#questionAnswers").append(answerElm)
        }
        for (let notAnswer of globalData[idx].notAnswers) {
            let answerElm = document.createElement("div")
            answerElm.style.textAlign = "center"


            let p: any = document.createElement("p")
            let input: any = document.createElement("input")

            $(input).attr('oninput', `numValidate(this)`)
            $(input).addClass("notAns")

            p = document.createElement("p").innerHTML = `x ≠ `

            answerElm.append(p)
            answerElm.append(input)

            $("#questionAnswers").append(answerElm)
        }
    }
    let submitBtn = document.createElement("button")
    submitBtn.innerHTML = "Submit"
    $(submitBtn).addClass("btn")
    $(submitBtn).attr("onclick", "Submit()")
    $("#questionAnswers").append(submitBtn)
}



function numValidate(elm) {
    elm.value = elm.value.replace(/[^\d\-\.]/gmi, "")

    if ((elm.value.match(/\d/gmi) && elm.value.match(/\d/gmi).length > 3))
    {
        elm.value = elm.value.substring(0, elm.value.length-1)
    }
    
    if (elm.value.lastIndexOf("-") != 0)
    {
        elm.value = elm.value.substring(0, elm.value.lastIndexOf("-")) + elm.value.substring(elm.value.lastIndexOf("-")+1, elm.value.length)
    }
    
    if (elm.value.includes(".") && !Number.isInteger(parseInt(elm.value[elm.value.indexOf(".")-1]))) 
    {
        elm.value = elm.value.substring(0, elm.value.indexOf(".")) + elm.value.substring(elm.value.indexOf(".")+1, elm.value.length)
    }
    
    if (elm.value.match(/\./g)?.length > 1)
    {
        elm.value = elm.value.substring(0, elm.value.lastIndexOf(".")) + elm.value.substring(elm.value.lastIndexOf(".")+1, elm.value.length)
    }
}

function EndGame(roomDT: object) {
    let db = firebase.default.database()
    db.ref(`occupied_rooms/${sessionStorage.getItem("roomID")}/participants/${sessionStorage.getItem("opponent")}`).off('value')
    db.ref(`occupied_rooms/${sessionStorage.getItem("roomID")}`).set(null)
    $("#game").fadeOut(1000)
    if (roomDT['pts'] < score) {
        $("#resTxt").html("You Win!")
        db.ref(`users/${fbUser.uid}`).once('value', async uDT => {
            let wins = await uDT.val()['wins']
            db.ref(`users/${fbUser.uid}`).update({
                wins: wins+1
            })
        })
    }
    else if (roomDT['pts'] > score) {
        $("#resTxt").html("You Lose!")
        db.ref(`users/${fbUser.uid}`).once('value', async uDT => {
            let loses = await uDT.val()['loses']
            db.ref(`users/${fbUser.uid}`).update({
                loses: loses+1
            })
        })
    }
    else {
        $("#resTxt").html("It's a tie!")
    }
    
    $("#resScore").html(score.toString())
    $("#resEnemyScore").html(roomDT['pts'].toString())
    setTimeout(() => {
        $("#res").css("display", "initial")
        
    }, 1500);
}

var gameCancelEvent = document.createEvent('Event')
gameCancelEvent.initEvent('cancelled', true, false)

function StartGame(): void {
    let db = firebase.default.database()
    let roomID = getRandomString(6)
    let freeRoomRef = db.ref('/free_rooms')
    let occupiedRoomRef = db.ref('/occupied_rooms')
    freeRoomRef.once("value", async (snapshot) => {
        let snapshotDT = await snapshot.val()
        
        function FoundGame(host:boolean, cancelled?, keepAliveInterval?: number, dt?: object) {
            if (cancelled && keepAliveInterval) {
                removeEventListener('cancelled', cancelled)
                clearInterval(keepAliveInterval)
            }

            let opponent = Object.keys(host ? dt['participants'] : Object.values(dt)[0]['participants'])
            opponent.splice(opponent.indexOf(fbUser.uid), 1)
            sessionStorage.setItem("opponent", opponent[0])
            if (host) {
                freeRoomRef.update(JSON.parse(`{"${roomID}": null}`))
                sessionStorage.setItem("roomID", roomID)
            }
            db.ref(`users/${opponent}`).once('value', async (val) => {
                let userData = await val.val()
                $('#name').html(userData['name'])
                $('#loses').html(userData['loses'])
                $('#wins').html(userData['wins'])

                let ratio: number | Array<string> | string = userData.wins / (userData.loses >= 1 ? userData.loses : 1)
                ratio = ratio.toString().split(".")
                if (!ratio[1]) {
                    ratio[1] = "0"
                }
                else {
                    ratio[1] = ratio[1].substr(0, 2)
                }
                ratio = ratio.join(".")

                $('#WLR').html(ratio)


                $('#searchGameCommenced').children()[0].innerHTML = 'Opponent found!'
                $('#searchGameCommenced').children()[1].style.display = 'none'
                setTimeout(() => {
                    $('#searchGame').remove()
                    
                    displayQuestion(0)
                    $('#game').css('display', 'block')
                }, 2000)
            })
            db.ref(`occupied_rooms/${sessionStorage.getItem("roomID")}/participants/${opponent}`).on("value", async (_roomDT) => {
                let roomDT = await _roomDT.val()
                $("#enemyPts").html(roomDT['pts'])
                $("#finished").html(roomDT['finished'] ? "Yes" : "No")
                if (roomDT['finished'] && questionIdx >= globalData.length) {
                    EndGame(roomDT) 
                }
                else if (roomDT['finished'] && (!sessionStorage.getItem("waitingFinish"))) {
                    sessionStorage.setItem("waitingFinish", "false")
                    alert("Opponent has finished! you have 7 minutes to finish too!")
                    setTimeout(() => {
                        sessionStorage.setItem("waitingFinish", "true")
                        Submit()
                    }, 7 * 60 * 1000)
                }
            })

            
        }

        if (!snapshotDT) {
            let strObj = `{"${roomID}": {"p1": "${fbUser.uid}", "age": ${Date.now()}}}`
            
            await freeRoomRef.update(JSON.parse(strObj))
            let keepAliveInterval = setInterval(() => {
                freeRoomRef.child(`${roomID}`).update({ age: Date.now().toString() })
            }, 5 * 1000)
            
            function cancelled() {
                clearInterval(keepAliveInterval)
                freeRoomRef.update(JSON.parse(`{"${roomID}": null}`))
                sessionStorage.removeItem('roomID')
            }
            addEventListener('cancelled', cancelled)
            let occupiedRoomRef = db.ref('/occupied_rooms')
            occupiedRoomRef.child(roomID).on('value', async (data) => {
                let dt = await data.val()
                if (dt != null) {
                    FoundGame(true, cancelled, keepAliveInterval, dt)
                    occupiedRoomRef.off('value')
                }
            })
        }
        else {
            if (Math.floor((Date.now() - parseInt(Object.values(snapshotDT)[0]["age"])) / 1000) > 10 || Object.values(snapshotDT)[0]["p1"] == fbUser.uid) {
                if (Object.values(snapshotDT)[0]["p1"] != fbUser.uid) {
                    freeRoomRef.update(JSON.parse(`{"${Object.keys(snapshotDT)[0]}": null}`))
                }
                let strObj = `{"${roomID}": {"p1": "${fbUser.uid}", "age": ${Date.now()}}}`
                await freeRoomRef.update(JSON.parse(strObj))
                let keepAliveInterval = setInterval(() => {
                    freeRoomRef.child(`${roomID}`).update({ age: Date.now().toString() })
                }, 5 * 1000)
                
                function cancelled() {
                    clearInterval(keepAliveInterval)
                    freeRoomRef.update(JSON.parse(`{"${roomID}": null}`))
                    sessionStorage.removeItem('roomID')
                }
                addEventListener('cancelled', cancelled)
                let occupiedRoomRef = db.ref('/occupied_rooms')
                occupiedRoomRef.child(roomID).on('value', async (data) => {
                    let dt = await data.val()
                    if (dt != null) {
                        FoundGame(true, cancelled, keepAliveInterval, dt)
                        occupiedRoomRef.off('value')
                    }
                })
                
            }
            else {
                sessionStorage.setItem("roomID", Object.keys(snapshotDT)[0])
                let strObj = `{"${Object.keys(snapshotDT)[0]}": {"participants": {"${fbUser.uid}": {"pts": 0, "finished": false}, "${Object.values(snapshotDT)[0]["p1"]}": {"pts": 0, "finished": false}}}}`
                occupiedRoomRef.update(JSON.parse(strObj))
                FoundGame(false, null, null, JSON.parse(strObj))
            }
        }
        
    })
}




function getRandomString(length: number): string {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for ( var i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

function reactiveElms() {
    $('#sperator').css('height', `${$('body').height() - $('nav').height()}px`)

}
reactiveElms()