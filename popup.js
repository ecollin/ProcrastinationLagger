/*
 * The following class is used to store the websites the user wishes to delay
 * the loading of when he visits and to store the last time he visited them.
 * Time is tracked so if the user wishes he can prevent the load delay
 * if he already sat through it say 30 seconds ago, or however long he chooses.
 */
class DelayedSite {
  constructor(domain) {
    this.lastVisit = 0; /* Stores the timestamp of last visit in seconds. */
    this.site = domain; /* The name of the site to delay */
  }
  /*
   * Updates the lastVisit property of the object to hold the timestamp 
   * in seconds of the last time the site was visited. 
   */
  function visit() {
    this.lastVisit = Date.now(); 
  }
}


/* 
 * Adds the given host to the list of sites to lag when loading
 * Also adds a button to remove it from the list 
 */
function addSite(domain) {
  let list = document.getElementsByTagName("ul")[0];
  let newLi = document.createElement("li"); /* new list item for added site */
  newLi.innerHTML = domain;
  let rmButton = document.createElement("button"); /* button to remove site */
  const indexOfDomain = list.length - 1;
  rmButton.addEventListener("click", () => {
    newLi.remove(); //remove site from list 
    chrome.storage.local.get({"addedSites":[]}, (result) => {
      if (chrome.runtime.lastError) {
        console.log("Error in chrome.storage.local.get!");
        window.close();
      }
    //result is obj with addedSites field that is the stored val or a default []
    //Next lines remove the site from storage
      let sitesArr = result.addedSites;
      sitesArr.splice(indexOfDomain,1); //removes indexOfDomain from sitesArr
      chrome.storage.local.set({"addedSites": sitesArr}); 
      
      let addedSitesDisplay = document.querySelector("#added-sites");
      if (sitesArr.length == 0) { //don't display list if no elements left
        addedSitesDisplay.style.display = "none"; 
      }

    });    
  });
  rmButton.innerHTML = "X";
  rmButton.class = "rmButton";
  newLi.appendChild(rmButton);
  list.appendChild(newLi);
}

/*
 * If the popup's input form is not empty, adds the hostname it contains
 * to the list of added sites. 
 */
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
  chrome.storage.local.get({"addedSites":[]}, (result) => {
    if (chrome.runtime.lastError) {
      console.log("Error in chrome.storage.local.get!");
      window.close();
    }
    let sitesArr = result.addedSites;
    sitesArr.push(newSite); //add one more site to stored map 
    chrome.storage.local.set({"addedSites": sitesArr}); 
  });
}

/*
 * sets up the event handlers for the slider and the add site button.
 */
function setupHandlers() {
  let slider = document.querySelector("add-input").
  addEventListener("keyup", (event) => {
    if (event.keyCode == 13) { //if user presses enter on input
      addInputToSite(); 
    }
  });
}

/*
 * On load up want to run the following code to set things up visually in popup
 */
chrome.storage.local.get({"addedSites":[], "sliderVal": 5}, (result) => {
  if (chrome.runtime.lastError) {
    console.log("Error in chrome.storage.local.get!");
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


