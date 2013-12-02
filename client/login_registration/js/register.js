var socket = io.connect('http://localhost:8000');

$(document).ready(function () {
    //receive registration result from the server
    socket.on('createUserResult', function (data) {
        var result = data.finalResult;
        //if register successfully, go back to login page
        if (result) {
            alert("Create Account Successfully");
            window.location.href = "login.html";
        } else {
            alert("Duplicated Email");
            $("input#username").val("");
            $("input#password").val("");
        }
    });

    $("#username").keypress(function (e) {
        if (e.which == 13) {
            registerUser();
        }
    });

    $("#password").keypress(function (e) {
        if (e.which == 13) {
            registerUser();
        }
    });
});

function registerUser() {
    var isOk = true;
    var errorLog = "";
    var emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var passwordPattern = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20})/;
    var email = $("input#username").val();
    var password = $("input#password").val();
    if (email == "" || password == "") {
        errorLog += "All fields required\n";
        isOk = false;
    } else {
        //validate email
        if (!emailPattern.test(email)) {
            errorLog += "Invalid email address!!!\n";
            isOk = false;
        }
        //validate password
        if (!passwordPattern.test(password)) {
            errorLog += "Invalid Password!!!\n" +
                "Must have 1 Digit, 1 Lowercase, 1 Uppercase\n" +
                "Length must be between 6 to 20";
            isOk = false;
        }
    }

    //no error occurred, sending registration request to the server, else display error(s)
    if (isOk && errorLog == "") {
        socket.emit('createUser', {
            email: email,
            pass: password
        });
    } else {
        alert(errorLog);
    }
};
