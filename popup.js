//Adds the given host to the list of sites to lag when loading
//with a button to remove it
function addSite(host) {
  let list = document.getElementsByTagName("ul")[0];
  let newLi = document.createElement("li"); //list item of added site
  newLi.innerHTML = host;
  let rmButton = document.createElement("button"); //button to remove site
  rmButton.addEventListener("click", () => {
    newLi.remove(); 
  });
  rmButton.innerHTML = "X";
  rmButton.class = "rmButton";
  newLi.appendChild(rmButton);
  list.appendChild(newLi);
}

//If the input box is not empty, adds the hostname in it to the list of sites.
function addInputToSite() {
  let inputField = document.querySelector("#add-input");
  if (!inputField.value) return; //do nothing on empty field if e is true 
  addSite(inputField.value);

  inputField.value = ""; //clear input field
}
chrome.storage.local.get(["addedSites"], result => {
  
});


let slider = document.querySelector("#slider"); 
slider.addEventListener("input", () => {
  let sliderDisplay = document.querySelector("#slider-val");
  sliderDisplay.innerHTML = slider.value;
});

document.querySelector("button").addEventListener("click", addInputToSite); 
document.querySelector("#add-input").addEventListener("keyup", (event) => {
  if (event.keyCode == 13) { //if user presses enter on input
    addInputToSite(); 
  }
});


