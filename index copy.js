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
  { tag :"n", widt:320},
  { tag :"w", width:400}
]

//Variables to handle info about photo
let arrInfo = [];
class Info {
  constructor(id, title, taken) {
    this.id = id;
    this.title = title;
    this.taken = taken;
  }
};

//Disable the get cats button
$("#btn").attr("disabled", true);

//Add event handler to each button that represent photo size
//call getPhotoSize when click button
buttons.forEach((button, index) => {
  button.addEventListener("click", (event) => {
    getPhotoSize(event.target.innerText, index);
  });
}); //end foreach buttons


//Set the selected photosize
const getPhotoSize = (size, idx) => {
  $("#btn").removeAttr("disabled");
  sizeSuffix = photoObj[idx].tag;

  //Handle the backgroundcolor correct
  //set backgroundcolor and reset the old backgroundColor
  //****************************************************
  if (currIndex !== -1) {
    buttons[currIndex].style.backgroundColor = "#efefef";
  }
  buttons[idx].style.backgroundColor = "#a7a7a7";
  currIndex = idx;      //Keep the index
  lista.innerHTML = ""; //Clear the element in html
}; // end getPhotoSize


//Eventhandler that catch a change for cattype
//*****************************************
cats.addEventListener("change", (ev) => {
  catsType = ev.target.value;
  lista.innerHTML = "";
});

//Event handler that is called when you click the button GetCats
runPhoto.addEventListener("click", (ev) => 
{
  document.body.style.cursor = 'wait';

  ev.preventDefault();
  lista.innerHTML = "";

  //Handle pageSize
  pageSize = $("#pageSize").val();
  if (pageSize === "" || isNaN(pageSize)) pageSize = 10;

  // Fetch routine to handle the initial request to flickr API
  //***********************************************************
  const apiUrl = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${apiKey}&text=${catsType}&tag=${catsType}&per_page=${pageSize}&format=json&nojsoncallback=1`;
  fetch(apiUrl)
    .then((response) => 
    {
      return response.json();
    })
    .then((data) => 
    {
      data.photos.photo.forEach((photo) => 
      {
        //Fetch routine to get info about a photo
        //***************************************
        let apiInfo = `https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=${apiKey}&photo_id=${photo.id}&format=json&nojsoncallback=1`;
        fetch(apiInfo)
          .then((response) => 
          {
            return response.json();
          })
          .then((data) => 
          {
            //Save getInfo within array of objects
            let obj = new Info(photo.id, data.photo.title._content.slice(0,10), data.photo.dates.taken);
            arrInfo.push(obj);

            //Fetch routine to get photosize for each photo
            //*********************************************
            let apiGetSize = `https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=${apiKey}&photo_id=${photo.id}&format=json&nojsoncallback=1`;
            fetch(apiGetSize)
              .then((response) => 
              {
                return response.json();
              })
              .then((data) => 
              {
                //Use only those that have the right width
                idx = photoObj.findIndex(item => item.tag === sizeSuffix);
                if  (idx === 0 || idx === 1 ||
                    (idx === 3 && data.sizes.size[idx].width === 240) ||
                    (idx === 2 && data.sizes.size[idx].width === 100) ||
                    (idx === 4 && data.sizes.size[idx].width === 320) ||
                    (idx === 5 && data.sizes.size[idx].width === 400)) 
                {
                  //Fetch routine to get the actual photos
                  //Add these photos to the html element
                  let apiPhoto = `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_${sizeSuffix}.jpg`;
                  fetch(apiPhoto).then((response) => 
                  {
                    //Lookup the correct info object for this photo id
                    let obj = arrInfo.find(item => item.id === photo.id);

                    //Create li element and set width accordingly to photo size
                    const songItem = document.createElement("li");
                    songItem.style.width =  photoObj[idx].width + 20 +"px";

                    //Add li element to ul element and set cursor ro default
                    songItem.innerHTML = `<img src=${response.url} /> ${obj.title.slice(0, photoObj[idx].width)} <br> ${obj.taken}`;
                    lista.appendChild(songItem);
                    document.body.style.cursor = 'default';
                  });
                }
              });
          });
      }); //end forEach
    });
});

 runPhoto.addEventListener("click", (ev) => 
 {
   document.body.style.cursor = 'wait';

   ev.preventDefault();
   lista.innerHTML = "";
    getPhotos();
 });


