const key = "97123e3ae19c7e395aa0b791b80c87f5"
const url = `https://newsapi.org/v2/everything?q=children-safety&apiKey=${key}`

const recievedNews = (newsdata) => {
    const articlesDiv = document.querySelector(".articles")
    newsdata.articles.forEach((article) => {
        if ((article.title.toUpperCase().search("CYCLING") != -1) || (article.title.toUpperCase().search("ACCIDENT") != -1)
            || (article.title.toUpperCase().search("Melbourne") != -1)) {
            //Here we create and add html elements to our html file
            const div = document.createElement("div")

            div.className = "news";const key = "e6ef2cde327f46e3820d0344025b79fc"
const url = `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${key}`

const recievedNews = (newsdata) => {
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
const key = "e6ef2cde327f46e3820d0344025b79fc"
const url = `https://newsapi.org/v2/top-headlines?country=au&category=business&apiKey=${key}`

const recievedNews = (newsdata) => {
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

            div.innerHTML = `
			<h2>${article.title}</h2>
			<img src="${article.urlToImage}" style="max-height: 500px;max-width: 500px"/>
            <p>${article.description}</p>
            <a class="btn-green" href="${article.url}" style="font-size: 18px">Read more &#128214</a></p>`

            articlesDiv.appendChild(div)
        }
    })
}

//Fetch sends a request to the API.
//Promise makes it possible to run this in the background. När vi får APIet då går den vidare och skickar tillbaka JSON.
fetch(url)
    .then(response => response.json())
    .then(recievedNews)
