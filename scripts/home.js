// To toggle the animation for FAQ
document.querySelectorAll(".faq").forEach((faq) => {
  faq.addEventListener("toggle", function () {
    const answer = this.querySelector(".answer");

    if (this.open) {
      answer.classList.add("open");
    } else {
      answer.classList.remove("open");
    }
  });
});
