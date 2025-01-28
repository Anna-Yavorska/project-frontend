const BASE_URL = "http://localhost:8080";

let playersPerPage;

window.addEventListener("DOMContentLoaded", function () {
    initValues();
    getPlayersAmount().then(response => generateButtons(response));
    getPlayers(0, playersPerPage).then(players => updateTable(players));

    document.getElementById("players-per-page-select").addEventListener("change", (event) => {
        playersPerPage = event.target.value;
        getPlayers(0, playersPerPage).then(players => updateTable(players));
        getPlayersAmount().then(response => generateButtons(response));
    })
})

function initValues() {
    playersPerPage = document.getElementById("players-per-page-select").value;
}

function generateButtons(playersAmount){
    let buttonsContainer = document.getElementById("page-buttons-container");
    let pagesCount = Math.ceil(playersAmount/playersPerPage);

    buttonsContainer.innerHTML = "";
    for (let i = 1; i<=pagesCount; i++) {
        let button = document.createElement("button");
        button.textContent = i;
        button.classList.add("btn");
        button.classList.add("btn-outline-secondary");
        button.addEventListener("click", ()=>getPlayers(i - 1, playersPerPage).then(players => updateTable(players)));
        buttonsContainer.appendChild(button);
    }
}

function getPlayers(pageNumber = 0, pageSize = playersPerPage) {
    const requestOptions = {
        method: "GET",
    };

    const params = new URLSearchParams({
        pageNumber: pageNumber,
        pageSize: pageSize,
    });

    const requestUrl = BASE_URL + "/rest/players?" + params;

    return fetch(requestUrl, requestOptions)
        .then((response) => response.json());
}

function getPlayersAmount() {
    const requestOptions = {
        method: "GET",
    };

    const requestUrl = BASE_URL + "/rest/players/count";

    return fetch(requestUrl, requestOptions)
        .then((response) => response.text());
}

function updateTable(json) {
    let tableBody = document.getElementById("playersTableBody");
    tableBody.innerHTML = "";

    json.forEach((player) => {
        let row = document.createElement("tr");
        let idCell = document.createElement("td");
        let nameCell = document.createElement("td");
        let title = document.createElement("td");
        let race = document.createElement("td");
        let profession = document.createElement("td");
        let level = document.createElement("td");
        let birthday = document.createElement("td");
        let banned = document.createElement("td");
        let edit = document.createElement("td");
        let deleteCell = document.createElement("td");

        idCell.textContent = player.id;
        nameCell.textContent = player.name;
        title.textContent = player.title;
        race.textContent = player.race;
        profession.textContent = player.profession;
        level.textContent = player.level;
        let date = new Date(player.birthday);
        birthday.textContent = date.toLocaleDateString("uk-UA");
        banned.textContent = player.banned;

        let editImg = document.createElement("img");
        editImg.src = "img/edit.png";
        editImg.alt = "Edit";
        editImg.style.width = "35px";
        editImg.style.cursor="pointer";
        edit.classList.add("text-center");
        edit.appendChild(editImg);

        let deleteImg = document.createElement("img");
        deleteImg.src = "img/delete.png";
        deleteImg.alt = "Delete";
        deleteImg.style.width = "35px";
        deleteImg.style.cursor="pointer";
        deleteCell.classList.add("text-center");
        deleteCell.appendChild(deleteImg);


        row.appendChild(idCell);
        row.appendChild(nameCell);
        row.appendChild(title);
        row.appendChild(race);
        row.appendChild(profession);
        row.appendChild(level);
        row.appendChild(birthday);
        row.appendChild(banned);
        row.appendChild(edit);
        row.appendChild(deleteCell);

        tableBody.appendChild(row);
    })
}