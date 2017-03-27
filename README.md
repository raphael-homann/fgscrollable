# fgscrollable
animations au scroll

# utilisation

  jQuery(function () {
  
      //smooth scroll
      FGScrollable.initSmoothScroll(.3);
  
      jQuery(".selector-1").FGanimate({from: 0, to: 0.5, full: false}, {from: {duration:1,left: "500px", scale:3,opacity: 0.5,rotation:"90deg"}});
      
      jQuery(".plx-content").FGanimate({from: 0, to: 1, full: false}, {from: {duration:1,top: -100},to: {duration:1,top: +100}});
  
      jQuery(".enmb-conteneur").FGParallax();
  
  });
