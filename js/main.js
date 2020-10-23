(function(){
  var more = document.querySelector("#more");
  var clk = document.querySelector("#clk");
  var logo = document.querySelector("#logo");
  var tips = document.querySelector("#tips");
  var left_container = document.querySelector("#left");
  var s_interval = setInterval(function(){
    if(document.getElementById('s_left').style.display == 'none'){
      document.getElementById('s_left').style.display = 'block';
      document.getElementById('s_right').style.display = 'none';
    }else{
      document.getElementById('s_left').style.display = 'none';
      document.getElementById('s_right').style.display = 'block';
    }

  },500)

  setTimeout(function(){
    clearInterval(s_interval);
    document.getElementById('s_left').style.display = 'none';
      document.getElementById('s_right').style.display = 'none';
  },2000)

  function Hide(obj){
    obj.style.display='none';
  }
  function open(){
    //mraid.extend.viewMore('https://m.baidu.com');
  }


  window.addEventListener('deviceorientation', handleFunc, false);
  var last_position,finished;
  function handleFunc(event) {
    var alpha = event.alpha;
    var beta = event.beta;
    var gamma = event.gamma; 
    console.log('设备方向 gamma:', gamma);
    if (gamma < -30 && last_position != 1) {
      //move left
      last_position= 1;
      left_container.style.transform = 'translateX(-100%)';
      left_container.style.webkitTransform = 'translateX(-100%)';
      Hide(tips)
    } else if (gamma > 30 && last_position != 2) {
      //move right
      last_position = 2;
      left_container.style.transform = 'translateX(0%)';
      left_container.style.webkitTransform = 'translateX(0%)';
      Hide(tips)
    }
  }
})()