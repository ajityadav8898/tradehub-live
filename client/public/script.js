var crsr = document.querySelector("#cursor")
var blur = document.querySelector("#cursor-blur")
document.addEventListener("mousemove",function(dets){
    crsr.style.left = dets.x +"px";
    crsr.style.top = dets.y +"px";
    
    // console.log("hey");
    blur.style.left = dets.x -180 +"px";
    blur.style.top = dets.y -180 +"px";
 })

var h4all = document.querySelectorAll("#nav h4")
h4all.forEach(function(elem) {
  elem.addEventListener("mouseenter", function(){
    crsr.style.scale = 3
    crsr.style.border = "1px solid #fff"
    crsr.style.backgroundColor = "transparent"

  })

  elem.addEventListener("mouseleave", function(){
    crsr.style.scale = 1
    crsr.style.border = "0px solid #7FFFD4"
    crsr.style.backgroundColor = "#7FFFD4"

  })  
})
gsap.to("#nav",{
    backgroundColor:"#000",
    height:"12vh",
    duration:0.5,
    scrollTrigger:{
        trigger:"#nav",
        scroller:"body",
        // markers:true,
        start:"top -10%",
        end:"top -11%",
        scrub:1
    }
})

gsap.to("#main",{
    backgroundColor:"#000",
    scrollTrigger:{
        trigger:"#main",
        scroller:"body",
        // markers:true,
        start:"top -25%",
        end:"top -70%",
        scrub:2
    }
})



gsap.from("#about-us img ,#about-us-in", {
  y:90,
  opacity:0,
  duration:1,
  // stagger:0.4,
  scrollTrigger:{
    trigger:"#about-us",
    scroller:"body",
    // markers:true,
    start:"top 70%",
    end:"top 65%",
    scrub:3

  }
})

gsap.from(".cards", {
  scale:0.8,
  opacity:0,
  duration:1,
  stagger:0.4,
  scrollTrigger:{
    trigger:".cards",
    scroller:"body",
    // markers:true,
    start:"top 70%",
    end:"top 65%",
    scrub:2

  }
})



// // Basic virtual trading simulator
// let balance = 10000; // Starting virtual balance
// let portfolio = [];

// function buyStock(stock, price, quantity) {
//   const totalCost = price * quantity;
//   if (totalCost > balance) {
//     alert('Not enough balance to buy stock');
//     return;
//   }
//   balance -= totalCost;
//   portfolio.push({ stock, price, quantity });
//   updatePortfolio();
// }

// function sellStock(stock, price, quantity) {
//   const stockInPortfolio = portfolio.find(item => item.stock === stock);
//   if (!stockInPortfolio || stockInPortfolio.quantity < quantity) {
//     alert('Not enough stock to sell');
//     return;
//   }
//   const totalValue = price * quantity;
//   balance += totalValue;
//   stockInPortfolio.quantity -= quantity;
//   if (stockInPortfolio.quantity === 0) {
//     portfolio = portfolio.filter(item => item.stock !== stock);
//   }
//   updatePortfolio();
// }

// function updatePortfolio() {
//   console.log('Current Portfolio:', portfolio);
//   console.log('Current Balance:', balance);
// }
