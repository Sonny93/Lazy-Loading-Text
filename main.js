class LazyLoadingText {
    constructor({ container = null, textes = [], buttons = null }) {
        if (buttons === null)
            throw new Error('buttons opt missing');
        if (buttons?.container === null)
            throw new Error('button container missing');
        if (buttons?.loadMore === null)
            throw new Error('button loadMore missing');
        if (buttons?.loadAll === null)
            throw new Error('button loadAll missing');

        this.container = container;
        this.textes = textes;
        this.buttons = {
            eventsAttached: false,
            ...buttons
        };
        this.load = {
            max: 50,
            offset: 0
        }
        this._observe = {
            options: {
                root: this.container,
                rootMargin: '0px',
                threshold: 1.0
            },
            observerTop: new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting)
                        this.loadPlusTextes();
                });
            }, this.options)
        }
        this._events = {};

        this.buttons.loadMore.textContent = `Charger ${this.load.max} messages`;
        this.buttons.loadAll.textContent = `Revenir aux messages récents`;

        this.loadTextes(this.load.offset, this.load.max);
    }
    loadPlusTextes() {
        if (this.load.offset < 0) {
            this.load.offset = 0;
        } else if (this.load.offset > this.textes.length) {
            this.load.offset = this.textes.length - this.load.max;
        } else {
            this.load.offset += this.load.max;
        }
        this.loadTextes(this.load.offset, this.load.max);
        return this;
    }
    loadNewestTextes() {
        this.load.offset = 0;
        this.loadTextes(this.load.offset, this.load.max, true);
        return this;
    }
    loadOldestTextes() {
        this.load.offset = this.textes.length - this.load.max;
        this.loadTextes(this.load.offset, this.load.max, true);
        return this;
    }
    loadMinusTextes() {
        if (this.load.offset < 0) {
            this.load.offset = 0;
        } else if (this.load.offset > this.textes.length) {
            this.load.offset = this.textes.length;
        } else {
            this.load.offset -= this.load.max;
        }
        this.loadTextes(this.load.offset, this.load.max, this.load.offset < 1 ? 0 : this.load.max);
        return this;
    }
    loadTextes(offset, max, bypass) {
        const _m = this.textes.length - offset - max;
        const _p = this.textes.length - offset;
        // console.log('Load previous textes offset', offset, 'max', max, '_m', _m, '_p', _p);
        if (_m < 1)
            if (!bypass || bypass === false)
                return console.log(_m, _p);
        this.container.innerHTML = '';
        this.textes.slice(_m, _p).forEach((texte, index, array) => {
            const element = document.createElement('div');
            element.textContent = `ID: ${texte.id}, Content: ${texte.content}, isLast: ${texte.isLast}`;
            this.container.append(element);
            if (index === 0) {
                this._observe.observerTop.observe(element);
            } else if (index === (array.length - 1) && texte.isLast === false) {
                this.buttons.loadMore.textContent = `Charger ${this.load.max} textes`;
                this.buttons.loadAll.textContent = `Revenir aux textes récents (${this.load.offset} textes)`;

                if (this.buttons.eventsAttached === false) {
                    this.buttons.loadMore.addEventListener('click', () => this.loadMinusTextes());
                    this.buttons.loadAll.addEventListener('click', () => this.loadNewestTextes());
                    this.buttons.eventsAttached = true;
                }
            }

            if (this.load.offset > 0) { // show
                this.buttons.container.classList.remove('hide');
            } else {
                this.buttons.container.classList.add('hide');                    
            }

            this.container.scrollTop = this.container.scrollHeight;
        });
        return this;
    }
}

async function generateTextes(nbr = 50) {
    return new Promise((resolve, reject) => {
        const liste = [];
        for (let i = 0; i <= nbr; i++) {
            liste.push({
                id: i,
                content: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
                isLast: i === nbr ? true : false
            });
            if (i === nbr)
                return resolve(liste);
        }
    });
}

let lazyLoadingText = null;
window.onload = () => {
    const loadNow = Date.now();
    console.log('Page render took', loadNow - performance.timing.navigationStart, 'ms');
    generateTextes(500000).then(textes => {
        const generateNow = Date.now();
        console.log(`500k took`, generateNow - loadNow, 'ms');
        console.log(`Total render:`, (generateNow - loadNow) + (loadNow - performance.timing.navigationStart), 'ms')
        lazyLoadingText = new LazyLoadingText({
            container: document.querySelector('.content'),
            textes,
            buttons: {
                container: document.querySelector('div.buttons-container'),
                loadMore: document.querySelector('div.buttons-container > button.loadMore'),
                loadAll: document.querySelector('div.buttons-container > button.loadAll')
            }
        });
    }).catch(console.error);
}