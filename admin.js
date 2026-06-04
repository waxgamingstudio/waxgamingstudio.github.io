const ADMIN_PASSWORD = "WaxGaming2026";

let gamesData = {
    games:[]
};




document
.getElementById("loginBtn")
.addEventListener("click", login);

function login(){

    const password =
        document.getElementById("passwordInput").value;

    if(password !== ADMIN_PASSWORD){

        document.getElementById("loginError")
        .textContent = "Invalid password";

        return;
    }

    document.getElementById("loginScreen").style.display = "none";

    document.getElementById("adminPanel").style.display = "block";

    loadGames();
}



async function loadGames(){

    const response =
        await fetch("data/games.json");

    gamesData =
        await response.json();

    renderGames();
}





function renderGames(){

    const container =
        document.getElementById("gamesList");

    container.innerHTML = "";

    gamesData.games.forEach((game,index)=>{

        const div =
            document.createElement("div");

        div.className = "admin-game";

        div.innerHTML = `

            <img
                class="admin-preview"
                src="${game.icon || ''}"
            >

            <input
                value="${game.name}"
                onchange="updateField(${index},'name',this.value)"
            >

            <textarea
                onchange="updateField(${index},'description',this.value)"
            >${game.description}</textarea>

            <input
                value="${game.appStoreUrl}"
                onchange="updateField(${index},'appStoreUrl',this.value)"
            >

            <input
                value="${game.playStoreUrl}"
                onchange="updateField(${index},'playStoreUrl',this.value)"
            >

            <input
                type="file"
                onchange="uploadIcon(event,${index})"
            >

            <button
                class="btn btn-primary"
                onclick="deleteGame(${index})"
            >
                Delete
            </button>
        `;

        container.appendChild(div);
    });
}




function updateField(index,key,value){

    gamesData.games[index][key] = value;
}




function deleteGame(index){

    gamesData.games.splice(index,1);

    renderGames();
}



document
.getElementById("addGameBtn")
.addEventListener("click",()=>{

    gamesData.games.push({

        id: Date.now().toString(),

        name:"New Game",

        description:"",

        appStoreUrl:"",

        playStoreUrl:"",

        icon:""
    });

    renderGames();
});




function uploadIcon(event,index){

    const file =
        event.target.files[0];

    if(!file) return;

    const reader =
        new FileReader();

    reader.onload = function(){

        gamesData.games[index].icon =
            reader.result;

        renderGames();
    };

    reader.readAsDataURL(file);
}



document
.getElementById("exportBtn")
.addEventListener("click",exportJson);

function exportJson(){

    const blob =
        new Blob(
            [
                JSON.stringify(
                    gamesData,
                    null,
                    2
                )
            ],
            {
                type:"application/json"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download = "games.json";

    a.click();

    URL.revokeObjectURL(url);
}





