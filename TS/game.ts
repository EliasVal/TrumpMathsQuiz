$("#usrname").html(fbUser.displayName)

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
                    removeEventListener('cancelled', cancelled)
                    clearInterval(keepAliveInterval)
                    freeRoomRef.update(JSON.parse(`{"${roomID}": null}`))
                    $('#searchGameCommenced').children()[0].innerHTML = 'Opponent found!'
                    $('#searchGameCommenced').children()[1].style.display = 'none'
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
                        removeEventListener('cancelled', cancelled)
                        clearInterval(keepAliveInterval)
                        freeRoomRef.update(JSON.parse(`{"${roomID}": null}`))
                        $('#searchGameCommenced').children()[0].innerHTML = 'Opponent found!'
                        $('#searchGameCommenced').children()[1].style.display = 'none'
                    }
                })
                
            }
            else {
                let strObj = `{"${Object.keys(snapshotDT)[0]}": {"participants": {"${fbUser.uid}": {"pts": 0}, "${Object.values(snapshotDT)[0]["p1"]}": {"pts": 0}}}}`
                occupiedRoomRef.update(JSON.parse(strObj))
                $('#searchGameCommenced').children()[0].innerHTML = 'Opponent found!'
                $('#searchGameCommenced').children()[1].style.display = 'none'
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