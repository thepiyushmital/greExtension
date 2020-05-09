// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var options = {

    type: "basic",
    title: "Page visited",
    message: "Question Attempted",
    iconUrl: "images/get_started16.png"
     
  
  
  };
  (function() {
    const tabStorage = {};
    const networkFilters = {
        urls: [
            "*://gre.magoosh.com/practices/*"
        ]
    };
  
    chrome.webRequest.onBeforeRequest.addListener((details) => {
        const { tabId, requestId } = details;
        if (!tabStorage.hasOwnProperty(tabId)) {
            return;
        }
  
        tabStorage[tabId].requests[requestId] = {
            requestId: requestId,
            url: details.url,
            startTime: details.timeStamp,
            status: 'pending'
        };
        console.log(details);
        console.log(tabStorage[tabId].requests[requestId]);
    }, networkFilters,  ["blocking", "requestBody"]);
  
    chrome.webRequest.onCompleted.addListener((details) => {
        const { tabId, requestId } = details;
        if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
            return;
        }
  
        const request = tabStorage[tabId].requests[requestId];
  
        /*
        Rahul's code
        */
  
       const id = details.url.split("q/")[1];
       console.log(id);
       console.log(details);
       let method = details.method;
       if(method == "GET"){
        chrome.storage.sync.get('visitedQuestions', function(result) {
          console.log(result);
          if(result.visitedQuestions == null){
  
            chrome.storage.sync.set({'visitedQuestions': [id]}, function() {
              console.log('Value is set to ' + id);
            });
            
          }
          else{
            if(result.visitedQuestions.includes(id)){
  
              console.log('Value exists');
  
              chrome.notifications.create(options,function() {
                console.log("Pop-up");
              })
            }
            else{
            result.visitedQuestions.push(id);
  
            chrome.storage.sync.set({'visitedQuestions': [...result.visitedQuestions]}, function() {
              console.log('Value is' + id);
            });
          }
          }
          
        });
      }
        
        Object.assign(request, {
            endTime: details.timeStamp,
            requestDuration: details.timeStamp - request.startTime,
            status: 'complete'
        });
  
      
        console.log(tabStorage[tabId].requests[details.requestId]);
    }, networkFilters);
  
    chrome.webRequest.onErrorOccurred.addListener((details)=> {
        const { tabId, requestId } = details;
        if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
            return;
        }
  
        const request = tabStorage[tabId].requests[requestId];
        Object.assign(request, {
            endTime: details.timeStamp,           
            status: 'error',
        });
        console.log(tabStorage[tabId].requests[requestId]);
    }, networkFilters);
  
    chrome.tabs.onActivated.addListener((tab) => {
        const tabId = tab ? tab.tabId : chrome.tabs.TAB_ID_NONE;
        if (!tabStorage.hasOwnProperty(tabId)) {
            tabStorage[tabId] = {
                id: tabId,
                requests: {},
                registerTime: new Date().getTime()
            };
        }
    });
    chrome.tabs.onRemoved.addListener((tab) => {
        const tabId = tab.tabId;
        if (!tabStorage.hasOwnProperty(tabId)) {
            return;
        }
        tabStorage[tabId] = null;
    });
  }());
  