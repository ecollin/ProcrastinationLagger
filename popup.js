//Adds the given host to the list of sites to lag when loading
//Also adds a button to remove it from the list 
function addSite(host) {
  let list = document.getElementsByTagName("ul")[0];
  let newLi = document.createElement("li"); //list item of added site
  newLi.innerHTML = host;
  let rmButton = document.createElement("button"); //button to remove site
  const indexOfHost = list.length - 1;
  rmButton.addEventListener("click", () => {
    newLi.remove(); //remove site from list 
    chrome.storage.sync.get({"addedSites":[]}, (result) => {
    //result is obj with addedSites field that is stored val or a default []
    //remove site from storage
      let sitesArr = result.addedSites;
      sitesArr.splice(indexOfHost,1); //removes indexOfHost from sitesArr
      chrome.storage.sync.set({"addedSites": sitesArr}); 
      
      let addedSitesDisplay = document.querySelector("#added-sites");
      if (sitesArr.length == 0) { //if only elt was removed, don't display list
        addedSitesDisplay.style.display = "none"; 
      }

    });    
  });
  rmButton.innerHTML = "X";
  rmButton.class = "rmButton";
  newLi.appendChild(rmButton);
  list.appendChild(newLi);
}
//If the input form is not empty, adds the hostname it contains
//to the list of added sites. 
function addInputToSite() {
  let addedSitesDisplay = document.querySelector("#added-sites");
  if (addedSitesDisplay.style.display == "none") {
    addedSitesDisplay.style.display = "block";
  }
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

//on load up want to run the following code to set things up
chrome.storage.sync.get({"addedSites":[], "sliderVal": 5}, (result) => {
  if (chrome.runtime.lastError) {
    console.log("Error in chrome.storage.sync.get!");
    window.close();
  }
  let sitesArr = result.addedSites; 
  for (let i = 0; i < sitesArr.length; i++) {
    addSite(sitesArr[i]);
  }
  if (sitesArr.length == 0) { //hide added-sites area if no sites added
    document.querySelector("#added-sites").style.display = "none";
  }
  let sliderDisplay = document.querySelector("#slider-val");
  sliderDisplay.innerHTML = result.sliderVal; //get secs of delay from storage

  setupHandlers();  
});


