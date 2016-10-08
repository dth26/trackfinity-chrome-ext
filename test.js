var track_id = '';

function renderStatus(statusText) {
    document.getElementById('track').textContent = statusText;
}

function renderTrackURL(artist,track_name){
    track_url = 'https://trackfinity.pythonanywhere.com/getTrack?artist=' + artist + '&track_name=' + track_name;
    track_url = encodeURI(track_url);
    
    var track_element = document.getElementById('track');
    track_element.href = track_url;
    track_element.style.pointerEvents = 'visiblePainted';
    track_element.style.cursor = 'pointer';
    track_element.style.color = "#1F57FF";

    renderStatus('Download: ' + track_name);
}

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = String(tab.url);

    var isYoutubeURL = (url.indexOf("https://www.youtube.com/watch?v=") > -1);
    var isSoundCloudURL = (url.indexOf("https://soundcloud.com/") > -1);
   // var isYoutubeURL = url.include("https://www.youtube.com/watch?v=");
    //var isSoundCloudURL = url.include("https://soundcloud.com/");

    
    
    if(!(isYoutubeURL || isSoundCloudURL)){
        renderStatus("Not a valid URL! ");
        return false;
    }


    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');


    callback(url);
  });

}



function getTrack(url){

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        //alert(xhttp.responseText);
        json = JSON.parse(xhttp.responseText);

        var artist = json['artist'];
        var track_name = json['track_name'];
        track_id = json['track_id'];
        renderTrackURL(artist,track_name);
        //document.getElementById("demo").innerHTML = xhttp.responseText;
      }
  };



  var save_track_url = "https://trackfinity.pythonanywhere.com/googleExtDownloadTrack";
  xhttp.open("GET", save_track_url+"?youtubeURL=" + url, true);
  xhttp.setRequestHeader("Content-type",  "application/x-www-form-urlencoded");
 
  xhttp.send();
    //alert(xhttp.status);
   // alert(xhttp.responseText);
  
}



function deleteTrack(){
  var delete_track_url = 'https://trackfinity.pythonanywhere.com/deleteGoogleExtTrack';

  setTimeout(function(){ 
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
          console.log("deleted track: " + track_id);
          window.close();
        }
    };


    xhttp.open("GET", delete_track_url+"?track_id=" + track_id, true);
    xhttp.setRequestHeader("Content-type",  "application/x-www-form-urlencoded");
   
    xhttp.send();

  }, 3000);
}

document.addEventListener('DOMContentLoaded', function(){
  renderStatus("Wait for the magic to happen...");

  // get current tab url and pass it a callback
  getCurrentTabUrl(function(url){

      getTrack(url);
    
  });

  document.getElementById("track").addEventListener('click', deleteTrack);

});





