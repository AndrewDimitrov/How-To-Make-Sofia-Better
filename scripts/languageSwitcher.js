// Declare Variables
const languageToggleButton = document.getElementById("languageToggleButton");
let currentLanguage = localStorage.getItem("language") || "en"; // Default to English if not set
const currentPath = document.querySelector("body").getAttribute("data-currentPage");
const languageImg = `<img src="assets/languageSvg.svg" alt="Language Icon" class="languageIcon">`;
let pageKey = "mainPage"; // Default page key for index.html

// Identify the page and set the pageKey based on the filename
if (currentPath === "homeNav") {
    pageKey = "mainPage";
} else if (currentPath === "pollutionNav") {
    pageKey = "sourcesOfPollution";
} else if (currentPath === "improveNav") {
    pageKey = "howToImproveAQ";
} else if (currentPath === "qualityNav") {
    pageKey = "currentAQ";
}

// Toggle language on button click
languageToggleButton.addEventListener("click", function() {
    currentLanguage = currentLanguage === "en" ? "bg" : "en"; // Set currentLanguage to the opposite
    updateToggleButtonText();
    localStorage.setItem("language", currentLanguage); // Save selected language
    loadTranslations(currentLanguage); // Load translations for the new language
});

// Update the language button text based on the current language
function updateToggleButtonText() {
    const nextLanguage = currentLanguage === "en" ? "BG" : "EN";
    languageToggleButton.innerHTML = `${nextLanguage} ${languageImg}`;
}

// Load translations for the specified language
function loadTranslations(language) {
    fetch("../translation/translation.json")
        .then(response => response.json())
        .then(data => {
            // Global translations and for the current page
            const translations = data[language];
            const pageTranslations = translations[pageKey];

            // Change every element text into the new language
            function translationText(translation) {
                for (const [id, text] of Object.entries(translation)) { //Loop through  every element
                    const element = document.getElementById(id); // Find the HTML element with the specified id
                    if (element) {
                        element.childNodes[0].textContent = text; // Set the text content of the element, if it exists
                    }
                }
            }

            // Call the function with the object id
            translationText(translations.global);
            translationText(pageTranslations);

            // Save theme translations in localStorage for theme switching
            localStorage.setItem("themeSwitcherLight", translations.global.themeSwitcherLight);
            localStorage.setItem("themeSwitcherDark", translations.global.themeSwitcherDark);

            // Create new event to alert when language is changed
            document.dispatchEvent(new Event("languageChanged"));
        })
        .catch(error => console.error("Failed to load translations: ", error));
}

// If last saved local storage is "bg" load it's translations
if(currentLanguage === "bg") {
    updateToggleButtonText();
    loadTranslations(currentLanguage);
}