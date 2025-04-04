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
  const entryText = document.getElementById("msgEntry").value;
  if (entryText.trim() !== "") {
    // Add to list
    const listItem = document.createElement("li");
    listItem.textContent = entryText;
    document.getElementById("msgEntryList").appendChild(listItem);
    
    // Create floating memo
    const memo = document.createElement("div");
    memo.classList.add("floating-note");
    memo.textContent = entryText;
    
    document.getElementById("floatingNotesContainer").appendChild(memo);
    
    // Remove memo after a few seconds
    setTimeout(() => {
      memo.remove();
    }, 7000);
    
    document.getElementById("msgEntry").value = "";
  }
}
