// Show the button when scrolled down 100px
window.onscroll = function() {
  const button = document.getElementById("returnToTop");
  if (document.documentElement.scrollTop > 100 || document.body.scrollTop > 100) {
    button.style.display = "block";
  } else {
    button.style.display = "none";
  }
};

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function addMsgEntry() {
  const entryText = document.getElementById("").value;
  if (entryText.trim() !== "") {
    const listItem = document.createElement("li");
    listItem.textContent = entryText;
    document.getElementById("diaryList").appendChild(listItem);
    document.getElementById("msgEntry").value = "";
  }
}
