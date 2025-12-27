// Wait until the HTML document is fully loaded
document.addEventListener("DOMContentLoaded", () => {

    // Fetch the navbar HTML fragment
    fetch("/html/navbar.html")
        .then(response => {
            // If fetch fails, throw an error
            if (!response.ok) {
                throw new Error("Failed to load navbar");
            }
            return response.text();
        })
        .then(html => {
            // Insert navbar at the top of the page body
            document.body.insertAdjacentHTML("afterbegin", html);
        })
        .catch(error => {
            console.error(error);
        });

});
