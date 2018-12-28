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
    chrome.storage.local.get("addedSites", (result) => {
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
  let inputField = document.querySelector("#site-input");
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
    chrome.storage.local.set({"sliderVal":slider.value});
  });

  document.querySelector("#add-button").addEventListener("click", addInputToSite); 
  document.querySelector("#site-input").addEventListener("keyup", (event) => {
      if (event.keyCode == 13) { //if user presses enter on site input box
        addInputToSite(); 
      }
  });
  let setRest = event => {
    let mins = document.querySelector("#mins-rest");
    let secs = document.querySelector("#secs-rest");
    //note that due to code below, mins and secs can only hold pos numbers or ""
    if (mins.value === "") mins.value = 0; //default to 0.
    if (secs.value === "") secs.value = 0;
    let minsInt = Number(mins.value);
    let secsInt = Number(secs.value); 
    if (minsInt > 60) {
      minsInt = 60; //maximum of 60 mins and seconds
      mins.value = "60";
    }
    if (secsInt > 60) {
      secsInt = 60;
      secs.value = "60";
    }
    
    let secsRest = (minsInt * 60 + secsInt);
    chrome.storage.local.set({"restTime":secsRest});
  };
  document.querySelector("#mins-rest").addEventListener("keypress", event => {
    let code = event.keyCode;

    if (code == 13) { 
      setRest(event);
    } 
    if (!(code >= 48 && code <= 57) || (code >= 96 && code <= 105)) {
      event.preventDefault(); //don't let user enter non-numbers.
    }
  });
  document.querySelector("#secs-rest").addEventListener("keypress", event => {
    let code = event.keyCode;

    if (code == 13) { 
      setRest(event);
    } 
    if (!(code >= 48 && code <= 57) || (code >= 96 && code <= 105)) {
      event.preventDefault(); //don't let user enter non-numbers.
    }
  });
  document.querySelector("#rest-button").addEventListener("click", setRest); 
}


/*
 * On load up want to run the following code to set things up visually in popup
 */
chrome.storage.local.get({"addedSites":[], 
        "sliderVal": 5, "restTime":60}, (result) => {

  if (chrome.runtime.lastError) {
    console.log("Error in chrome.storage.local.get!");
    window.close();
  }

  let sitesArr = result.addedSites; //array of DelayedSite objs
  for (let i = 0; i < sitesArr.length; i++) {
    addSiteVisually(sitesArr[i].site);
  }
  if (sitesArr.length == 0) { //hide added-sites area if no sites added
    document.querySelector("#added-sites").style.display = "none";
  }
  let sliderDisplay = document.querySelector("#slider-val");
  sliderDisplay.innerHTML = result.sliderVal; //get secs of delay from storage
  document.querySelector("#slider").value = result.sliderVal;
  /*Now get the seconds of time to wait before delaying same site a second time
   * stored in result.restTime. This is seconds but should be broken into 
   * minutes and seconds and then placed into the displays for secs and mins of 
   * rest on the popup. 
   */
  let secsRest = result.restTime; //time to wait b4 delaying same site 2nd time
  let mins = Math.floor( (secsRest/60) );
  document.querySelector("#mins-rest").value = mins;
  document.querySelector("#secs-rest").value = secsRest - mins * 60;
 
  setupHandlers(); //finally setup handlers for input fields, slider, + buttons
});


