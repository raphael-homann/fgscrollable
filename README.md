# fgscrollable
animations au scroll

# prérequis 
Nécessite l'utilisation de la librairie d'animation GreenSock (ave cplugin CSS) : 
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.19.1/plugins/CSSPlugin.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.19.1/TweenLite.min.js"></script>
```
ou
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.19.1/TweenMax.min.js"></script>
```

# utilisation

```javascript
jQuery(function () { 
  //smooth scroll
  FGScrollable.initSmoothScroll(.3);

  // anim #1
  jQuery(".selector-1").FGanimate({from: 0, to: 0.5, full: false}, {from: {duration:1,left: "500px", scale:3,opacity: 0.5,rotation:"90deg"}});

  jQuery(".plx-content").FGanimate({from: 0, to: 1, full: false}, {from: {duration:1,top: -100},to: {duration:1,top: +100}});

  jQuery(".enmb-conteneur").FGParallax();
});
```
