document.ready(function(){
    //Ventana del pong
    const canvas = document.getElementById("canvasGame");
    const context = canvas.getContext("2d");
    canvas.height = 400;
    canvas.width = 640;

    //Marcadores
    let scoreOne = 0;
    let scoreTwo = 0;

    //Game stats
    let speedGame = 5;

    //Palas y pelota
    class Element{
        constructor(options)
        {
            this.x = options.x;
            this.y = options.y;
            this.height = options.height;
            this.width = options.width;
            this.color = options.color;
            this.speed = options.speed;
        }
    }
    //Player One
    const playerOne = new Element({x:10, y:150, height:100, width:15, color:"#fff", speed:speedGame});
    //Player Two
    const playerTwo = new Element({x:615, y:150, height:100, width:15, color:"#fff", speed:speedGame});
    //Ball
    const ball = new Element({x:314, y:194, height:16, width:16, color:"#fff", speed:speedGame});

    //Score
    function    displayScore()
    {
        context.font = "18px Arial";
        context.fillStyle = "#fff";
        context.fillText(scoreOne, 100, 30);
        context.fillText(scoreTwo, 540, 30);
    }
    //Draw
    function    drawElement(element)
    {
        context.fillStyle = element.color;
        context.fillRect(element.x, element.y, element.width, element.height);
    }
    function    drawElements()
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawElement(playerOne);
        drawElement(playerTwo);
        drawElement(ball);
        displayScore();
    }
    //Ball bounce
    function ballBounce()
    {

    }
    //Wall collisions
    function ballCollision()
    {

    }
    /*  KEYS            */
    //error con dos pulsaciones simultaneas
    window.addEventListener("keydown", keyPress, false); //keypress, keydown
    function    keyPress(e)
    {
        //player 1
        if      (e.key == "w") playerOne.y -= playerOne.speed;
        else if (e.key == "s") playerOne.y += playerOne.speed;
        //player 2
        if      (e.key == "o") playerTwo.y -= playerTwo.speed;
        else if (e.key == "l") playerTwo.y += playerTwo.speed;
    }
    /*  GAME LOOP       */
    function    loop()
    {
        drawElements();
        window.requestAnimationFrame(loop);
    }

    loop();
});
