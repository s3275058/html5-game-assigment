var
    socket = io.connect('http://localhost:8000'),
    email,
    slotNumb = 0,
    nullSlot = [],
    colorSelected = "",
    gameTypeSelected = "",
    heroIdSelected,
    heroLevel,
    heroMainColor,
    heroExp;
var canvas, context, rects;
var hero;

$(document).ready(function () {

    initScreen();
    //sending request to server for display hero
    socket.emit('displayHero', {encryptedHtml: location.search});

    //receive request result from server
    socket.on('displayHeroResult', function (data) {
        var result = data.finalResult;

        for (var i = 1; i < 7; i++) {
            nullSlot[i] = true;
        }

        email = data.email;

        if (result == true) {
            //parsing data from
            hero = JSON.parse(JSON.stringify(data.hero));

            for (var i = 0; i < hero.length; i++) {
                nullSlot[hero[i].heroId] = false;
                for (var j = 0; j < rects.length; j++) {
                    if (hero[i].heroId == rects[j].id) {
                        //draw rects
                        rects[j].color = hero[i].mainColor;
                        context.fillStyle = hero[i].mainColor;
                        context.fillRect(rects[j].x, rects[j].y, rects[j].w, rects[j].h);

                        //draw text
                        context.font = "16px Arial";
                        context.fillStyle = 'white';
                        context.fillText("hero ID: " + hero[i].heroId, rects[j].x, rects[j].y + 20);
                        context.fillText("color: " + hero[i].mainColor, rects[j].x, rects[j].y + 40);
                    }

                    // if there is no hero, draw white rects
                    if (rects[j].color == "") {
                        //draw rects
                        context.fillStyle = "white";
                        context.fillRect(rects[j].x, rects[j].y, rects[j].w, rects[j].h);
                    }
                }
            }
        } else {
            // if email does not have any hero, draw white canvases
            drawCanvas();
        }
    });

    socket.on('selectHeroResult', function (data) {
        var result = data.finalResult;

        if (result == true) {
            heroIdSelected = data.heroId;
            heroLevel = data.level;
            heroMainColor = data.mainColor;
            heroExp = data.exper;
            document.getElementById("gameType").style.display = "block";
        } else {
            alert("Fail To Select Hero");
        }
    });

    socket.on('createHeroResult', function (data) {
        var result = data.finalResult;
        if (result == true) {
            //redirect client to hero list page
            window.location = data.encryptedHtml;
        } else {
            alert("Create Hero Failed");
        }
    });

    socket.on('joinGameResult', function (data) {
        var result = data.finalResult;
        if (result == true) {
            //redirect client to game page
            window.location = data.gameUrl;
        } else {
            alert("Join Game Failed");
        }
    });
});

function setColor(color) {
    var isOk = false;
    colorSelected = color;
    if (colorSelected == "red" || colorSelected == "blue" || colorSelected == "green") {
        isOk = true;
    }
    return isOk;
};

function setGameType(gameType) {
    var isOk = false;
    gameTypeSelected = gameType;
    if (gameTypeSelected == "campaign" || gameTypeSelected == "pvp") {
        isOk = true;
    }
    return isOk;
};

function btnClick() {
    if (colorSelected != "") {
        socket.emit('createHero',
            {
                heroId: slotNumb,
                email: email,
                mainColor: colorSelected
            });
    } else {
        alert("Please Select A Color For Hero");
    }
};

function btnGameClick() {
    if (gameTypeSelected != "") {

        var urlGame = "../game/index.html";
        socket.emit('joinGame',
            {
                urlGame: urlGame,
                email: email,
                heroId: heroIdSelected.toString(),
                level: heroLevel.toString(),
                exper: heroExp.toString(),
                mainColor: heroMainColor.toString(),
                gameType: gameTypeSelected
            });
    } else {
        alert("Please Select Game Type");
    }
};

function backClick() {
    document.getElementById("createHero").style.display = "none";
};

function backGameClick() {
    document.getElementById("gameType").style.display = "none";
};

//draw canvas for the herolist
function drawCanvas() {
    for (var i = 0, len = rects.length; i < len; i++) {
        context.fillStyle = "white";
        context.fillRect(rects[i].x, rects[i].y, rects[i].w, rects[i].h);
    }
};

function collides(re, x, y) {
    var isCollision = false;
    for (var i = 0, len = re.length; i < len; i++) {
        var left = re[i].x, right = re[i].x + re[i].w;
        var top = re[i].y, bottom = re[i].y + re[i].h;
        if (right >= x
            && left <= x
            && bottom >= y
            && top <= y) {
            isCollision = re[i];
        }
    }
    return isCollision;
};
//get the coordination of the mouse
function getMousePos(stage, evt) {

    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
};
//prepare the screen, ready for displaying the heroes
function initScreen() {
    canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');

    context.fillStyle = "#000000";
    context.fillRect(0, 0, 800, 600);

    rects = [
        {id: 1, x: 50, y: 50, w: 220, h: 240, color: ""},
        {id: 2, x: 290, y: 50, w: 220, h: 240, color: ""},
        {id: 3, x: 530, y: 50, w: 220, h: 240, color: ""},
        {id: 4, x: 50, y: 310, w: 220, h: 240, color: ""},
        {id: 5, x: 290, y: 310, w: 220, h: 240, color: ""},
        {id: 6, x: 530, y: 310, w: 220, h: 240, color: ""}
    ];

    for (var i = 0, len = rects.length; i < len; i++) {
        context.fillStyle = rects[i].color;
        context.fillRect(rects[i].x, rects[i].y, rects[i].w, rects[i].h);

    }

    canvas.addEventListener('click', function (e) {
        var mousePos = getMousePos(canvas, e);
        var rect = collides(rects, mousePos.x, mousePos.y);

        if (rect) {
            if (nullSlot[rect.id] == false) {
                heroIdSelected = rect.id;
                socket.emit('selectHero', {heroId: rect.id, email: email});
            } else {
                slotNumb = parseInt(rect.id);
                document.getElementById("createHero").style.display = "block";
            }
        }
    }, false);
}