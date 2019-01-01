let domain = trimToRoot(window.location.href);
/* now compare current domain above to any user added sites to delay. */
chrome.storage.local.get({"sliderVal":10, "addedSites":[],"timesOfLastDelay":[],
                         "restTime":60}, (result) => {
  if (chrome.runtime.lastError) {
    console.log("Error in chrome.storage.local.get!");
    return; //will reach end of content script after this
  }


  let addedSites = result.addedSites;
  let timesOfLastDelay = result.timesOfLastDelay; //holds timestamps from when
             //corresponding index in addedSites was last delayed while loading.

  for (let i = 0; i < addedSites.length; i++) {
    let addedDomain = trimToRoot(addedSites[i]); 
    /* We don't need to worry about the above being a bogus domain
     * since the following "if" likely will never be true then. */ 
    if (domain === addedDomain) { //check if domain == any added sites
      let now = Date.now();
      if ((((now - timesOfLastDelay[i]) / 1000) <=  result.restTime) &&
             (((now - timesOfLastDelay[i]) / 1000) >= result.sliderVal)) {
        /* If difference between last time site was delayed and current time 
         * in seconds is not at least restTime, and at least result.sliderVal
         * has elapsed (this is the time of delay--so the second condition 
         * ensures user has sat through delay instead of, eg, just refreshing)
         * then don't cause another delay. */
         break;
      }
      timesOfLastDelay[i] = now; //about to visit + delay, set timestamp
      chrome.storage.local.set({"timesOfLastDelay":timesOfLastDelay});
      if (result.sliderVal != 0) delayLoad(result.sliderVal); 
      break;
    }
  }
});

/*
 * Given a URL-like string, trims any protocol, path, and subdomains 
 * until the root domain is reached. URL-like means URL or partly trimmed URL
 * Ex: https://www.blog.example.com/path/name?attr=value#anchor
 * will be trimmed to example.com. www.blog.example.com is URL-like and will
 * be similarly trimmed to example.com (it lacks protocol). 
 * Will not throw error on invalid url but will return bogus string.
 */
function trimToRoot(url) {
  let protocolStart = url.indexOf("://"); 
  if (protocolStart != -1) 
    url = url.substring(protocolStart + 3, url.length);  
  let urlEnd = url.indexOf("/"); //first / will be start of path now; trim it.
  if (urlEnd != -1) {
    url = url.substring(0, urlEnd); 
  }
  /* now just need to trim out any subdomains from the root domain. 
   * Iterate through the url's periods, cutting the text through each one out
   * until one is left: this is root domain we need. str will be cut one
   * time in addition to this so that pos == -1 in next loop*/


  let str = url;
  let pos = str.indexOf(".");
  while (pos != -1) {
    url = str;
    str = str.substring(pos+1, str.length); 
    pos = str.indexOf("."); 
  }
  return url.trim();
}

/*
 * Delays the loadtime of the current site
 */

function delayLoad(delayLength) {
  let div = document.createElement("div"); /* The div to display when delaying
      * document loading. Could also make a whole new document.body but then
      * have to wait for the entire document.body to load to save it in a var.
      * This way only have to wait for the root document.body node to load */

  /* set style properties so that the div will cover the screen*/
  div.style.position = "fixed";
  div.style.padding = "0px";
  div.style.margin = "0px";
  div.style.top = "0px";
  div.style.left = "0px";
  div.style.height = "100%";
  div.style.width = "100%";
  div.style.background = "yellow"; 
  /* I noticed on google-images if an image was open it would appear despite
   * the delay div. Setting z-index below fixes this problem. */
  div.style.zIndex = "1000"; 

  /* set up text */
  let text = document.createElement("div");
  text.innerHTML = "Let this ugly yellow, and my use of the word galvanize," 
    + " galvanize you into getting back to work! You have better things to do!";
  //I definitely need to work on this text and this page on the whole. 
  //Focusing on just getting it working now though.
  text.style.color = "black";
  text.style.textAlign = "center";
  text.style.fontFamily = "Times New Roman";
  text.style.fontSize = "30px";
  text.style.padding = "250px 200px";
  div.appendChild(text);

  let id = setInterval(function() {
    if (!document.body) return; //document.body hasn't been created yet
    clearInterval(id); //no longer need to check if document.body is created
    let original = document.body.style.visibility; //store to set back to later
    document.body.style.visibility = "hidden";  
    div.style.visibility = "visible"; //make this the only visible child
    document.body.appendChild(div);
    setTimeout(function() {
      document.body.removeChild(div);
      document.body.style.visibility = original;  
    }, delayLength * 1000);
  }, 10);
}
