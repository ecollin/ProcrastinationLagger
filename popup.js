/*
 * The following class is used to store the websites the user wishes to delay
 * the loading of when he visits and to store the last time he visited them.
 * Time is tracked so if the user wishes he can prevent the load delay
 * if he already sat through it say 30 seconds ago, or however long he chooses.
 */
class DelayedSite {
  lastVisit;
  site;
  constructor(domain) {
    this.lastVisit = 0; /* Stores the timestamp of last visit in seconds. */
    this.site = domain; /* The name of the site to delay */
  }
  /*
   * Updates the lastVisit property of the object to hold the timestamp 
   * in seconds of the last time the site was visited. 
   */
  visit() {
    this.lastVisit = Date.now(); 
  }
}

/* 
 * Adds the given domain to the displayed list of sites to lag when loading
 * The site should already be in the stored array of sites to lag.
 * Also adds a button to remove it from the list 
 */
function addSiteVisually(domain) {
  let list = document.getElementsByTagName("ul")[0];
  let newLi = document.createElement("li"); /* new list item for added site */
  newLi.innerHTML = domain;
  let rmButton = document.createElement("button"); /* button to remove site */
  const indexOfDomain = list.length - 1;
  rmButton.addEventListener("click", () => {
    newLi.remove(); //remove site from list 
    chrome.storage.local.get({"addedSites"}, (result) => {
      if (chrome.runtime.lastError) {
        console.log("Error in chrome.storage.local.get!");
        window.close();
      }
    //result is obj with an addedSites field that is the stored val, which is 
    //an array of DelayedSite objects. Contains at least the obj being removed. 
    //Next lines remove the current site from storage
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
 * If the popup's input form is not empty, adds the domain it contains
 * to the stored array of added sites and the visual list of added sites 
 */
function addInputToSite() {
  let inputField = document.querySelector("#add-input");
  let newSite = inputField.value;
  inputField.value = ""; 
  if (!newSite) return;   
  let addedSitesDisplay = document.querySelector("#added-sites");
  if (addedSitesDisplay.style.display == "none") {
    addedSitesDisplay.style.display = "block";
  }

  addSiteVisually(newSite);
  chrome.storage.local.get({"addedSites":[]}, (result) => {
    if (chrome.runtime.lastError) {
      console.log("Error in chrome.storage.local.get!");
      window.close();
    }
    let sitesArr = result.addedSites;
    let newSiteObj = new DelayedSite(newSite);
    sitesArr.push(newSiteObj); //add one more site to stored map 
    chrome.storage.local.set({"addedSites": sitesArr}); 
  });
}

/*
 * Sets up the handlers for the slider so that its value is displayed 
 * and for pressing enter so that doing so will submit the input field
 * as an added site.
 */
function setupHandlers() {
  let slider = document.querySelector("#slider"); 
  slider.addEventListener("input", () => {
    let sliderDisplay = document.querySelector("#slider-val");
    sliderDisplay.innerHTML = slider.value;
    chrome.storage.sync.set({"sliderVal":slider.value});
  });

  document.querySelector("button").addEventListener("click", addInputToSite); 
  document.querySelector("#add-input").addEventListener("keyup", (event) => {
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
    addSiteVisually(sitesArr[i]);
  }
  if (sitesArr.length == 0) { //hide added-sites area if no sites added
    document.querySelector("#added-sites").style.display = "none";
  }
  let sliderDisplay = document.querySelector("#slider-val");
  sliderDisplay.innerHTML = result.sliderVal; //get secs of delay from storage
  //now make it so if user presses enter the input box is submitted
  setupHandlers();
});


