const messages = {
    container: document.querySelector('.content'),
    list: []
}
const load = {
    max: 50,
    offset: 0
}
const callbackTop = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting)
            loadPlusMessages();
    });
}
const _observe = {
    options: {
        root: messages.container,
        rootMargin: '0px',
        threshold: 1.0
    },
    observerTop: new IntersectionObserver(callbackTop, this.options)
}
for (let i = 0; i <= 500000; i++) {
    messages.list.push({
        id: i,
        content: randStr(),
        isLast: i === 500000 ? true : false
    });
}

loadMessages(load.offset, load.max);

function t() {
    const start = Date.now();
    setInterval(function() {
        messages.container.scrollTop = 0;
        console.log('Elapsed', Date.now() - start, 'ms', (Date.now() - start) / 1000, 's');
    }, 1);
}

function loadPlusMessages() {
    if(load.offset < 0) {
        load.offset = 0;
    } else if(load.offset > messages.list.length) {
        load.offset = messages.list.length - load.max;
    } else {
        load.offset += load.max;
    }
    loadMessages(load.offset, load.max);
}

function loadNewestMessages() {
    load.offset = 0;
    loadMessages(load.offset, load.max, true);
}

function loadOldestMessages() {
    load.offset = messages.list.length - load.max;
    loadMessages(load.offset, load.max, true);
}

function loadMinusMessages() {
    if(load.offset < 0) {
        load.offset = 0;
    } else if(load.offset > messages.list.length) {
        load.offset = messages.list.length;
    } else {
        load.offset -= load.max;
    }
    loadMessages(load.offset, load.max, load.offset < 1 ? 0 : load.max);
}

function loadMessages(offset, max, bypass) {
    const _m = messages.list.length - offset - max;
    const _p = messages.list.length - offset;
    console.log('Load previous messages', 'offset', offset, 'max', max, '_m', _m, '_p', _p);
    if (_m < 1)
        if (!bypass || bypass === false)
            return console.log(_m, _p);
    messages.container.innerHTML = '';
    messages.list.slice(_m, _p).forEach((message, index, array) => {
        const element = document.createElement('div');
        element.textContent = `ID: ${message.id}, Content: ${message.content}, isLast: ${message.isLast}`;
        messages.container.append(element);
        if (index === 0) {
            _observe.observerTop.observe(element);
        } else if (index === (array.length - 1) && message.isLast === false) {
            const buttonsContainer = document.createElement('div');
            buttonsContainer.classList.add('buttons-container');

            const loadRecent = document.createElement('button');
            loadRecent.classList.add('load-recent');
            loadRecent.textContent = `Charger ${load.max} messages`;

            loadRecent.addEventListener('click', loadMinusMessages);

            const loadNewest = document.createElement('button');
            loadNewest.classList.add('load-newest');
            loadNewest.textContent = `Revenir aux messages récents`;

            loadNewest.addEventListener('click', loadNewestMessages);

            buttonsContainer.append(loadRecent);
            buttonsContainer.append(loadNewest);

            messages.container.append(buttonsContainer);
        }
        messages.container.scrollTop = messages.container.scrollHeight;
    });
}

function randStr() {
    return (Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2))
}

window.onload = () => {
    const now = Date.now();
    console.log('Page render took', now - performance.timing.navigationStart, 'ms');
}