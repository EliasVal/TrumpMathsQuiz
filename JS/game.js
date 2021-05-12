"use strict";
$("#usrname").html(fbUser.displayName);
function StartGame() {
    let db = firebase.default.database();
    let roomID = getRandomString(6);
    let freeRoomRef = db.ref('/free_rooms');
    let occupiedRoomRef = db.ref('/occupied_rooms');
    freeRoomRef.once("value", async (snapshot) => {
        let snapshotDT = await snapshot.val();
        if (!snapshotDT) {
            let strObj = `{"${roomID}": {"p1": "${fbUser.uid}", "age": "${Date.now()}"}}`;
            await freeRoomRef.update(JSON.parse(strObj));
            let keepAliveInterval = setInterval(() => {
                freeRoomRef.child(`${roomID}`).update({ age: Date.now().toString() });
            }, 5 * 1000);
            let occupiedRoomRef = db.ref('/occupied_rooms');
            occupiedRoomRef.child(roomID).on('value', async (data) => {
                let dt = await data.val();
                if (dt != null) {
                    console.log(dt);
                    clearInterval(keepAliveInterval);
                }
            });
        }
        else {
            if (Math.floor((Date.now() - parseInt(Object.values(snapshotDT)[0]["age"])) / 1000) > 10) {
                freeRoomRef.update(JSON.parse(`{"${Object.keys(snapshotDT)[0]}": null}`));
                let strObj = `{"${roomID}": {"p1": "${fbUser.uid}", "age": "${Date.now()}"}}`;
                await freeRoomRef.update(JSON.parse(strObj));
                let keepAliveInterval = setInterval(() => {
                    freeRoomRef.child(`${roomID}`).update({ age: Date.now().toString() });
                }, 30 * 1000);
                let occupiedRoomRef = db.ref('/occupied_rooms');
                occupiedRoomRef.child(roomID).on('value', async (data) => {
                    let dt = await data.val();
                    if (dt != null) {
                        console.log(dt);
                        clearInterval(keepAliveInterval);
                    }
                });
            }
            else {
                let strObj = `{"${Object.keys(snapshotDT)[0]}": {"participants": {"${fbUser.uid}": {"pts": 0}, "${Object.values(snapshotDT)[0]["p1"]}": {"pts": 0}}}}`;
                occupiedRoomRef.update(JSON.parse(strObj));
                freeRoomRef.update(JSON.parse(`{"${Object.keys(snapshotDT)[0]}": null}`));
            }
        }
    });
}
function getRandomString(length) {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for (var i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}
