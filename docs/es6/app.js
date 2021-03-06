class MainController {

    constructor(container) {
        this.container = container;
        this.inputCurr = "USD";
        this.outputCurr = "EUR";


        this.input = this.container.querySelector("#input");
        this.output = this.container.querySelector("#output");
        this.inputSelect = this.container.querySelector("#inputCurr");
        this.outputSelect = this.container.querySelector("#outputCurr");
        this.db = this.openDatabase();
        

        this.getCurrencies();
        this.setRate(this.inputCurr,this.outputCurr);
        this.conversionLogic();
        this.registerServiceWorker();
    }

    //Event Listeners for conversion logic
    conversionLogic() {
        this.inputSelect.addEventListener('change', _ => {
            this.inputCurr = this.inputSelect.value;
            this.setRate(this.inputCurr,this.outputCurr);
        })
        this.outputSelect.addEventListener('change', _ => {
            this.outputCurr = this.outputSelect.value;
            this.setRate(this.inputCurr, this.outputCurr);
        })
        this.input.addEventListener('keyup', () => {
            let inputValue = this.input.value;
            if (!isNaN(inputValue) && inputValue !== '' && inputValue !== null) {
                output.value = parseFloat(inputValue) * this.rate;
            }
        })
    }

    // Sets rate and puts it in class property
    setRate(inputCurr,outputCurr) {
        this.getRate(inputCurr,outputCurr)
            .then(rate => {
                if (!rate) {
                    output.value = "Rate unavailable .."
                    return;
                }
                this.rate = rate.val
            })
    }

    // Gets all currencies <= intercepted by SW
    getCurrencies() {
        return fetch('https://free.currencyconverterapi.com/api/v5/currencies',{mode:'cors'})
            .then(res => {
                res.json()
                    .then(json => {
                        Object.keys(json.results).forEach(key => {
                            let str = `<option value="${key}">${key}</option>`;
                            $(this.inputSelect).append(str)
                            $(this.outputSelect).append(str)
                        })
                        this.inputSelect.value = this.inputCurr;
                        this.outputSelect.value = this.outputCurr;
                    })
                    .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
    }

    // Workflow for getting rate
    // If it's in idb and recent, we use it, else,
    // We try to fetch it, if the fetch works it's alright
    // else, we use the idb version if there's any.
    getRate(inputCurr,outputCurr) {
        return this.checkDB(inputCurr,outputCurr)
            .then(res => {
                if (!res) {
                    return this.fetchRates(inputCurr,outputCurr);
                }
                else {
                    if (Date.now() - res.time > 60*60*1000) {
                        return this.fetchRates(inputCurr,outputCurr)
                    }
                    return res;
                }
            })
        
    }

    // Checks if the conversion rate was saved
    checkDB(inputCurr,outputCurr) {
        return this.db.then(db => {
            if (!db) return;
            let rate = db.transaction('rates').objectStore('rates').get(`${inputCurr}_${outputCurr}`);
            return rate.then(obj => {
                return obj;
            })
        })
    }

    // Looks for conversion rates in the API
    fetchRates(inputCurr,outputCurr) {
        let str = `https://free.currencyconverterapi.com/api/v5/convert?q=${inputCurr}_${outputCurr}&compact=ultra`;
        return fetch(str, { mode: 'cors' })
            .then(res => {
                return res.json()
                    .then(json => {
                        let object = {
                            key: Object.keys(json)[0],
                            val: json[Object.keys(json)[0]],
                            time: Date.now()
                        }
                        this.saveDB(object);
                        return object
                    })
                    .catch(err => console.log(err))
            })
            .catch(_ => this.checkDB(inputCurr,outputCurr))
    }

    // Saves rate in idb
    saveDB(object) {
        return this.db.then(db => {
            if(!db) return;
            const tx = db.transaction('rates','readwrite');
            tx.objectStore('rates').put(object)
            return tx.complete;
        })
    }

    // Register Service worker
    // TODO : manage updates.
    registerServiceWorker() {
        if (!navigator.serviceWorker) return;

        navigator.serviceWorker.register('sw.js')
    }

    // Promised db connection
    openDatabase() {
        // If the browser doesn't support service worker,
        // we don't care about having a database
        if (!navigator.serviceWorker) {
            return Promise.resolve();
        }

        return idb.open('curr-conv', 1, function (upgradeDb) {
            upgradeDb.createObjectStore('rates', {
                keyPath: 'key'
            });
        });
    }

}

let mainCont = new MainController(document.querySelector('#converter'))