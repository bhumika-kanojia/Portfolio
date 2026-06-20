// Dark Mode Toggle
let themeToggle = document.querySelector('.theme-toggle');
let themeIcon = document.getElementById('theme-icon');

themeToggle.onclick = () => {
    document.body.classList.toggle('dark-mode');
    
    if(document.body.classList.contains('dark-mode')){
        themeIcon.classList.remove('bx-moon');
        themeIcon.classList.add('bx-sun');
    } else {
        themeIcon.classList.remove('bx-sun');
        themeIcon.classList.add('bx-moon');
    }
};

// Navbar toggler for mobile
let menuToggle = document.querySelector('.menu-toggle');
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuToggle.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

// Scroll sections active link
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if(top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
        };
    });

    // remove toggle icon and navbar when click navbar link (scroll)
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');
};
