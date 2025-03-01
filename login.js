document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    console.log("Login successful with:", email, password);
    alert("Login successful!");
    
    // Redirect to dashboard or homepage (Modify as needed)
    window.location.href = "dashboard.html";
});
