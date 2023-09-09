let fullscreen = document.getElementsByClassName("bo-container")[0];
function fullscreen_trig(){
    console.log("fullscreen triggered")
    if (!document.fullscreenElement) {
        fullscreen?.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
} 