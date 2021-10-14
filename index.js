//await foo();            // foo is an async function that returns a promise
//console.log("hello");

//is the exact same as

//foo().then(() => {
//  console.log("hello");
//});


//To prevent use of undeclared variables
"use strict";

//Initialize
const lista = document.querySelector("#lista");
const apiKey = "10c55225861732ee88667f5b8b887533";
const cats = document.querySelector("#cats");
const buttons = document.querySelectorAll(".button");
const runPhoto = document.querySelector("#btn");
let catsType = "cat";
let sizeSuffix;
let currIndex = -1;
let pageSize;
let idx;

//Variables to handle photosize
const photoObj = [
  { tag :"s", width:75},
  { tag :"q", width:150 },
  { tag :"t", width:100},
  { tag :"m", width:240},
  { tag :"n", width:320},
  { tag :"w", width:400}
]

//Variables to handle photo info
let arrInfo = [];
class Info {
  constructor(id, title, taken) {
    this.id = id;
    this.title = title;
    this.taken = taken;
  }
};

//Disable the GetCats button
$("#btn").attr("disabled", true);

//Add event handler to each button that represent photo size
//Call getPhotoSize when button clicked
buttons.forEach((button, index) => {
  button.addEventListener("click", (event) => {
    getPhotoSize(event.target.innerText, index);
  });
}); //end foreach buttons


//Set the selected photosize
const getPhotoSize = (size, idx) => {
  $("#btn").removeAttr("disabled");
  sizeSuffix = photoObj[idx].tag; //a single character represent sizeSuffix

  //Handle the backgroundcolor correct
  //Set backgroundcolor and reset the old backgroundColor
  //****************************************************
  if (currIndex !== -1) {
    buttons[currIndex].style.backgroundColor = "#efefef";
  }

  buttons[idx].style.backgroundColor = "#a7a7a7";
  currIndex = idx;      //Keep the index
  lista.innerHTML = ""; //Clear the element in html
}; // end getPhotoSize


//Eventhandler that catch a change for catType
//********************************************
cats.addEventListener("change", (ev) => {
  catsType = ev.target.value;
  lista.innerHTML = "";
});

//Event handler that is called when you click the button GetCats
async function getPhotos() 
{
    //Handle pageSize. Default to 10
    pageSize = $("#pageSize").val();
    if (pageSize === "" || isNaN(pageSize)) 
    {
      pageSize = 10;
    }
 
    // Fetch routine to handle the initial request to flickr API
    //***********************************************************
    const apiUrl = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${apiKey}&text=${catsType}&tag=${catsType}&per_page=${pageSize}&format=json&nojsoncallback=1`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    await walkThroughPhotos(data);

    async function walkThroughPhotos(data)
    {
      data.photos.photo.forEach(async photo => 
      {
          //Fetch routine to get info about a photo such as title and taken date  
          //********************************************************************
          let apiInfo = `https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=${apiKey}&photo_id=${photo.id}&format=json&nojsoncallback=1`;
          let response = await fetch(apiInfo)
          let data = await response.json();

          //Save getInfo within array of objects
          arrInfo.push(new Info(photo.id, data.photo.title._content, data.photo.dates.taken));

          //Fetch routine to get photosize for each photo
          //*********************************************
          let apiGetSize = `https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=${apiKey}&photo_id=${photo.id}&format=json&nojsoncallback=1`;
          response = await fetch(apiGetSize)
          data = await response.json();
        
           //Use only those photos that have the right width
           idx = photoObj.findIndex(item => item.tag === sizeSuffix);
           let widthData =  data.sizes.size[idx].width;
           let widthMall =  photoObj[idx].width;

          if (idx === 0 || idx === 1 ||
             (idx === 3 && widthData === widthMall) ||
             (idx === 2 && widthData === widthMall) ||
             (idx === 4 && widthData === widthMall) ||
             (idx === 5 && widthData === widthMall)) 
          {
              //Fetch routine to get the actual photos
              //Add these photos to the html element
              let apiPhoto = `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_${sizeSuffix}.jpg`;
              response = await fetch(apiPhoto) 

              //Lookup the correct info object for this photo.id
              let obj = arrInfo.find(item => item.id === photo.id);

              //Create li element and set width accordingly to photo size
              const songItem = document.createElement("li");
              songItem.style.width =  photoObj[idx].width + 20 +"px";

              //Get 1024px photo
              let apiPhoto1024 = `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`;
              let max1024px = await fetch(apiPhoto1024) 

              //Add li element to ul element and set cursor to default
              songItem.innerHTML = `<a href="${max1024px.url}" target="_blank"> <img src=${response.url} /> ${obj.title.slice(0, photoObj[idx].width)} <br> ${obj.taken}</a>`;
              lista.appendChild(songItem);
              document.body.style.cursor = 'default';
          }
      });
    }
}

//This is the main engine that start the whole thing
 runPhoto.addEventListener("click", (ev) => 
 {
    document.body.style.cursor = 'wait';
    ev.preventDefault();
    lista.innerHTML = "";
    getPhotos();
 });