/************** Navigation bar **************/
// When device width smaller than 768, menu icon will pop allowing to toggle to show nav links
let menuIcon = document.querySelector("#menu-bar");
let navbar = document.querySelector(".navbar");

menuIcon.onclick = () => {
  menuIcon.classList.toggle("bx-x");
  navbar.classList.toggle("active");
};

// to make navbar sticker when scroll down more than 100 pixels

window.onscroll = () => {
  let header = document.querySelector("header");

  header.classList.toggle("sticky", window.scrollY > 100);

  //   remove toggle icon and navbar when click
  menuIcon.classList.remove("bx-x");
  navbar.classList.remove("active");
};
