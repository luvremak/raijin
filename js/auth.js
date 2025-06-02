const authForm = document.getElementById("auth-form");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const authMessage = document.getElementById("auth-message");

function getUsers() {
  const usersJSON = localStorage.getItem("users");
  return usersJSON ? JSON.parse(usersJSON) : {};
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

signupBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    authMessage.textContent = "Please enter username and password.";
    authMessage.style.color = "red";
    return;
  }

  const users = getUsers();
  if (users[username]) {
    authMessage.textContent = "Username already exists.";
    authMessage.style.color = "red";
    return;
  }

  users[username] = { password };
  saveUsers(users);
  authMessage.textContent = "Sign up successful! You can now log in.";
  authMessage.style.color = "green";

  authForm.reset();
});

loginBtn.addEventListener("click", (e) => {
  e.preventDefault(); 

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    authMessage.textContent = "Please enter username and password.";
    authMessage.style.color = "red";
    return;
  }

  const users = getUsers();
  if (!users[username] || users[username].password !== password) {
    authMessage.textContent = "Invalid username or password.";
    authMessage.style.color = "red";
    return;
  }

  localStorage.setItem("loggedInUser", username);
  window.location.href = "index.html";
});
