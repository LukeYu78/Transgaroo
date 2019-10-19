var key = "97123e3ae19c7e395aa0b791b80c87f5"
var url = "https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${key}"

var recievedNews = (newsdata) => {
    const articlesDiv = document.querySelector(".articles")
    newsdata.articles.forEach((article) => {
			
			//Here we create and add html elements to our html file
      const div = document.createElement("div")
      div.className = "news"
      div.innerHTML = `
			<h2>${article.title}</h2>
			<img src="${article.urlToImage}"/>`
      articlesDiv.appendChild(div)
			
    })
}

//Fetch sends a request to the API.
//Promise makes it possible to run this in the background. När vi får APIet då går den vidare och skickar tillbaka JSON.
fetch(url)
  .then(response => response.json())
  .then(recievedNews)
