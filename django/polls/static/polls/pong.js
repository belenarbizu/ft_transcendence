export function pongView()
{
    document.getElementById('header').style.display = 'none';
    return `<canvas id="canvasGame" style="background-color: black" height="400" width="640"></canvas>'`;
}