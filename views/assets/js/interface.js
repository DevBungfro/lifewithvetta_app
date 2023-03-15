const title6 = document.getElementById("title")
const file = document.getElementById("formFile")
const id = document.getElementById("id")
const postid = document.getElementById("postid")
const date = document.getElementById("date")
const previewt = document.getElementById("previewText")
let htmlw242424
let summernotetext
let id2
let title2
let date2
let image2
let previewt2



function EDIT2() {
  $(document).ready(function() {
             $('#summernote').summernote({
               toolbar: [
         ['style', ['style']],
         ['font', ['bold', 'underline', 'clear', "italic"]],
         ['fontname', ['fontname']],
         ['color', ['color']],
         ['para', ['ul', 'ol', 'paragraph']],
         ['fontsize', ['fontsize']],
         ['table', ['table']],
         ['insert', ['link', 'picture', 'video']],
         ['view', ['fullscreen', 'codeview', 'help']],
         ],
           callbacks : {
             onImageUpload: function(image) {
                 const formdata = new FormData()
         formdata.append("image", image[0])
         fetch("https://api.imgur.com/3/image/", {
         method: "post",
         headers: {
           Authorization: "Client-ID f36b17cae15ae13"
         },
         body: formdata
         }).then(data => data.json()).then(data => {
                 var image = $('<img>').attr('src', data.data.link);
            $('#summernote').summernote("insertNode", image[0]);
             })
         },
             onPaste: function (event) {
                       var text = (event.originalEvent || event).clipboardData.getData(
    "text/html"
  );
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  var image = [...doc.querySelectorAll("img")]
               console.log(image)
        image.forEach((img) => {
       fetch("https://api.imgur.com/3/image/", {
         method: "post",
         headers: {
           Authorization: "Client-ID f36b17cae15ae13"
         },
         data: {
           image: img.src.replace(/^data:image\/[a-z]+;base64,/, ""),
         }
         }).then(data => data.json()).then(data => {
                 var image = $('<img>').attr('src', data.data.link);
            $('#summernote').summernote("insertNode", image[0]);
             })
             
           
                  
        })
        }
             }
           
             })
         })
         $('.note-editable').css('font-size','14.5px');
  document.getElementsByTagName("html")[0].innerHTML = htmlw242424;
  $(".summernote").summernote("code", summernotetext);
  summernotetext = null
}

function doHtml(desctext) {
  console.log(desctext)
  function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
      var stringToHTML = function (str) {
	var dom = document.createElement('div');
	dom.innerHTML = str;
	return dom;
};      
    const description = document.getElementById("descontainer")
      const html = decodeHtml(desctext)

   const htmlPlace = stringToHTML(html)
    description.appendChild(htmlPlace)
}

function POSTTRUE() {
  $.ajax({
    type: "POST",
    url: "/interface",
    data: { description: summernotetext, title: title2, image: image2, id: id2, date: date2, previewText: previewt2 },
    success: function(response) {
      window.location.href = "/post/" + response.id
    },
    error: function(errResponse) {
      // alert(errResponse)
      console.log("errResponse", errResponse);
    }
  })
  // window.location.href = "/postingcenter"
}

function POST() {


  const formdata = new FormData()
  formdata.append("image", file.files[0])
  fetch("https://api.imgur.com/3/image/", {
    method: "post",
    headers: {
      Authorization: "Client-ID f36b17cae15ae13"
    },
    body: formdata
  }).then(data => data.json()).then(data => {
    $.ajax({
      type: "POST",
      url: "/previewpost",
      data: { description: $("#summernote").summernote("code"), title: title6.value, image: data.data.link, id: id.value, date: date.value },
      success: function(response) {
        summernotetext = $('#summernote').summernote('code');
        title2 = title6.value
        image2 = data.data.link
        id2 = id.value
        date2 = date.value
        previewt2 = previewt.value
        $('#summernote').summernote('destroy');


        htmlw242424 = document.documentElement.innerHTML;
        document.getElementsByTagName("html")[0].innerHTML = response;
        doHtml(summernotetext)
        //setTimeout(() => {
        //document.open();
        //document.write(response);
        //document.close();
        //}, 1000)

      },
      error: function(errResponse) {
        // alert(errResponse)
        console.log("errResponse", errResponse);
      }
    })
    // window.location.href = "/postingcenter"
  })


}

function EDIT() {


  const formdata = new FormData()
  formdata.append("image", file.files[0])
  fetch("https://api.imgur.com/3/image/", {
    method: "post",
    headers: {
      Authorization: "Client-ID f36b17cae15ae13"
    },
    body: formdata
  }).then(data => data.json()).then(data => {
    $.ajax({
      type: "POST",
      url: "/interface/edit",
      data: { description: $("#summernote").summernote("code"), title: title6.value, image: data.data.link, id: id.value, postid: postid.value },
      success: function(response) {
        // response 
        // console.log(response,"response");
      },
      error: function(errResponse) {
        // alert(errResponse)
        // console.log("errResponse", errResponse);
      }
    })
    window.location.href = "/editcenter"
  })


}

function DELETE() {

  $.ajax({
    type: "POST",
    url: "/interface/edit",
    data: { id: id.value, postid: postid.value },
    success: function(response) {
      // response 
      // console.log(response,"response");
    },
    error: function(errResponse) {
      // alert(errResponse)
      // console.log("errResponse", errResponse);
    }
  })
  window.location.href = "/editcenter"

}