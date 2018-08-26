//adds the website in the text field to the list of sites to delay loading of
//empties the text field
function addSite() {
  let inputField = document.querySelector("#add-input");
  if (!inputField.value) return; //do nothing on empty field 
  let list = document.getElementsByTagName("ul")[0];
  let newLi = document.createElement("li"); //list item of added site
  newLi.innerHTML = inputField.value;
  let rmButton = document.createElement("button"); //button to remove site
  rmButton.addEventListener("click", () => {
    newLi.remove(); 
  });
  rmButton.innerHTML = "X";
  rmButton.class = "rmButton";
  newLi.appendChild(rmButton);
  list.appendChild(newLi);

  inputField.value = ""; //clear input field
}

let slider = document.querySelector("#slider"); 
slider.addEventListener("input", () => {
  let sliderDisplay = document.querySelector("#slider-val");
  sliderDisplay.innerHTML = slider.value;
});

document.querySelector("button").addEventListener("click", addSite);
document.querySelector("#add-input").addEventListener("keyup", (event) => {
  if (event.keyCode == 13) { //if user presses enter on input
    addSite();
  }
});


