// Show the "return to top" button after scrolling down
window.onscroll = function () {
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

// Add message to list and floating note
function addMsgEntry() {
  const entryText = document.getElementById("msgEntry").value;
  if (entryText.trim() !== "") {
    const listItem = document.createElement("li");
    listItem.textContent = entryText;
    document.getElementById("msgEntryList").appendChild(listItem);

    const memo = document.createElement("div");
    memo.classList.add("floating-note");
    memo.textContent = entryText;
    document.getElementById("floatingNotesContainer").appendChild(memo);

    setTimeout(() => {
      memo.remove();
    }, 7000);

    document.getElementById("msgEntry").value = "";
  }
}

// Filter and search logic
const plantFilter = document.getElementById("plantFilter");
const plantSearch = document.getElementById("plantSearch");
const allPlants = document.querySelectorAll(".project");

function updateVisibility() {
  const filterValue = plantFilter ? plantFilter.value.toLowerCase() : "all";
  const searchValue = plantSearch ? plantSearch.value.toLowerCase() : "";

  let anyVisible = false;

  allPlants.forEach((plant) => {
    const plantText = plant.textContent.toLowerCase();
    const matchesSearch = plantText.includes(searchValue);
    const matchesFilter =
      filterValue === "all" || plantText.includes(filterValue);

    const shouldShow = matchesSearch && matchesFilter;
    plant.style.display = shouldShow ? "block" : "none";

    if (shouldShow) {
      anyVisible = true;
    }
  });

  // Scroll to plant section if results are visible
  const section = document.getElementById("plantSection");
  if (anyVisible && section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

// Attach listeners
if (plantFilter) plantFilter.addEventListener("change", updateVisibility);
if (plantSearch) plantSearch.addEventListener("input", updateVisibility);
