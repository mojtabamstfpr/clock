window.addEventListener("DOMContentLoaded",() => {
    const c = new Clock31(".clock");
  });
  
  class Clock31 {
    constructor(el) {
      this.el = document.querySelector(el);
  
      this.init();
    }
    init() {
      this.timeUpdate();
    }
    get timeAsObject() {
      const date = new Date();
      const h = date.getHours();
      const m = date.getMinutes();
      const s = date.getSeconds();
  
      return {h,m,s};
    }
    get timeAsString() {
      const [h,m,s,ap] = this.timeDigits;
      const time = `${h}:${m}:${s} ${ap}`;
  
      return `${time}`.trim();
    }
    get timeDigits() {
      let {h,m,s} = this.timeAsObject;
  
      const ap = h > 11 ? "PM" : "AM";
      if (h > 12) h -= 12;
  
      const hh = `${h}`;
      const mm = m < 10 ? `0${m}` : `${m}`;
      const ss = s < 10 ? `0${s}` : `${s}`;
  
      return [hh,mm,ss,ap];
    }
    animateSecondHand() {
      const time = this.timeAsObject;
      const minFraction = time.s / 60;
      const angleB = Utils.decPlaces(360 * minFraction,3);
      const angleA = angleB - 6;
      const duration = 300;
      const easing = "cubic-bezier(0.65,0,0.35,1)";
      const handEl = this.el?.querySelectorAll("[data-unit]")[2];
      // hand itself
      handEl?.animate(
        [
          { transform: `rotate(${angleA}deg)` },
          { transform: `rotate(${angleB}deg)` }
        ],
        { duration, easing }
      );
      // numbers inside
      const numbers = handEl.children;
      for (let n = 0; n < numbers.length; ++n) {
        const transY = -100 * (n + 1);
        numbers[n].animate(
          [
            { transform: `translateY(${transY}%) rotate(${-angleA}deg)` },
            { transform: `translateY(${transY}%) rotate(${-angleB}deg)` }
          ],
          { duration, easing }
        );
      }
    }
    timeUpdate() {
      // update the accessible timestamp in the `title`
      this.el?.setAttribute("title", this.timeAsString);
      // move the hands
      const time = this.timeAsObject;
      const minFraction = time.s / 60;
      const hrFraction = (time.m + minFraction) / 60;
      const twelveHrFraction = (time.h % 12 + hrFraction) / 12;
      const angles = [
        {
          prop: "--secAngle",
          value: Utils.decPlaces(360 * minFraction,3)
        },
        {
          prop: "--minAngle",
          value: Utils.decPlaces(360 * hrFraction,3)
        },
        {
          prop: "--hrAngle",
          value: Utils.decPlaces(360 * twelveHrFraction,3)
        }
      ];
      for (let a of angles) {
        this.el?.style.setProperty(a.prop,`${a.value}deg`);
      }
      // draw the hands using the corresponding digits
      const digits = this.timeDigits;
      for (let d = 0; d < digits.length; ++d) {
        const unitEl = this.el?.querySelectorAll("[data-unit]")[d];
        if (unitEl) {
          const numbers = unitEl.children;
          for (let n = 0; n < numbers.length; ++n) {
            numbers[n].textContent = digits[d];
          }
        }
      }
      this.animateSecondHand();
      // loop
      clearTimeout(this.timeUpdateLoop);
      this.timeUpdateLoop = setTimeout(this.timeUpdate.bind(this),1e3);
    }
  }
  class Utils {
    static decPlaces(n,d) {
      return Math.round(n * 10 ** d) / 10 ** d;
    }
  }