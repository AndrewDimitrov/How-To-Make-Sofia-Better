document.addEventListener("DOMContentLoaded", function() {
    // Declare Variables
    const menu = document.getElementById("menu");
    const overlay = document.getElementById("overlay");
    const links = document.querySelectorAll(".navContentText");
    const underline = document.querySelector(".underline");
    let activeLink;

    // Navigation menu "open" for Mobile
    document.getElementById("menuIcon").addEventListener("click", showMenu);
    function showMenu() {
        menu.classList.add("open");
        overlay.classList.remove("hidden");
        document.querySelector("body").classList.add("bodyNoScroll");
    }

    // Navigation menu "close" for Mobile
    overlay.addEventListener("click", popUpFunctionality);
    document.getElementById("close").addEventListener("click", popUpFunctionality);
    function popUpFunctionality() {
        menu.classList.remove("open");
        overlay.classList.add("hidden");
        document.querySelector("body").classList.remove("bodyNoScroll");
    }

    // Onscroll check if the position of the view is over 10
    window.addEventListener("scroll", scrollFunction)
    function scrollFunction() {
        if (document.documentElement.scrollTop > 10) {
            document.getElementById("nav").classList.add("navScrolled"); // Make Navigation smaller with animation
        } else {
          document.getElementById("nav").classList.remove("navScrolled"); // Make Navigation bigger with animation
        }
    }

    // Function to move underline under the target element
    function moveUnderline(element) {
      underline.style.width = `${element.offsetWidth}px`;
      underline.style.left = `${element.offsetLeft}px`;
    }

    // Set underline under the current page on load
    const currentPath = document.querySelector("body").getAttribute("data-currentPage");
    links.forEach(link => {
        if (link.id.includes(currentPath)) {
            activeLink = link;
            link.classList.add("active"); // Optional to highlight active link
        }

        // Hover effect to animate underline between links
        link.addEventListener("mouseenter", () => moveUnderline(link));
        link.addEventListener("mouseleave", () => activeLink && moveUnderline(activeLink));
    });

    // Initialize underline position if active link is found
    if (activeLink) moveUnderline(activeLink);
    
    // Listen for language change
    document.addEventListener("languageChanged", () => moveUnderline(activeLink));

    // Onscroll check if the position of the view is over 20
    window.addEventListener("scroll", backToTopVisibility);
    function backToTopVisibility() {
        const toTopButton = document.getElementById("toTop");
        if (document.documentElement.scrollTop > 20) {
            toTopButton.classList.add("visible"); // Show "toTop" with animation
        } else {
            toTopButton.classList.remove("visible"); // Hide "toTop" with animation
        }
    }

    // Go back to top smoothly by clicking "toTop"
    document.getElementById("toTop").addEventListener("click", backToTop);
    function backToTop() {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        })
    }

    // Offset scrolling when link is clicked in other page
    if (window.location.href.indexOf("#") > -1) { // Check if the page contains "#"
        window.addEventListener("load", function() {
            const target = document.querySelector(window.location.hash); // Select the target element based on the current hash in the URL
            if (target) {
                const offset = 95;
                const elementPosition = target.getBoundingClientRect().top; // Get the position of the target element relative to the viewport
                const offsetPosition = elementPosition - offset; // New position to scroll to

                // Scroll smoothly to the offsetPosition
                window.scrollBy({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    }
});