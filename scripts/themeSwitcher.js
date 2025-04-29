// Declare Variables
const themeSwitcher = document.getElementById("toggleButton");
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const sunIcon = `<img src="assets/icon-sun.svg" alt="sun" class="iconButton">`;
const moonIcon = `<img src="assets/icon-moon.svg" alt="moon" class="iconButton moon">`;


function applyThemeText() {
    const themeTextLight = localStorage.getItem("themeSwitcherLight") || "Light";
    const themeTextDark = localStorage.getItem("themeSwitcherDark") || "Dark";
    const currentTheme = document.documentElement.getAttribute("data-theme");

    // Apply the theme text and icon based on the current theme
    themeSwitcher.innerHTML = currentTheme === "dark" ? `${themeTextLight}${sunIcon}` : `${themeTextDark}${moonIcon}`;
}
applyThemeText();

// Check for a saved theme in localStorage; default to system preference if none
const savedTheme = localStorage.getItem("theme") || (prefersDarkScheme.matches ? "dark" : "light");
document.documentElement.setAttribute("data-theme", savedTheme); // Set the document theme attribute based on the saved or default theme

// Event listener for manual theme switching
themeSwitcher.addEventListener("click", () => {
    // Get the current theme and toggle to the opposite theme
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";

    // Apply the new theme and save it in localStorage
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    applyThemeText(); // Update text and icon based on the new theme
});

// Listen for language change to update theme text
document.addEventListener("languageChanged", applyThemeText);