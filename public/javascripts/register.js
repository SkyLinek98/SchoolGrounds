async function register() {
    try {
        let username = document.getElementById("username").value;
        let pass = document.getElementById("password").value;
        let res = await requestRegister(username,pass);
        alert(res.msg);      
    } catch (err) {
        console.log(err);
    }
}