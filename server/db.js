var
    db = module.exports,
    mysql = require('mysql'),
    connection = mysql.createConnection('mysql://root:@localhost/assignment?insecureAuth=true');
var alphabet = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
    'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
    'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    ' ', '.', ',', '(', ')', '-', '!', '?', '@', '=', '_', '&', ';', ':',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
    'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
    's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
];
var KEY = 10;

db.init = function () {
    connection.connect();
};

db.handleClient = function (client) {
    //receive login validation request from user
    client.on('selectUser', function (data) {

        selectUser(data.email, data.pass, client);
    });

    //receive create new account request from user
    client.on('createUser', function (data) {
        createUser(data.email, data.pass, client);
    });

    //receive create new hero request from user
    client.on('createHero', function (data) {
        createHero(data.heroId, data.email, data.mainColor, client);
    });

    //receive display hero request from user
    client.on('displayHero', function (data) {
        displayHero(data.encryptedHtml, client);
    });

    //receive select hero request from user
    client.on('selectHero', function (data) {
        selectHero(data.email, data.heroId, client);
    });

    //receive delete hero request from user
    client.on('deleteHero', function (data) {
        deleteHero(data.heroId, data.email, client);
    });

    //receive update hero request from user
    client.on('updateHero', function (data) {
        updateHero(data.heroId, data.email, data.level, data.exper, client);
    });

    //receive join game request from user
    client.on('joinGame', function (data) {
        joinGame(data.urlGame, data.email, data.heroId, data.level, data.exper, data.mainColor, data.gameType, client);
    });
};

/*User SQL*/
/*Validate User ID*/
function selectUser(email, password, client) {
    var sqlQuery = 'SELECT * FROM login  WHERE email=? AND password=?';
    var isOk = false;
    var condition = [email, password];
    var encryptedHtml = "";

    connection.query(sqlQuery, condition, function (err, rows) {
        if (err) {
            console.log(err.code);
            isOk = false;
        } else {
            if (rows.length > 0) {
                isOk = true;
                console.log("Login Successfully");
                var dataSend = rows[0].email;
                encryptedHtml = "hero_list.html?username=" + encryptCeasar(dataSend, KEY);
            }
        }
        //emit result
        client.emit('selectUserResult', {
            finalResult: isOk,
            encryptedHtml: encryptedHtml
        });
    });
};

/*User Registration*/
function createUser(email, password, client) {

    var sqlQuery = 'INSERT INTO login SET ?';
    var isOk = false;
    var post = {
        email: email,
        password: password
    };

    connection.query(sqlQuery, post, function (err) {
        if (err) {
            console.log(err.code);
        } else {
            console.log("Insert Successfully");
            isOk = true;
        }

        client.emit('createUserResult', {
            finalResult: isOk
        });
    });
};

/*Hero SQL*/
/*Display Hero*/
function displayHero(encryptedHtml, client) {
    var sqlQuery = 'SELECT * FROM hero  WHERE email=?';
    var isOk = false;
    var data = encryptedHtml.substring(10, encryptedHtml.length);
    var email = decryptCeasar(data, KEY);

    connection.query(sqlQuery, email, function (err, rows) {
        if (err) {
            console.log(err.code);
        } else {
            if (rows.length > 0) {
                isOk = true;
                var aHero = new Array(rows.length);

                for (var i = 0; i < rows.length; i++) {
                    aHero[i] = {
                        heroId: rows[i].heroId,
                        mainColor: rows[i].mainColor,
                        heroExp: rows[i].exp,
                        level: rows[i].level
                    }
                }
                console.log("Display Heroes Successfully");
            }
        }
        //transmit data
        client.emit('displayHeroResult', {
            finalResult: isOk,
            hero: aHero,
            email: email
        });
    });
};

/*Hero SQL*/
/*Select Hero*/
function selectHero(email, heroId, client) {
    var sqlQuery = 'SELECT * FROM hero  WHERE email=? AND heroId=?';
    var isOk = false;
    var heroRId, level, mainColor, exp;
    var condition = [email, heroId];

    connection.query(sqlQuery, condition, function (err, rows) {
        if (err) {
            console.log(err.code);
        } else {
            if (rows.length > 0) {
                heroRId = rows[0].heroId;
                level = rows[0].level;
                mainColor = rows[0].mainColor;
                exp = rows[0].exp;

                console.log("Select Hero Successfully");
                isOk = true;
            }
        }
        //transmit data
        client.emit('selectHeroResult',
            {
                finalResult: isOk,
                heroId: heroRId,
                level: level,
                mainColor: mainColor,
                exper: exp
            });
    });
};

/*Hero SQL*/
/*Create New Hero*/
function createHero(heroId, email, mainColor, client) {

    var sqlQuery = 'INSERT INTO hero SET ?';
    var isOk = false;
    var html = "";
    console.log(heroId);
    console.log(email);
    var infor =
    {
        heroId: heroId,
        email: email,
        mainColor: mainColor,
        health: 500,
        exp: 0,
        kills: 0,
        level: 1
    };

    connection.query(sqlQuery, infor, function (err) {
        if (err) {
            console.log(err.code);
        } else {
            html = "hero_list.html?username=" + encryptCeasar(email, KEY);
            console.log("Create Hero Successfully");
            isOk = true;
        }
        //transmit data
        client.emit('createHeroResult', {
            finalResult: isOk,
            encryptedHtml: html
        });
    });
};

/*Hero SQL*/
/*Delete Hero*/
function deleteHero(heroId, email, client) {
    var sqlQuery = 'DELETE FROM login  WHERE email=? AND heroId=?';
    var isOk = false;
    var condition = [email, heroId];

    connection.query(sqlQuery, condition, function (err) {
        if (err) {
            console.log(err.code);
        } else {
            console.log("Delete Hero Successfully");
            isOk = true;
        }
        //transmit data
        client.emit('deleteHeroResult', {
            finalResult: isOk
        });
    });
};

/*Hero SQL*/
/*Update Hero*/
function updateHero(heroId, email, level, exper, client) {
    var sqlQuery = 'UPDATE FROM hero SET level=?, exp=? WHERE email=? AND heroId=?';
    var isOk = false;
    var condition = [level, exper, email, heroId];
    connection.query(sqlQuery, condition, function (err) {
        if (err) {
            console.log(err.code);
        } else {
            console.log("Update Hero Successfully");
            isOk = true;
        }
        //transmit data
        client.emit('updateHeroResult', {
            finalResult: isOk
        });
    });
};


/*Game URL encryption*/
function joinGame(urlGame, email, heroId, level, exper, mainColor, gameType, client) {
    var isOk = false;
    var html = "";
    if (urlGame != "" && email != "" && heroId != "" && level != "" && exper != "" && mainColor != "" && gameType != "") {
        var encEmail = encryptCeasar(email, KEY);
        var encHeroId = encryptCeasar(heroId, KEY);
        var encLevel = encryptCeasar(level, KEY);
        var encExper = encryptCeasar(exper, KEY);
        var encMainColor = encryptCeasar(mainColor, KEY);
        var encGameType = encryptCeasar(gameType, KEY);

        //encrypt html url
        html = urlGame + "?username=" + encEmail + "&heroId=" + encHeroId
            + "&level=" + encLevel + "&exp=" + encExper
            + "&color=" + encMainColor + "&type=" + encGameType;
        console.log("Join Game Successfully");
        isOk = true;
    }
    //data before encryption
    console.log("urlGame: " + urlGame);
    console.log("email: " + email);
    console.log("heroId: " + heroId);
    console.log("level: " + level);
    console.log("exper: " + exper);
    console.log("mainColor: " + mainColor);
    console.log("gameType: " + gameType);
    console.log("---------------");
    //data after encryption
    console.log("email: " + encEmail);
    console.log("heroId: " + encHeroId);
    console.log("level: " + encLevel);
    console.log("exper: " + encExper);
    console.log("mainColor: " + encMainColor);
    console.log("gameType: " + encGameType);
    console.log("---------------");
    console.log(html);
    console.log("---------------");

    //transmit data
    client.emit('joinGameResult',
        {
            finalResult: isOk,
            gameUrl: html
        });
};

/*Encryption*/
function encryptCeasar(plainText, KEY) {
    var plainArray = new Array(plainText.length);
    var cipher = "";

    //split string into char
    for (var i = 0; i < plainText.length; i++) {
        plainArray[i] = plainText.charAt(i);
    }
    //encrypt
    for (var i = 0; i < plainText.length; i++) {
        for (var j = 0; j < alphabet.length; j++) {
            if (alphabet[j] == plainText.charAt(i)) {
                if ((j + KEY) < alphabet.length) {
                    plainArray[i] = alphabet[j + KEY];
                } else {
                    plainArray[i] = alphabet[(j + KEY) - alphabet.length];
                }
            }
        }
    }
    //generate cipher
    for (var i = 0; i < plainArray.length; i++) {
        cipher += plainArray[i];
    }
    return cipher;
};

/*Decryption*/
function decryptCeasar(cipherText, KEY) {
    var cipherArray = new Array(cipherText.length);
    var plain = "";

    //split string into char
    for (var i = 0; i < cipherText.length; i++) {
        cipherArray[i] = cipherText.charAt(i);
    }

    //decrypt
    for (var i = 0; i < cipherText.length; i++) {
        for (var j = 0; j < alphabet.length; j++) {
            if (cipherText.charAt(i) == alphabet[j]) {
                if ((j - KEY) >= 0) {
                    cipherArray[i] = alphabet[j - KEY];
                } else {
                    cipherArray[i] = alphabet[(j - KEY) + alphabet.length];
                }
            }
        }
    }
    //generate result
    for (var i = 0; i < cipherArray.length; i++) {
        plain += cipherArray[i];
    }
    return plain;
};

