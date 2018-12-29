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
    chrome.storage.local.get(["addedSites", "timesOfLastDelay"], (result) => {
      if (chrome.runtime.lastError) {
        console.log("Error in chrome.storage.local.get!");
        window.close();
      }
    //Next lines remove the current site from storage. Remove its domain
    //from "addedSites", and its last time visited that caused loading delay
    // from "timesOfLastDelay"
      let sitesArr = result.addedSites;
      let timesOfLastDelay = result.timesOfLastDelay;
      sitesArr.splice(indexOfDomain,1); //removes indexOfDomain from sitesArr
      timesOfLastDelay.splice(indexOfDomain,1); 
      chrome.storage.local.set({"addedSites": sitesArr, 
                               "timesOfLastDelay" : timesOfLastDelay}); 
      
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
 * If the popup's website input form is not empty, adds the domain it contains
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
  chrome.storage.local.get({"addedSites":[], "timesOfLastDelay":[]}, 
                           (result) => {
    if (chrome.runtime.lastError) {
      console.log("Error in chrome.storage.local.get!");
      window.close();
    }
    let sitesArr = result.addedSites;
    let timesOfLastDelay = result.timesOfLastDelay;
    sitesArr.push(newSite);
    timesOfLastDelay.push(0); /* default timestamp of last visit is 0 so that 
    * Date.now() - timestamp is surely > the restTime between 
    * delays on same site. So first site visit ever will cause delay. */
    chrome.storage.local.set({"addedSites": sitesArr, 
                             "timesOfLastDelay":timesOfLastDelay});
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
    } else if (minsInt < 10 && mins.value.length == 1) {
      //currently displays 1 or 5 or 9, want 01, 05, 09.
      mins.value = "0" + mins.value; 
    }
    if (secsInt > 60) {
      secsInt = 60;
      secs.value = "60";
    } else if (secsInt < 10 && secs.value.length == 1) {
      secs.value = "0" + secs.value; 
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
        "sliderVal": 10, "restTime":60}, (result) => {
/* Note that if the default values given above are used, the stored fields
 * will remain undefined in memory (this code doesn't set them) until user
 * manually sets them, so it's impt to give defaults in future when get
 * is called if it's possible the user has not set the values yet. */ 

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
  document.querySelector("#slider").value = result.sliderVal;
  /*Now get the seconds of time to wait before delaying same site a second time
   * stored in result.restTime. This is seconds but should be broken into 
   * minutes and seconds and then placed into the displays for secs and mins of 
   * rest on the popup. 
   */
  let secsRest = result.restTime; //time to wait b4 delaying same site 2nd time
  let mins = Math.floor( (secsRest/60) );
  let secs = secsRest - mins*60;
  let minsField = document.querySelector("#mins-rest");
  let secsField = document.querySelector("#secs-rest");
  minsField.value = mins.toString();
  secsField.value = secs.toString();
  if (mins < 10) {
   //currently displays 1 or 5 or 9, want 01, 05, 09.
    minsField.value = "0" + minsField.value; 
  }
  if (secs < 10) {
    secsField.value = "0" + secsField.value;
  }

  setupHandlers(); //finally setup handlers for input fields, slider, + buttons
});


