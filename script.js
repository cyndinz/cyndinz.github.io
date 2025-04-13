// Show the button when scrolled down 100px
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

// Filter and search
const plantFilter = document.getElementById('plantFilter');
const plantSearch = document.getElementById('plantSearch');
const allPlants = document.querySelectorAll('.plant');

function updateVisibility() {
  const filterValue = plantFilter ? plantFilter.value : 'all';
  const searchValue = plantSearch ? plantSearch.value.toLowerCase() : '';

  let anyVisible = false;

  allPlants.forEach(plant => {
    const matchesFilter = filterValue === 'all' || plant.classList.contains(filterValue);
    const textContent = plant.textContent.toLowerCase();
    const matchesSearch = textContent.includes(searchValue);

    const shouldShow = matchesFilter && matchesSearch;
    plant.style.display = shouldShow ? 'flex' : 'none';

    if (shouldShow) {
      anyVisible = true;
    }
  });

  // Scroll to plant section after filtering/searching
  const section = document.getElementById("plantSection");
  if (section && anyVisible) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

// Attach listeners
if (plantFilter) {
  plantFilter.addEventListener('change', updateVisibility);
}

if (plantSearch) {
  plantSearch.addEventListener('input', updateVisibility);
}
