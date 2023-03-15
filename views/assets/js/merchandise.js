let cards = [...document.querySelectorAll(".card")]

cards.forEach(card => {
  card.onclick = function(event) {
    let name = event.target.getElementsByClassName("card-title")[0]
    
    window.location.href = `/shirt/${name.textContent.toLowerCase().replaceAll(" ", "-")}`
  }
})