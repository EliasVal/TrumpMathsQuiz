$("#usrname").html(fbUser.displayName)

var globalData: Array<Question>
$.getJSON('/questions.json', (data: object) => {
    globalData = data["questions"]
})

function Submit() {

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


var gameCancelEvent = document.createEvent('Event')
gameCancelEvent.initEvent('cancelled', true, false)

function StartGame(): void {
    let db = firebase.default.database()
    let roomID = getRandomString(6)
    sessionStorage.setItem("room_id", roomID)
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

            if (host) {
                freeRoomRef.update(JSON.parse(`{"${roomID}": null}`))
            }
            db.ref(`users/${opponent}`).once('value', async (val) => {
                let userData = await val.val()
                $('#name').html(userData['name'])
                $('#loses').html(userData['loses'])
                $('#wins').html(userData['wins'])

                $('#searchGameCommenced').children()[0].innerHTML = 'Opponent found!'
                $('#searchGameCommenced').children()[1].style.display = 'none'
                setTimeout(() => {
                    $('#searchGame').remove()
                    
                    displayQuestion(0)
                    $('#game').css('display', 'block')
                }, 2000)
            })

            
        }

        if (!snapshotDT) {
            let strObj = `{"${roomID}": {"p1": "${fbUser.uid}", "age": "${Date.now()}"}}`
            
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
                }
            })
        }
        else {
            if (Math.floor((Date.now() - parseInt(Object.values(snapshotDT)[0]["age"])) / 1000) > 10) {
                
                let strObj = `{"${roomID}": {"p1": "${fbUser.uid}", "age": "${Date.now()}"}}`
                await freeRoomRef.update(JSON.parse(strObj))
                let keepAliveInterval = setInterval(() => {
                    freeRoomRef.child(`${roomID}`).update({ age: Date.now().toString() })
                }, 30 * 1000)
                
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
                    }
                })
                
            }
            else {
                sessionStorage.setItem("roomID", Object.keys(snapshotDT)[0])
                let strObj = `{"${Object.keys(snapshotDT)[0]}": {"participants": {"${fbUser.uid}": {"pts": 0}, "${Object.values(snapshotDT)[0]["p1"]}": {"pts": 0}}}}`
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