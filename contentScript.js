let domain = trimToRoot(window.location.href);
/* now compare current domain above to any used added sites to delay. */
alert('domain: ' + domain);
chrome.storage.local.get({"addedSites":[]}, (result) => {
  let addedSites = result.addedSites;
  for (let i = 0; i < addedSites.length; i++) {
     alert("addedSites[i]: " + addedSites[i]);
    let addedDomain = trimToRoot(addedSites[i]);
    if (domain === addedDomain) { //check if domain == any added sites
      delayLoad(); 
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
  return url;
}

/*
 * Delays the loadtime of the current site
 */

function delayLoad() {
alert("ya boi a god");
}

