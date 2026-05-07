if(!localStorage.getItem("token")){
  window.location.href = "login.html";
}
if(localStorage.getItem("token")){
  window.location.href = "index.html";
}
async function login() {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:3000/login", {
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      email,
      password
    })
  });

  const data = await res.json();

  if(data.token){

    localStorage.setItem("token", data.token);

    window.location.href = "index.html";

  } else {
    document.getElementById("message").innerText =
      "Login failed";
  }
}

async function signup() {

  const username =
    document.getElementById("username").value;

  const email =
    document.getElementById("email").value;

  const password =
    document.getElementById("password").value;

  const res = await fetch("http://localhost:3000/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username,
      email,
      password
    })
  });

  const data = await res.text();

  document.getElementById("message").innerText = data;
}