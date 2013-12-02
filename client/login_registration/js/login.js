var socket = io.connect('http://localhost:8000');

$(document).ready(function () {
    //receive login result from server
    socket.on('selectUserResult', function (data) {
        var result = data.finalResult;

        if (result == true) {
            //display the loading page before redirecting to the hero list page
            loadingScreen(data.encryptedHtml);
        } else {
            alert("Invalid Email or Password!!!");
            $("input#username").val("");
            $("input#password").val("");
        }
    });

    $("#username").keypress(function (e) {
        if (e.which == 13) {
            loginUser();
        }
    });

    $("#password").keypress(function (e) {
        if (e.which == 13) {
            loginUser();
        }
    });
});

function loadingScreen(svMess) {
    document.getElementById("wrapper").style.display = "block";
    setTimeout(function () {
        window.location = svMess
    }, 3000);
};

function loginUser() {
    var isOk = true;
    var errorLog = ""
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
                "Must have 1 Digit, 1 Lowercase character and 1 Uppercase character\n" +
                "Length must be between 6 to 20";
            isOk = false;
        }
    }

    //no error occurred, sending login request to server, else display error(s)
    if (isOk && errorLog == "") {
        socket.emit('selectUser', {
            email: email,
            pass: password
        });
    } else {
        alert(errorLog);
    }
};