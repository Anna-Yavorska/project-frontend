const BASE_URL = "http://localhost:8080";

let playersPerPage;
let currentPage = 0;

const races = ["HUMAN", "DWARF", "ELF", "GIANT", "ORC", "TROLL", "HOBBIT"];
const professions = ["WARRIOR", "ROGUE", "SORCERER", "CLERIC", "PALADIN", "NAZGUL", "WARLOCK", "DRUID"];
const banned = ["true", "false"];

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

function generateButtons(playersAmount) {
    let buttonsContainer = document.getElementById("page-buttons-container");
    let pagesCount = Math.ceil(playersAmount / playersPerPage);

    buttonsContainer.innerHTML = "";
    for (let i = 1; i <= pagesCount; i++) {
        let button = document.createElement("button");
        button.textContent = i;
        button.classList.add("btn");
        button.classList.add("btn-outline-secondary");
        button.addEventListener("click", () => {
            currentPage = i - 1;
            getPlayers(currentPage, playersPerPage)
                .then(players => updateTable(players))
        });
        buttonsContainer.appendChild(button);
    }
}

function getPlayers(pageNumber = currentPage, pageSize = playersPerPage) {
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

function deletePlayer(id) {
    if (!confirm('Do you really want delete the player?')) {
        return;
    }
    const requestOptions = {
        method: "DELETE",
    };
    const requestUrl = BASE_URL + "/rest/players/" + id;
    fetch(requestUrl, requestOptions)
        .then(response => {
            if (response.ok) {
                alert("Player is deleted");
                console.log(id);
                reloadPlayers();
            } else {
                alert("You can't delete this player");
            }
        })
        .catch(error => console.error(error));
}

function reloadPlayers() {
    getPlayers(currentPage, playersPerPage)
        .then(players => updateTable(players));
}

function editAccountHandler(e) {
    const accountId = e.currentTarget.value;

    const $currentRow = document.querySelector(`tr[data-account-id='${accountId}']`);
    const $currentRemoveImage = $currentRow.querySelector('.delete-cell img');
    const $currentImage = $currentRow.querySelector('button.edit-button img');

    const cells = $currentRow.querySelectorAll("td");

    const $currentName = cells[1];
    const $currentTitle = cells[2];
    const $currentRace = cells[3];
    const $currentProfession = cells[4];
    const $currentBanned = cells[7];

    $currentImage.src = "img/save.png";
    $currentRemoveImage.style.display = "none";

    $currentImage.addEventListener("click", () => {
        const params = {
            accountId: accountId,
            data: {
                name: $currentName.childNodes[0].getAttribute('data-value'),
                title: $currentTitle.childNodes[0].getAttribute('data-value'),
                race: $currentRace.querySelector(".form-select").value,
                profession: $currentProfession.querySelector(".form-select").value,
                banned: $currentBanned.querySelector(".form-select").value,
            }
        }

        updateAccount(params);
    })

    $currentName.childNodes[0].replaceWith(createInput($currentName.innerHTML))
    $currentTitle.childNodes[0].replaceWith(createInput($currentTitle.innerHTML))
    $currentRace.childNodes[0].replaceWith(createSelect(races, $currentRace.getAttribute("data-value")))
    $currentProfession.childNodes[0].replaceWith(createSelect(professions, $currentProfession.getAttribute("data-value")))
    $currentBanned.childNodes[0].replaceWith(createSelect(banned, $currentBanned.getAttribute("data-value")))

    function createSelect(options, selectedValue) {
        let select = document.createElement("select");
        select.classList.add("form-select");
        options.forEach(option => {
            let opt = document.createElement("option");
            opt.value = option;
            opt.textContent = option;
            if (option === selectedValue) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });
        return select;
    }
}

function createInput(value) {
    const $htmlInputElement = document.createElement('input');

    $htmlInputElement.setAttribute('type', 'text');
    $htmlInputElement.setAttribute('value', value);
    $htmlInputElement.setAttribute('data-value', value);

    $htmlInputElement.addEventListener('input', e => {
        $htmlInputElement.setAttribute('data-value', `${e.currentTarget.value}`)
    })
    return $htmlInputElement;
}

function updateAccount({accountId, data}) {
    const requestUrl = BASE_URL + "/rest/players/" + accountId;

    fetch(requestUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Data-Type": "json",
        },
        body: JSON.stringify(data),
    })
        .then(response => {

            if (response.ok) {
                reloadPlayers();
            } else {
                alert("Failed to update player. Please check the data.");
            }
        })
        .catch(error => console.error("Error updating player:", error));
}

function updateTable(json) {
    let tableBody = document.getElementById("playersTableBody");
    tableBody.innerHTML = "";

    json.forEach((player) => {
        let row = document.createElement("tr");
        row.setAttribute("data-account-id", player.id);

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
        nameCell.classList.add("name-cell");
        nameCell.setAttribute("data-value", player.name);

        title.textContent = player.title;
        title.classList.add("title-cell");
        title.setAttribute("data-value", player.title);

        race.textContent = player.race;
        race.classList.add("race-cell");
        race.setAttribute("data-value", player.race);

        profession.textContent = player.profession;
        profession.classList.add("profession-cell");
        profession.setAttribute("data-value", player.profession);

        level.textContent = player.level;

        let date = new Date(player.birthday);
        birthday.textContent = date.toLocaleDateString("uk-UA");

        banned.textContent = player.banned;
        banned.classList.add("banned-cell");
        banned.setAttribute("data-value", player.banned);

        let editBtn = document.createElement("button");
        editBtn.classList.add("btn", "edit-button");
        let editImg = document.createElement("img");
        editImg.src = "img/edit.png";
        editImg.alt = "Edit";
        editImg.style.cursor = "pointer";
        editBtn.appendChild(editImg);
        editBtn.value = player.id;
        editBtn.addEventListener("click", editAccountHandler);
        edit.classList.add("text-center", "edit-cell");
        edit.appendChild(editBtn);

        let deleteImg = document.createElement("img");
        deleteImg.src = "img/delete.png";
        deleteImg.alt = "Delete";
        deleteImg.style.cursor = "pointer";
        deleteImg.addEventListener("click", () => deletePlayer(player.id));
        deleteCell.classList.add("text-center", "delete-cell");
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

document.addEventListener('DOMContentLoaded', function () {
    const raceSelect = document.getElementById('race');
    const professionSelect = document.getElementById('profession');
    const form = document.getElementById('createAccountForm');


    function populateSelect(dataArray, selectElement) {
        selectElement.innerHTML = dataArray.map(item => `<option value="${item}">${item}</option>`).join('');
    }

    populateSelect(races, raceSelect);
    populateSelect(professions, professionSelect);


    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const accountData = {
            name: document.getElementById('name').value,
            title: document.getElementById('title').value,
            race: raceSelect.value,
            profession: professionSelect.value,
            level: Number(document.getElementById('level').value),
            birthday: document.getElementById('birthday').value,
            banned: document.getElementById('banned').checked
        };
        accountData.birthday = new Date(accountData.birthday).getTime();

        const requestUrl = BASE_URL + "/rest/players";

        fetch(requestUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Data-Type": "json",
            },
            body: JSON.stringify(accountData),
        })
            .then(response => {

                if (response.ok) {
                    form.reset();
                    reloadPlayers();
                } else {
                    alert("Failed to update player. Please check the data.");
                }
            })
            .catch(error => console.error("Error updating player:", error));
    });
});