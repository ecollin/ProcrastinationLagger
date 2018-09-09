//Adds the given host to the list of sites to lag when loading
//with a button to remove it
function addSite(host) {
  let list = document.getElementsByTagName("ul")[0];
  let newLi = document.createElement("li"); //list item of added site
  newLi.innerHTML = host;
  let rmButton = document.createElement("button"); //button to remove site
  const indexOfHost = list.length - 1;
  rmButton.addEventListener("click", () => {
    newLi.remove(); 
    chrome.storage.sync.get({"addedSites":[]}, (result) => { 
      let sitesArr = result.addedSites;
      sitesArr.splice(indexOfHost,1); //removes indexOfHost from sitesArr
      chrome.storage.sync.set({"addedSites": sitesArr}); 
    });    
  });
  rmButton.innerHTML = "X";
  rmButton.class = "rmButton";
  newLi.appendChild(rmButton);
  list.appendChild(newLi);
}
//If the input box is not empty, adds the hostname in it to the list of sites.
function addInputToSite() {
  let inputField = document.querySelector("#add-input");
  let newSite = inputField.value;
  inputField.value = ""; 
  if (!newSite) return;   
  addSite(newSite);
  chrome.storage.sync.get({"addedSites":[]}, (result) => {
    if (chrome.runtime.lastError) {
      console.log("Error in chrome.storage.sync.get!");
      window.close();
    }
    let sitesArr = result.addedSites;
    sitesArr.push(newSite); //add one more site to stored map 
    chrome.storage.sync.set({"addedSites": sitesArr}); 
  });
}

//sets up the event handlers for the slider and the add site button.
function setupHandlers() {
  let slider = document.querySelector("#slider"); 
  slider.addEventListener("input", () => {
    let sliderDisplay = document.querySelector("#slider-val");
    sliderDisplay.innerHTML = slider.value;
    chrome.storage.sync.set({"sliderVal":slider.value});
  });
    
  document.querySelector("button").addEventListener("click", addInputToSite); 
  document.querySelector("#add-input").addEventListener("keyup", (event) => {
    if (event.keyCode == 13) { //if user presses enter on input
      addInputToSite(); 
    }
  });
}

//Here get the slider value. set the display value. 
//In setup handlers, upon changing slider value, save it. 
//Also only use one get below by asking for two different properties
//with  one call which is possible check documentaiton



chrome.storage.sync.get({"addedSites":[], "sliderVal": 5}, (result) => {
//above line gives default values if values not set yet
  if (chrome.runtime.lastError) {
    console.log("Error in chrome.storage.sync.get!");
    window.close();
  }
  let sitesArr = result.addedSites; 
  for (let i = 0; i < sitesArr.length; i++) {
    addSite(sitesArr[i]);
  }
  let sliderDisplay = document.querySelector("#slider-val");
  sliderDisplay.innerHTML = result.sliderVal; //get secs of delay from storage

  setupHandlers();  
});


