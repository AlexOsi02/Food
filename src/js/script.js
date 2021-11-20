window.addEventListener('DOMContentLoaded', () => {
    //tabs
    const tabs = document.querySelectorAll('.tabheader__item');
    const tabsContent = document.querySelectorAll('.tabcontent');
    const tabsParent = document.querySelector('.tabheader__items');

    function hideTabContent() {
        tabsContent.forEach(function (elem) {
            elem.classList.add('hide');
            elem.classList.remove('show', 'fade');
        });
        tabs.forEach(elem => {
            elem.classList.remove('tabheader__item_active');
        });
    }

    function showTabContent(i = 0) {
        tabsContent[i].classList.add('show', 'fade');
        tabsContent[i].classList.remove('hide');
        tabs[i].classList.add('tabheader__item_active');
    }

    hideTabContent();
    showTabContent();

    tabsParent.addEventListener('click', (event) => {
        const target = event.target;
        if (target && target.classList.contains('tabheader__item')) {
            tabs.forEach((elem, i) => {
                if (target == elem) {
                    hideTabContent();
                    showTabContent(i);
                }
            });
        }
    });
    //timer

    const deadLine = '2021-09-25';

    function getTimeRemaining(endtime) {
        const total = Date.parse(endtime) - Date.parse(new Date());
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        const hours = Math.floor(total / (1000 * 60 * 60) % 24);
        const minutes = Math.floor(total / (1000 * 60) % 60);
        const seconds = Math.floor(total / 1000 % 60);

        return {
            total,
            days,
            hours,
            minutes,
            seconds
        };
    }

    setClock('.timer', deadLine);
    function setClock(selector, endtime) {
        const timer = document.querySelector(selector);
        const days = timer.querySelector('#days');
        const hours = timer.querySelector('#hours');
        const minutes = timer.querySelector('#minutes');
        const seconds = timer.querySelector('#seconds');
        const timeInterval = setInterval(updateTimer, 1000);

        function updateTimer() {
            const time = getTimeRemaining(endtime);

            days.innerHTML = time.days;
            hours.innerHTML = time.hours;
            minutes.innerHTML = time.minutes;
            seconds.innerHTML = time.seconds;

            if (time <= 0) {
                clearInterval(timeInterval);
            }
        }
    }

    //modal

    const modalTrigger = document.querySelectorAll('[data-modal]');
    const modal = document.querySelector('.modal');
    //const modalClose = modal.querySelector('[data-close]');

    function openModal() {
        modal.classList.add('show');
        modal.classList.remove('hide');
        document.body.style.overflow = 'hidden';
    }

    modalTrigger.forEach(btn => {
        btn.addEventListener('click', () => {
            openModal();
        });
    });

    function closeModal() {
        modal.classList.add('hide');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.getAttribute('data-close') == "") {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.code == "Escape" && modal.classList.contains('show')) {
            closeModal();
        }
    });

    //const modalTimer = setTimeout(openModal, 15000);

    function showModalByScroll() {
        if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
            openModal();
            window.removeEventListener("scroll", showModalByScroll);
        }
    }

    window.addEventListener('scroll', showModalByScroll);

    //menuItem

    class MenuItem{
        constructor(src, alt, subtitle, descr, total, parentSelector, ...classes){
            this.src = src;
            this.alt = alt;
            this.subtitle = subtitle; 
            this.descr = descr;
            this.total = total;
            this.parentSelector = document.querySelector(parentSelector);
            this.classes = classes;
        }
        render() {
            const elem = document.createElement('div');
            if (this.classes.length ===0 ){
                this.classes = "menu__item";
                elem.classList.add(this.classes);
            }else{
                this.classes.forEach(className => elem.classList.add(className));
            }
            elem.innerHTML = `
                <img src="${this.src}" alt="${this.alt}">
                <h3 class="menu__item-subtitle">${this.subtitle}</h3>
                <div class="menu__item-descr">${this.descr}</div>
                <div class="menu__item-divider"></div>
                <div class="menu__item-price">
                    <div class="menu__item-cost">Цена:</div>
                    <div class="menu__item-total"><span>${this.total}</span> грн/день</div>
                </div>`;
            this.parentSelector.append(elem);
        }
    }

    const getResource = async (url) => {
        const res = await fetch(url);
        
        if (!res.ok) {
            throw new Error(`Failed to fetch ${url}, status: ${res.status}`);
        }

        return await res.json();
    };

    getResource('http://localhost:3000/menu')
        .then(data => {
            data.forEach(({img, altimg, title, descr, price}) => {
                new MenuItem(img, altimg, title, descr, price, '.menu .container').render();
            });
        });

    // forms

    const forms = document.querySelectorAll('form');

    const message = {
        loading: 'img/form/spinner.svg',
        success: 'Спасибо! Скоро мы с вами свяжемся',
        failure: 'Что-то пошло не так...'
    };

    forms.forEach(item =>{
        bindPostData(item);
    });

    const postData = async (url, data) => {
        const res = await fetch(url, {
            method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
            body: data
        });

        return await res.json();
    };

    function bindPostData(form) {
        form.addEventListener('submit', (e) =>{
            e.preventDefault();

            const statusMessage = document.createElement('img');

            statusMessage.classList.add('status');

            statusMessage.src = message.loading;

            statusMessage.style.cssText = `
                display: block;
                margin: 0 auto;
            `;

            form.insertAdjacentElement('afterend', statusMessage);

            const request = new XMLHttpRequest();
            request.open('POST', 'server.php');
            request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            const formData = new FormData(form);
            
            const json = JSON.stringify(Object.fromEntries(formData.entries()));
            console.log(json);
            postData("http://localhost:3000/requests", json)
            .then((data) => {
                    console.log(data);
                    showThanksModal(message.success);
                    statusMessage.remove();
                    form.reset();
             })
             .catch(() => showThanksModal(message.failure))
             .finally(() => form.reset());

        });
    }

    function showThanksModal(message) {
        const prevModalDialog = document.querySelector('.modal__dialog');

        prevModalDialog.classList.add('hide');
        openModal();

        const thanksModal = document.createElement('div');
        thanksModal.classList.add('modal__dialog');
        thanksModal.innerHTML = `
        <div class="modal__content">
            <div class="modal__close" data-close>×</div>
            <div class="modal__title">${message}</div>
        </div>
        `;
        document.querySelector('.modal').append(thanksModal);
        setTimeout(() => {
            thanksModal.remove();
            prevModalDialog.classList.add('show');
            prevModalDialog.classList.remove('hide');
            closeModal();
        }, 3000);
    }

    //slider

    const prev = document.querySelector('.offer__slider-prev');
    const next = document.querySelector('.offer__slider-next');
    const sliderContent = document.querySelector('.offer__slider-wrapper');
    const currentIndex = document.querySelector('#current');

    let slideIndex = 1;
 
    prev.addEventListener('click', previousSlide);

    next.addEventListener('click', nextSlide);

    showSlides(slideIndex);

    function changeIndex(index) {
        currentIndex.innerHTML = `<span id="current">0${index}</span>`;
    }

    function nextSlide() {
        showSlides(slideIndex += 1);
        console.log(slideIndex);
        changeIndex(slideIndex);
    }

    function previousSlide() {
        showSlides(slideIndex -= 1);  
        changeIndex(slideIndex);
    }

    function currentSlide(n) {
        showSlides(slideIndex = n);
    }

    function showSlides(n) {
        const slides = document.querySelectorAll(".offer__slide");
        
        if (n > slides.length) {
        slideIndex = 1
        }
        if (n < 1) {
            slideIndex = slides.length
        }
    
        slides.forEach(elem =>{
            elem.classList.remove('active');
            elem.classList.add('hide');
            elem.classList.add('fade');
        });

        slides[slideIndex - 1].classList.remove('hide');
        slides[slideIndex - 1].classList.add('active');
    }
});

