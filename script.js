window.addEventListener("load", () => {
    /**
     * ELEMENT VARIABLES
     */

    //Modals
    const afterGameModal = new bootstrap.Modal(document.getElementById("afterGame")); //Modal to interact with the website after finishing the game
    const howToModalB = new bootstrap.Modal(document.getElementById("howTo")); //this will be used for showing how the game works
    const howToModal = document.getElementById("howTo");


    //Other  elements    

    const view = document.getElementById("view"); //Main tag that will have all the magic :)
    const initialForm = document.forms.initialForm; //Accesing the form tag
    const firstDifficultyInput = initialForm[0]; //Accesing the select difficulty tag
    const descriptions = document.querySelectorAll(".description");
    const extraInfoContainer = document.createElement("section"); //Creating a section that will contain the extra info shown when playing
    extraInfoContainer.classList.add("extraInfo"); //Adding the proper class so it will have proper styles
    const textAfterGame = document.getElementById("textAfterGame"); //Text that will show alert if the player win or lose
    //Elements on the Cronometer section on the game
    let cronometerContainer = document.createElement("div");
    let cronometer = document.createElement("p");



    /**
     * VARIABLES FOR THE GAME
     */
    const figures = ["fa-linux", "fa-ubuntu", "fa-github-alt", "fa-python", "fa-apple", "fa-centos", "fa-windows", "fa-gitlab", "fa-codepen", "fa-react", "fa-java", "fa-js-square", "fa-swift", "fa-node-js", "fa-bootstrap", "fa-fedora", "fa-android", "fa-rust"];

    //VARIABLES THAT WILL BE CHANGED FOR DIFFICULTY ADJUSMENTS
    let boxesNumber; //Number of tiles on the memory Game Layout
    let time;
    //Arrays for saving the icons on the game
    let tilesClass; //Class that will be used on the memory game layout to know how many boxes it will have and how are they going to be distributed, the classes will be on the CSS File

    let guessedIcons = [];//Within the game

    let win = false;
    let pause = false;
    let previousTile; //Previous tile selected

    let username;
    //Stats of wins and losses
    let wins = 0;
    let losses = 0;

    let counting;//variable that will save an interval used for the timing on the game
    let minutes;
    let seconds;


    /**
     * EVENT LISTENERS
     * 
     */
    document.getElementById("playAgain").onclick = function gameAgain(e) { //this function will be used to re play after the first game

        //removing the first game space
        let memoryGame = document.getElementById("memoryGame");
        let cronometerContainer = document.getElementById("cronometer");
        let extraInfo = document.getElementById("extraInfo");
        memoryGame.remove();
        cronometerContainer.remove();
        extraInfo.remove();

        gettingReady(document.getElementById("afterGameSubmit").value);

    };

    //This eventListener will be used for playing for the first time after submiting the initial form
    initialForm.addEventListener("submit", (e) => {

        username = document.getElementById("username").value;

        //Styles for hiding tags
        descriptions[0].style.display = "none";
        descriptions[1].classList.replace("d-flex", "d-none");
        initialForm.style.display = "none";

        gettingReady(firstDifficultyInput.value); //then inside it executes the game function

        e.preventDefault();//This line is used for avoiding errors on the eventlistener

    });

    //Continue timing the game after clicking close on the how to play modal
    howToModal.addEventListener("hidden.bs.modal", () => {
        pause = false;
        counting = setInterval(timing, 1000);
    })



    /**
     * FUNCTIONS
     * 
     */

    /**
     * BEFORE GAME FUNCTIONS
     * 
     */

    /**
     * Changing important variables to set up the game based on the difficulty
     * 
     */


    /**
     * Little text display so the user can prepare for the game.
     * 
     */
    let savedDifficulty;//difficulty saved after playing the game one time

    function gettingReady(difficulty) {
        //Creating the element and assigning classes for proper styling
        let bigText = document.createElement("p");
        view.classList.add("gettingReadyText");
        view.append(bigText);//Adding the element to the page

        //Asigning difficult adjustments
        if (difficulty == "") {
            difficulty = savedDifficulty;
        }
        let difficultySettings = {
            //INDEX 0: Number of boxes
            //INDEX 1: second
            //INDEX 2: Tile Class
            "easy": [16, 60, "easyTiles"],
            "medium": [24, 75, "mediumTiles"],
            "hard": [36, 90, "hardTiles"]
        }

        boxesNumber = difficultySettings[difficulty][0];
        time = difficultySettings[difficulty][1];
        tilesClass = difficultySettings[difficulty][2];
        savedDifficulty = difficulty;




        let secondsPreGame = 3;

        let preGame = setInterval(() => {

            bigText.innerText = secondsPreGame > 0
                ? `The game will start on ${secondsPreGame}`
                : 'GO!';

            if (secondsPreGame == -1) {
                view.classList.remove("gettingReadyText");
                bigText.remove();
                clearInterval(preGame);

                game(e); // all the game is here
            }
            secondsPreGame -= 1;
        }, 1000);
    }

    /**
     * CREATES THE TILES THAT WILL BE USED IN THE GAME
     */
    function buildTiles() {

        //Creating the memory game's container
        let memoryGameContainer = document.createElement("section");
        view.appendChild(memoryGameContainer)
        memoryGameContainer.classList.add("memoryGameContainer");   

        //Creating and placing the tag into the HTML document
        let memoryGame = document.createElement("div")
        memoryGameContainer.appendChild(memoryGame);
        memoryGame.setAttribute("id", "memoryGame");


        //Styles of the Memory Box Grid
        memoryGame.classList.add("memoryGame", tilesClass);

        //Randomizing logos' positioning
        let logos = boxesNumber / 2;
        halfTiles = Array.apply(null, { length: logos }).map(Number.call, Number);


        let iconsOnGame = halfTiles.concat(halfTiles); //array of numbers representing the icons

        //Algoritm for shuffling the array of icons
        for (let i = iconsOnGame.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [iconsOnGame[j], iconsOnGame[i]] = [iconsOnGame[i], iconsOnGame[j]];
        }


        //Creating Tiles
        for (let a = 0; a < boxesNumber; a++) {
            //Creating the box itself and assigning a class to it
            let tile = document.createElement("div")
            tile.setAttribute("class", "tiles");

            //Creating the logos behind each block
            let figure = document.createElement("i")
            figure.classList.add("logos", "fa", "fa-brands");
            figure.style.display = "none";

            //Code to add the hidden logo to the game
            tile.appendChild(figure);
            figure.classList.add(figures[iconsOnGame[a]]);
            memoryGame.appendChild(tile);
        }
    }

    /**
     * SHOW EXTRA INFORMATION(APART FROM THE TIMER) SUCH AS THE HELP BUTTON IN CASE YOU DON'T KNOW HOW TO PLAY AND * THE USERNAME TOO
     */
    function extraInformation() {
        //Creating section of extra info
        view.append(extraInfoContainer);
        let extraInfo = document.createElement("article");
        extraInfo.setAttribute("id", "extraInfo");
        extraInfo.classList.add("d-flex", "order-2");//Styles for bootstrap

        //Creating the modal button, assigning it no styles
        let helpButton = document.createElement("button")
        helpButton.classList.add("no-styles-button");
        helpButton.style.height = "fit-content";

        //Creating the <i> tag and assigning the classes so it's a help button
        let helpIcon = document.createElement("i");
        helpIcon.classList.add("fa-solid", "fa-circle-question");
        helpIcon.style = "color: white; margin-top:0";

        //Creating the user part of the extra information section
        let userText = document.createElement("p");
        userText.innerText = `Player: ${username}`;
        userText.style = "margin-right: 20px; justify-self:right; justify-content:flex-start";

        //Appending Process
        helpButton.append(helpIcon);
        extraInfo.append(userText, helpButton);

        //Positioning the extraInfo within the extraInfo Container
        extraInfoContainer.append(extraInfo);
        extraInfo.style.gridColumn = "0 span 1";

        //Event Listener for the help Button
        helpButton.onclick = () => {
            howToModalB.show();
            pause = true; //this will make the timer stops when clicking the help button
        }


    }

    /**
     * IN GAME FUNCTIONS
     * 
     */

    /**
     * COLLECTS ALL THE OTHER FUNCTIONS SO THE GAME WORKS
     * 
     */
    function game() {
        //clearing the variables so the game can start
        win = false;
        pause = false;
        guessedIcons = [];


        extraInformation();
        creatingCronometer();
        buildTiles();


        //Adding the events to the tiles,this is the game itself
        let tiles = document.querySelectorAll(".tiles");
        for (let a = 0; a < tiles.length; a++) tiles[a].onclick = (e) => whenClick(e, tiles);

    }

    /**
     * PREPARES THE ELEMENTS THAT WILL BE USED FOR THE TIME TO BE SHOWN ON THE SCREEN
     * IT WILL ALSO CREATE THE INTERVAL FOR TIMING
     * 
     */
    function creatingCronometer() {
        //Assigning values to minutes and seconds based on the time
        minutes = Math.floor(time / 60);
        seconds = time % 60;

        cronometerContainer.setAttribute("id", "cronometer")
        cronometerContainer.classList.add("time");

        cronometer.innerText = seconds < 10
            ? `Time: ${minutes}:0${seconds}`
            : `Time ${minutes}:${seconds}`;


        cronometerContainer.append(cronometer);
        extraInfoContainer.append(cronometerContainer);
        cronometerContainer.style.gridColumn = "0/1";

        counting = setInterval(timing, 1000);//establish the interval for the timing

    }



    /**
     * UPDATES THE TIME EACH SECOND UNTIL IS OVER
     */
    function timing() {
        if (win || pause) {
            clearInterval(counting);
        }

        if (seconds < 0) return;

        if (seconds == 0 && minutes > 0) {
            seconds = 59;
            minutes -= 1;
        }
        else if (seconds == 0 && minutes == 0) {
            clearInterval(counting);
            endGame();

        }


        cronometer.innerText = seconds < 10
            ? `Time ${minutes}:0${seconds}`
            : `Time ${minutes}:${seconds}`;


        seconds -= 1;


    }


    /**
     * FUNCTION THAT HANDLES THE MANAGEMENT OF WHAT TILES YOU ARE CLICKING, BASICALLY TO AVOID BUGS AND SHOW A TILE WHEN ITS' CLICKED
     * Return will only be used to finish executing this function 
     */
    function whenClick(e, tileNodeList) {

        //parentNode.parentNode because the event target of the icon is the path tag which is inside the svg path which is inside the box tag, the box tags are the ones we are saving so we know if the user had already clicked on them or not
        if (guessedIcons.includes(e.target.parentNode.parentNode) || guessedIcons.includes(e.target)) {
            return
        }
        //this condition will be used for avoiding bugs when clicking the same elemnent
        if (previousTile != undefined && (e.target.parentNode == previousTile.target || e.target == previousTile.target || e.target.parentNode.parentNode == previousTile.target)) {
            return;
        }

        e.target.firstChild.style.display = "block";
        matchLogos(e, previousTile, tileNodeList);

        previousTile = (previousTile == undefined)
            ? e
            : undefined;

    }


    /**
     * Algorithm to know what to do if the matched elements are not similar or are similar, WORKS TOGETHER WITH THE WHENCLICK FUNCTION
     * Return will only be used to finish executing this function 
     */
    function matchLogos(currentClick, previousClick, tileNodeList) {
        if (previousClick == undefined) return


        //Conditional for both current and previous Click targets are similar
        if (previousClick.target.firstChild.classList.value == currentClick.target.firstChild.classList.value
            && previousClick.target.firstChild.classList != currentClick.target.firstChild.classList) {

            currentClick.target.firstChild.style.display = "block";
            guessedIcons.push(previousClick.target, currentClick.target);

            previousClick.target.classList.add("matched", "goodMatch-Animation");
            currentClick.target.classList.add("matched", "goodMatch-Animation");

            //To know if you won
            if (guessedIcons.length == tileNodeList.length) {

                win = true;
                endGame();
            }

            return;
        }
        //Conditional when the previous and current click targets are not similar logos

        document.getElementById("memoryGame").classList.add("unclickeable");

        previousClick.target.classList.add("wrongMatch-Animation");
        currentClick.target.classList.add("wrongMatch-Animation");

        setTimeout(() => {
            document.getElementById("memoryGame").classList.remove("unclickeable");

            previousClick.target.firstChild.style.display = "none";
            currentClick.target.firstChild.style.display = "none";

            previousClick.target.classList.remove("wrongMatch-Animation");
            currentClick.target.classList.remove("wrongMatch-Animation");
        }, 500);

    }

    /**
     * Updates the winnings and losses stats and showing the user when he/she won/lost by using modals
     * 
     */

    function endGame() {
        textAfterGame.innerHTML = (win == true)
            ? `Congratulations ${username}!<br> You won!`
            : `Game Over ${username}!<br>You lost`;
        if (win) wins++
        else losses++

        document.getElementById("stats").innerHTML = `Wins: ${wins}<br>Losses: ${losses}`;
        afterGameModal.show();

    }
})