// constants
const decayTime = 0.7 // click
const length = 5 // click
const attackTime = 5 // hold
const release = 5 // hold
Params= {
    nOsc: 7,
    nOsc_hold: 5, 
    nBo: 7,
    tone: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    Amp_0: [1, 1, 1, 1, 0.6, 0.3, 0.3],
    duration: [1, 1, 1, 1, 1, 0.2, 0.2]
}
Freq = [
    [432, 434, 216, 214, 72, 864, 1728],  // C
    [480, 482, 240, 238, 80, 960, 1920], // D
    [528, 530, 264, 262, 88, 1056, 2112], // E
    [594, 596, 298, 296, 99, 1188, 2376], // F
    [672, 674, 336, 334, 112, 1344, 2688], // G
    [720, 722, 360, 362, 120, 1440, 2880], // A
    [768, 766, 384, 386, 128, 1536, 3072], // B
    [432, 434, 216, 214, 72, 864, 1728] // test
]

const context = new AudioContext();
const primaryGainControl = context.createGain();
primaryGainControl.gain.setValueAtTime(0.4, 0)
primaryGainControl.connect(context.destination);
const secondaryGainControl = context.createGain();
secondaryGainControl.gain.setValueAtTime(0, 0)
secondaryGainControl.connect(primaryGainControl);

var spans_click = []
var spans_hold = []
var spans_new = []

class Bo{
    constructor(gain ,tone, button){

        this.gain = gain
        this.tone = tone;
        this.button = button;
        this.gNode=[]; 
        this.osc=[];

        for (let i = 0; i < Params.nOsc; i++) {
            this.gNode[i]=context.createGain()
            this.gNode[i].connect(this.gain)
            this.osc[i]= context.createOscillator()
            this.osc[i].start();
        }
    }
    
    click(){
        context.resume();
        console.log(context.state);
        var now = context.currentTime;
        this.gain.gain.cancelScheduledValues(now);
        this.gain.gain.setValueAtTime(0, now)
        this.gain.gain.linearRampToValueAtTime(0.5, now + 0.02);
        this.gain.gain.linearRampToValueAtTime(0, now + length);
        console.log(now)

        for (let i=0;i<Params.nOsc;i++) {     
            // console.log(Freq[this.tone][i]);
            this.osc[i].frequency.cancelScheduledValues(now);
            this.osc[i].frequency.setValueAtTime(Freq[this.tone][i], now); 
            // console.log(this.osc[i].frequency);
            this.gNode[i].gain.setValueAtTime(Params.Amp_0[i], now)
            this.gNode[i].gain.exponentialRampToValueAtTime(0.01, now+Params.duration[i]*length)
            this.osc[i].connect(this.gNode[i])
        }
        this.click_anim();
    }
    click_anim(){
        console.log(spans_click)
        var span = document.createElement("span")
        spans_click.push(span)
        span.classList.add("span"+this.tone)
        var page = document.getElementsByClassName("page")
        page[0].append(span)
        span.classList.add("anim_click")
        var waittime = getComputedStyle(document.documentElement).getPropertyValue('--click_anim_time')
        setTimeout(function(){
            span = spans_click.shift()
            console.log("click_timeout" + span)
            span.remove()
        }, waittime.replace(/.$/,"000"))
    }
    hold_starts(){
        context.resume();
        console.log(context.state);
        console.log("bo hold starts");
        var now = context.currentTime;
        const value = this.gain.gain.value;
        this.gain.gain.cancelScheduledValues(now);
        this.gain.gain.setValueAtTime(value, now);
        this.gain.gain.linearRampToValueAtTime(0.5, now + attackTime);
        for (let i = 0; i < Params.nOsc_hold; i++) {
            this.osc[i].frequency.setValueAtTime(Freq[this.tone][i], now);
            this.osc[i].connect(this.gNode[i])
            this.gNode[i].gain.setValueAtTime(Params.Amp_0[i], now)
        }
        this.hold_starts_anim();
    }
    hold_starts_anim(){
        var span = document.createElement("span")
        spans_hold.push(span)
        console.log("hold_starts_anim")
        span.classList.add("span"+this.tone)
        var page = document.getElementsByClassName("page")
        page[0].append(span)
        span.classList.add("anim_hold_start")
    }
    hold_ends(){
        console.log("bo_onHoldEnd called");
        var now = context.currentTime; 
        const value = this.gain.gain.value;
        console.log(value)
        this.gain.gain.cancelScheduledValues(now);
        // console.log(this.gain.gain.value)
        this.gain.gain.setValueAtTime(value, now)
        this.gain.gain.exponentialRampToValueAtTime(0.001, now + release);
        // this.gain.gain.setValueAtTime(0, now + release)
        // console.log(this.gain.gain.value)
        this.hold_ends_anim()
     }
    // hold_ends_anim(){
    //     // get current size
    //     var span = spans_hold.shift()
    //     let width = span.style.width
    //     let height = span.style.height
    //     let opacity = span.style.opacity
    //     // creates new span
    //     var span_new = document.createElement("span")
    //     spans_new.push(span_new)
    //     span_new.classList.add("span"+this.tone)
    //     var page = document.getElementsByClassName("page")
    //     page[0].append(span_new)
    //     span_new.style.height = height
    //     span_new.style.width = width
    //     span_new.style.opacity = opacity
    //     span_new.style.transform = 'translate'
    //     // span_new.classList.add("anim_hold_end")
    //     span.remove() // replace old span
    //     var waittime = getComputedStyle(document.documentElement).getPropertyValue('--release_time')
    //     setTimeout(function(){
    //         var span = spans_new.shift()
    //         span.remove()
    //     }, waittime.replace(/.$/,"000"))
    // }
    hold_ends_anim(){
        // get current size
        console.log("hold_ends_anim called!")
        var span = spans_hold[0];
        span.setAttribute("style","opacity:0;")
        var waittime = getComputedStyle(document.documentElement).getPropertyValue('--release_time')
        setTimeout(function(){
            var span = spans_hold.shift()
            span.remove()
        }, waittime.replace(/.$/,"000"))
    }
    
}

class ClickAndHold {
    /**
     * 
     * @param {*} target The HTML element to apply the event to
     */
    constructor(target, bo){
        this.target = target;
        this.bo = bo;
        this.isHeld = false;
        this.timeOutID = null;
        console.log(this.target)
        if (this.target){
            ["mousedown", "touchstart"].forEach(type => {
                this.target.addEventListener(type, this._onHoldStart.bind(this))
            });
            ["mouseup", "touchend", "touchcancel"].forEach(type => {
                this.target.addEventListener(type, this._onHoldEnd.bind(this))
            });
        }
    }
    _onHoldStart(){     
        this.timeOutID = setTimeout(() => {
            this.isHeld = true;
            console.log("hold!")
            this.bo.hold_starts();
        }, 1000); // 1 second
    }

    _onHoldEnd(){
        if (this.isHeld){
            this.isHeld = false;
            this.bo.hold_ends(); 
            console.log("hold released!")
        } else {
            clearTimeout(this.timeOutID);
            this.bo.click();
            console.log("click!")
        }   
    }

    static apply(target, bo){
        new ClickAndHold(target, bo);
    }
};

// get buttons and create bo objects
var bo = []
for (let i = 0; i < Params.nBo; ++i){
    bo[i] = new Bo(secondaryGainControl, i, document.getElementById("bo" + i))
}

for (let i = 0; i < Params.nBo; ++i){
    if (bo[i] === undefined){
        console.log("undefined bo");
    } else {
        ClickAndHold.apply(bo[i].button, bo[i])
    } 
}

// add button
for (let i = 0; i < Params.nBo; i++){
    document.bo-container.append(bo[i].button);   
}
