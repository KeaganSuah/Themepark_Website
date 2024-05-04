/************** Navigation bar **************/
// toggle Icon navbar
let menuIcon = document.querySelector("#menu-icon");
let navbar = document.querySelector(".navbar");

menuIcon.onclick = () => {
  menuIcon.classList.toggle("bx-x");
  navbar.classList.toggle("active");
};

// scroll sections

window.onscroll = () => {
  let header = document.querySelector("header");

  header.classList.toggle("sticky", window.scrollY > 100);

  //   remove toggle icon and navbar when click
  menuIcon.classList.remove("bx-x");
  navbar.classList.remove("active");
};
