/**
 * CuePass - BookMyShow Frontend Clone & PWA Mobile Engine
 * Deep, authentic, mobile-app ready JavaScript
 * Engineered by Baalamuruga Sivam B S (Founder & CEO of Silicorps)
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 0. PWA SERVICE WORKER & APP INSTALL PROMPT
    // =========================================================
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(reg => console.log('[PWA] Service Worker registered successfully:', reg.scope))
                .catch(err => console.error('[PWA] Service Worker registration failed:', err));
        });
    }

    // PWA Install Prompt Banner
    let deferredPrompt;
    const pwaInstallBanner = document.getElementById('pwaInstallBanner');
    const pwaInstallBtn = document.getElementById('pwaInstallBtn');
    const pwaDismissBtn = document.getElementById('pwaDismissBtn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (pwaInstallBanner) pwaInstallBanner.style.display = 'flex';
    });

    if (pwaInstallBtn) {
        pwaInstallBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`[PWA] User response to install prompt: ${outcome}`);
                deferredPrompt = null;
                if (pwaInstallBanner) pwaInstallBanner.style.display = 'none';
            }
        });
    }

    if (pwaDismissBtn && pwaInstallBanner) {
        pwaDismissBtn.addEventListener('click', () => {
            pwaInstallBanner.style.display = 'none';
        });
    }

    // Offline / Online Status Detection
    const offlineBanner = document.getElementById('offlineBanner');
    function updateNetworkStatus() {
        if (!navigator.onLine) {
            if (offlineBanner) offlineBanner.style.display = 'flex';
        } else {
            if (offlineBanner) offlineBanner.style.display = 'none';
        }
    }

    window.addEventListener('offline', updateNetworkStatus);
    window.addEventListener('online', updateNetworkStatus);
    updateNetworkStatus();

    // Haptic feedback helper for mobile
    function triggerHaptic(duration = 15) {
        if ('vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    }


    // =========================================================
    // 1. HERO BANNER CAROUSEL SLIDER (With Touch Swipe)
    // =========================================================
    const carouselTrack = document.getElementById('carouselTrack');
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    let currentSlide = 0;
    const totalSlides = slides.length;
    let autoSlideInterval;

    function updateCarousel(index) {
        currentSlide = (index + totalSlides) % totalSlides;
        if (carouselTrack) {
            carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            updateCarousel(currentSlide + 1);
        }, 4500);
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => {
            triggerHaptic();
            stopAutoSlide();
            updateCarousel(currentSlide + 1);
            startAutoSlide();
        });

        prevBtn.addEventListener('click', () => {
            triggerHaptic();
            stopAutoSlide();
            updateCarousel(currentSlide - 1);
            startAutoSlide();
        });

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                triggerHaptic();
                stopAutoSlide();
                const index = parseInt(e.target.getAttribute('data-index'), 10);
                updateCarousel(index);
                startAutoSlide();
            });
        });

        startAutoSlide();
    }

    // Touch Swipe support for Hero Carousel
    let touchStartX = 0;
    let touchEndX = 0;

    if (carouselTrack) {
        carouselTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carouselTrack.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            if (touchStartX - touchEndX > 50) {
                // Swipe Left -> Next
                triggerHaptic();
                stopAutoSlide();
                updateCarousel(currentSlide + 1);
                startAutoSlide();
            } else if (touchEndX - touchStartX > 50) {
                // Swipe Right -> Prev
                triggerHaptic();
                stopAutoSlide();
                updateCarousel(currentSlide - 1);
                startAutoSlide();
            }
        }
    }


    // =========================================================
    // 2. HORIZONTAL MOVIE CAROUSEL SCROLL
    // =========================================================
    const movieGrid = document.getElementById('movieGrid');
    const scrollLeftBtn = document.getElementById('movieScrollLeft');
    const scrollRightBtn = document.getElementById('movieScrollRight');

    if (movieGrid && scrollLeftBtn && scrollRightBtn) {
        scrollLeftBtn.addEventListener('click', () => {
            triggerHaptic();
            movieGrid.scrollBy({ left: -480, behavior: 'smooth' });
        });

        scrollRightBtn.addEventListener('click', () => {
            triggerHaptic();
            movieGrid.scrollBy({ left: 480, behavior: 'smooth' });
        });
    }


    // =========================================================
    // 3. SEARCH BOX WITH AUTOCOMPLETE & REAL-TIME FILTER
    // =========================================================
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const searchDropdown = document.getElementById('searchDropdown');
    const movieCards = document.querySelectorAll('.movie-card');
    const suggestionItems = document.querySelectorAll('.suggestion-item');

    function filterMovies(query) {
        const q = query.toLowerCase().trim();
        movieCards.forEach(card => {
            const title = (card.getAttribute('data-title') || '').toLowerCase();
            const genre = (card.getAttribute('data-genre') || '').toLowerCase();
            const lang = (card.getAttribute('data-lang') || '').toLowerCase();

            if (title.includes(q) || genre.includes(q) || lang.includes(q)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            if (searchDropdown) searchDropdown.classList.add('active');
        });

        searchInput.addEventListener('input', (e) => {
            const val = e.target.value;
            if (clearSearchBtn) clearSearchBtn.style.display = val ? 'block' : 'none';
            filterMovies(val);
        });

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                clearSearchBtn.style.display = 'none';
                filterMovies('');
            });
        }

        suggestionItems.forEach(item => {
            item.addEventListener('click', () => {
                triggerHaptic();
                const term = item.getAttribute('data-search');
                if (term) {
                    searchInput.value = term;
                    if (clearSearchBtn) clearSearchBtn.style.display = 'block';
                    filterMovies(term);
                }
                if (searchDropdown) searchDropdown.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box-wrapper')) {
                if (searchDropdown) searchDropdown.classList.remove('active');
            }
        });
    }


    // =========================================================
    // 4. LANGUAGE & GENRE FILTER SYSTEM
    // =========================================================
    const filterChips = document.querySelectorAll('.filter-chip');
    const genreChips = document.querySelectorAll('.genre-chip');

    let activeLang = 'all';
    let activeGenre = 'all';

    function applyFilters() {
        movieCards.forEach(card => {
            const lang = (card.getAttribute('data-lang') || '').toLowerCase();
            const genre = (card.getAttribute('data-genre') || '').toLowerCase();

            const matchLang = activeLang === 'all' || lang.includes(activeLang.toLowerCase());
            const matchGenre = activeGenre === 'all' || genre.includes(activeGenre.toLowerCase());

            if (matchLang && matchGenre) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            triggerHaptic();
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeLang = chip.getAttribute('data-filter') || 'all';
            applyFilters();
        });
    });

    genreChips.forEach(chip => {
        chip.addEventListener('click', () => {
            triggerHaptic();
            genreChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeGenre = chip.getAttribute('data-genre') || 'all';
            applyFilters();
        });
    });


    // =========================================================
    // 5. CITY PICKER MODAL
    // =========================================================
    const citySelectorBtn = document.getElementById('citySelectorBtn');
    const cityModal = document.getElementById('cityModal');
    const closeCityModal = document.getElementById('closeCityModal');
    const selectedCityLabel = document.getElementById('selectedCity');
    const cityItems = document.querySelectorAll('.city-item');
    const citySearchInput = document.getElementById('citySearchInput');

    if (citySelectorBtn && cityModal) {
        citySelectorBtn.addEventListener('click', () => {
            triggerHaptic();
            cityModal.classList.add('active');
        });

        closeCityModal.addEventListener('click', () => {
            cityModal.classList.remove('active');
        });

        cityItems.forEach(item => {
            item.addEventListener('click', () => {
                triggerHaptic();
                const city = item.getAttribute('data-city');
                if (selectedCityLabel && city) {
                    selectedCityLabel.textContent = city;
                }
                cityModal.classList.remove('active');
            });
        });

        if (citySearchInput) {
            citySearchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                cityItems.forEach(item => {
                    const cityName = (item.getAttribute('data-city') || '').toLowerCase();
                    item.style.display = cityName.includes(query) ? 'flex' : 'none';
                });
            });
        }
    }


    // =========================================================
    // 6. SIGN IN / AUTH MODAL
    // =========================================================
    const signInBtn = document.getElementById('signInBtn');
    const signInModal = document.getElementById('signInModal');
    const closeSignInModal = document.getElementById('closeSignInModal');
    const drawerLoginBtn = document.getElementById('drawerLoginBtn');
    const continueAuthBtn = document.getElementById('continueAuthBtn');
    const mobileNumberInput = document.getElementById('mobileNumberInput');

    function openSignInModal() {
        triggerHaptic();
        if (signInModal) signInModal.classList.add('active');
        if (sideDrawer) sideDrawer.classList.remove('open');
        if (drawerOverlay) drawerOverlay.classList.remove('open');
    }

    if (signInBtn) signInBtn.addEventListener('click', openSignInModal);
    if (drawerLoginBtn) drawerLoginBtn.addEventListener('click', openSignInModal);

    if (closeSignInModal) {
        closeSignInModal.addEventListener('click', () => {
            signInModal.classList.remove('active');
        });
    }

    if (continueAuthBtn && mobileNumberInput) {
        continueAuthBtn.addEventListener('click', () => {
            triggerHaptic();
            const val = mobileNumberInput.value.trim();
            if (val.length < 10) {
                alert('Please enter a valid 10-digit mobile number.');
            } else {
                alert(`OTP sent successfully to +91 ${val}!`);
                signInModal.classList.remove('active');
            }
        });
    }


    // =========================================================
    // 7. HAMBURGER SIDE DRAWER
    // =========================================================
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const sideDrawer = document.getElementById('sideDrawer');
    const drawerCloseBtn = document.getElementById('drawerCloseBtn');
    const drawerOverlay = document.getElementById('drawerOverlay');

    function openDrawer() {
        triggerHaptic();
        sideDrawer.classList.add('open');
        drawerOverlay.classList.add('open');
    }

    function closeDrawer() {
        sideDrawer.classList.remove('open');
        drawerOverlay.classList.remove('open');
    }

    if (menuToggleBtn && sideDrawer && drawerOverlay) {
        menuToggleBtn.addEventListener('click', openDrawer);
        drawerCloseBtn.addEventListener('click', closeDrawer);
        drawerOverlay.addEventListener('click', closeDrawer);
    }


    // =========================================================
    // 8. DEEP CINEMA SEAT SELECTION & BOOKING ENGINE
    // =========================================================
    const bookingModal = document.getElementById('bookingModal');
    const closeBookingModal = document.getElementById('closeBookingModal');
    const bookingMovieTitle = document.getElementById('bookingMovieTitle');
    const bookingMovieCensor = document.getElementById('bookingMovieCensor');
    const bookingMovieDuration = document.getElementById('bookingMovieDuration');
    const bookingMovieLang = document.getElementById('bookingMovieLang');

    const seats = document.querySelectorAll('.seat:not(.occupied)');
    const selectedSeatsLabel = document.getElementById('selectedSeatsLabel');
    const checkoutTotalAmount = document.getElementById('checkoutTotalAmount');
    const foodAddBtns = document.querySelectorAll('.btn-add-food');
    const applyPromoBtn = document.getElementById('applyPromoBtn');
    const promoCodeInput = document.getElementById('promoCodeInput');
    const promoMessage = document.getElementById('promoMessage');
    const proceedToPayBtn = document.getElementById('proceedToPayBtn');
    const datePills = document.querySelectorAll('.date-pill');
    const timeSlotBtns = document.querySelectorAll('.time-slot-btn');

    // Confirmed Ticket Receipt Modal elements
    const ticketPassModal = document.getElementById('ticketPassModal');
    const closeTicketPassModal = document.getElementById('closeTicketPassModal');
    const doneTicketBtn = document.getElementById('doneTicketBtn');
    const receiptBookingId = document.getElementById('receiptBookingId');
    const receiptMovieTitle = document.getElementById('receiptMovieTitle');
    const receiptSeats = document.getElementById('receiptSeats');
    const receiptTotalPaid = document.getElementById('receiptTotalPaid');

    let selectedSeatsList = ['A5', 'A6'];
    let foodTotal = 0;
    let discountAmount = 0;
    let currentSelectedMovie = 'Spider-Man: Brand New Day';

    const seatPricing = {
        'A': 350, // VIP Recliner
        'B': 220, // Premium
        'C': 220, // Premium
        'D': 160  // Executive
    };

    function calculateTotal() {
        let seatTotal = 0;
        selectedSeatsList.forEach(seatCode => {
            const row = seatCode.charAt(0);
            seatTotal += seatPricing[row] || 220;
        });

        const grossTotal = seatTotal + foodTotal;
        const netTotal = Math.max(0, grossTotal - discountAmount);

        if (selectedSeatsLabel) {
            selectedSeatsLabel.textContent = selectedSeatsList.length > 0 ? selectedSeatsList.join(', ') : 'None';
        }

        if (checkoutTotalAmount) {
            checkoutTotalAmount.textContent = `₹${netTotal}`;
        }

        return netTotal;
    }

    // Seat Click Selection
    seats.forEach(seat => {
        seat.addEventListener('click', () => {
            triggerHaptic(20);
            const seatCode = seat.getAttribute('data-seat');
            if (seat.classList.contains('selected')) {
                seat.classList.remove('selected');
                selectedSeatsList = selectedSeatsList.filter(s => s !== seatCode);
            } else {
                if (selectedSeatsList.length >= 8) {
                    alert('You can select a maximum of 8 seats per booking.');
                    return;
                }
                seat.classList.add('selected');
                selectedSeatsList.push(seatCode);
            }
            calculateTotal();
        });
    });

    // Date & Showtime selector
    datePills.forEach(pill => {
        pill.addEventListener('click', () => {
            triggerHaptic();
            datePills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        });
    });

    timeSlotBtns.forEach(slot => {
        slot.addEventListener('click', () => {
            triggerHaptic();
            timeSlotBtns.forEach(s => s.classList.remove('active'));
            slot.classList.add('active');
        });
    });

    // Food add-ons
    foodAddBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHaptic();
            const price = parseInt(btn.getAttribute('data-price'), 10) || 0;
            if (btn.classList.contains('added')) {
                btn.classList.remove('added');
                btn.textContent = '+ ADD';
                foodTotal -= price;
            } else {
                btn.classList.add('added');
                btn.textContent = '✓ ADDED';
                foodTotal += price;
            }
            calculateTotal();
        });
    });

    // Promo Code logic
    if (applyPromoBtn && promoCodeInput && promoMessage) {
        applyPromoBtn.addEventListener('click', () => {
            triggerHaptic();
            const code = promoCodeInput.value.trim().toUpperCase();
            if (code === 'CUEPASS50') {
                discountAmount = 150;
                promoMessage.textContent = '🎉 Coupon Applied! ₹150 Instant Discount.';
                promoMessage.className = 'promo-msg success';
            } else if (code === 'CUEPASS150') {
                discountAmount = 150;
                promoMessage.textContent = '🎉 Coupon Applied! ₹150 Flat Discount.';
                promoMessage.className = 'promo-msg success';
            } else if (code === 'BMSFIRST') {
                discountAmount = 100;
                promoMessage.textContent = '🎉 Welcome Offer Applied! ₹100 Off.';
                promoMessage.className = 'promo-msg success';
            } else {
                discountAmount = 0;
                promoMessage.textContent = 'Invalid promo code. Try: CUEPASS50';
                promoMessage.className = 'promo-msg error';
            }
            calculateTotal();
        });
    }

    // Open booking modal on card click
    function openBookingModalForMovie(title, censor, duration, lang) {
        triggerHaptic();
        currentSelectedMovie = title;
        if (bookingMovieTitle) bookingMovieTitle.textContent = title;
        if (bookingMovieCensor) bookingMovieCensor.textContent = censor || 'UA';
        if (bookingMovieDuration) bookingMovieDuration.textContent = duration || '2h 25m';
        if (bookingMovieLang) bookingMovieLang.textContent = lang || 'Tamil, English';

        calculateTotal();
        if (bookingModal) bookingModal.classList.add('active');
    }

    movieCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.getAttribute('data-title') || 'Movie';
            const censor = card.getAttribute('data-censor') || 'UA';
            const duration = card.getAttribute('data-duration') || '2h 25m';
            const lang = card.getAttribute('data-lang') || 'Tamil, Hindi';
            openBookingModalForMovie(title, censor, duration, lang);
        });
    });

    // Banner Book Now triggers
    document.querySelectorAll('.book-movie-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const title = btn.getAttribute('data-title') || 'Spider-Man: Brand New Day';
            openBookingModalForMovie(title, 'UA 13+', '2h 42m', 'English, Tamil, Hindi');
        });
    });

    if (closeBookingModal && bookingModal) {
        closeBookingModal.addEventListener('click', () => {
            bookingModal.classList.remove('active');
        });
    }

    // Checkout & Save Ticket Pass to LocalStorage for Offline Access
    if (proceedToPayBtn) {
        proceedToPayBtn.addEventListener('click', () => {
            if (selectedSeatsList.length === 0) {
                alert('Please select at least 1 seat to proceed.');
                return;
            }

            triggerHaptic(50);
            const finalAmount = calculateTotal();
            const randomId = `#CUE-${Math.floor(100000 + Math.random() * 900000)}`;

            // Save to LocalStorage
            const newOrder = {
                id: randomId,
                movie: currentSelectedMovie,
                seats: selectedSeatsList.join(', '),
                amount: `₹${finalAmount}`,
                cinema: 'PVR: Express Avenue, Royapettah',
                screen: 'Audi 3 (4K Laser Dolby Atmos)',
                dateTime: 'Today | 02:15 PM',
                timestamp: new Date().toISOString()
            };

            const existingOrders = JSON.parse(localStorage.getItem('cuepass_orders') || '[]');
            existingOrders.unshift(newOrder);
            localStorage.setItem('cuepass_orders', JSON.stringify(existingOrders));

            // Populate receipt pass
            if (receiptBookingId) receiptBookingId.textContent = randomId;
            if (receiptMovieTitle) receiptMovieTitle.textContent = currentSelectedMovie;
            if (receiptSeats) receiptSeats.textContent = selectedSeatsList.join(', ');
            if (receiptTotalPaid) receiptTotalPaid.textContent = `₹${finalAmount}`;

            if (bookingModal) bookingModal.classList.remove('active');
            if (ticketPassModal) ticketPassModal.classList.add('active');
        });
    }

    if (closeTicketPassModal) {
        closeTicketPassModal.addEventListener('click', () => {
            if (ticketPassModal) ticketPassModal.classList.remove('active');
        });
    }

    if (doneTicketBtn) {
        doneTicketBtn.addEventListener('click', () => {
            if (ticketPassModal) ticketPassModal.classList.remove('active');
        });
    }

    // =========================================================
    // 9. OFFLINE SAVED ORDERS / PASSES VIEWER
    // =========================================================
    const myOrdersModal = document.getElementById('myOrdersModal');
    const closeOrdersModal = document.getElementById('closeOrdersModal');
    const ordersListContainer = document.getElementById('ordersListContainer');
    const drawerOrdersBtn = document.getElementById('drawerOrdersBtn');
    const bnavOrders = document.getElementById('bnavOrders');

    function renderSavedOrders() {
        const savedOrders = JSON.parse(localStorage.getItem('cuepass_orders') || '[]');
        if (!ordersListContainer) return;

        if (savedOrders.length === 0) {
            ordersListContainer.innerHTML = `
                <div class="no-orders-msg">
                    <i class="fas fa-ticket-alt" style="font-size: 36px; margin-bottom: 10px; display: block; color: #cbd5e1;"></i>
                    <p>No booked passes yet. Book a movie to save your offline entry tickets here!</p>
                </div>
            `;
            return;
        }

        ordersListContainer.innerHTML = savedOrders.map(order => `
            <div class="order-pass-card">
                <div class="order-pass-info">
                    <strong>${order.movie}</strong>
                    <p><i class="fas fa-map-marker-alt"></i> ${order.cinema}</p>
                    <p><i class="far fa-clock"></i> ${order.dateTime} • Seats: <strong>${order.seats}</strong></p>
                    <p><i class="fas fa-barcode"></i> Booking ID: <strong>${order.id}</strong></p>
                </div>
                <button class="btn-view-pass" onclick="openPassDetails('${order.id}')">View Pass</button>
            </div>
        `).join('');
    }

    window.openPassDetails = (id) => {
        const savedOrders = JSON.parse(localStorage.getItem('cuepass_orders') || '[]');
        const order = savedOrders.find(o => o.id === id);
        if (order) {
            if (receiptBookingId) receiptBookingId.textContent = order.id;
            if (receiptMovieTitle) receiptMovieTitle.textContent = order.movie;
            if (receiptSeats) receiptSeats.textContent = order.seats;
            if (receiptTotalPaid) receiptTotalPaid.textContent = order.amount;

            if (myOrdersModal) myOrdersModal.classList.remove('active');
            if (ticketPassModal) ticketPassModal.classList.add('active');
        }
    };

    function openOrdersModal() {
        triggerHaptic();
        renderSavedOrders();
        if (myOrdersModal) myOrdersModal.classList.add('active');
        if (sideDrawer) sideDrawer.classList.remove('open');
        if (drawerOverlay) drawerOverlay.classList.remove('open');
    }

    if (drawerOrdersBtn) drawerOrdersBtn.addEventListener('click', openOrdersModal);
    if (bnavOrders) bnavOrders.addEventListener('click', openOrdersModal);

    if (closeOrdersModal && myOrdersModal) {
        closeOrdersModal.addEventListener('click', () => {
            myOrdersModal.classList.remove('active');
        });
    }

    // Remind Me Buttons
    document.querySelectorAll('.btn-remind').forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHaptic();
            btn.classList.toggle('active');
            if (btn.classList.contains('active')) {
                btn.innerHTML = '<i class="fas fa-check"></i> Reminder Set!';
            } else {
                btn.innerHTML = '<i class="far fa-bell"></i> Remind Me';
            }
        });
    });

    // Mobile Bottom Navigation Switching
    const bnavItems = document.querySelectorAll('.bnav-item');
    bnavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            triggerHaptic();
            bnavItems.forEach(b => b.classList.remove('active'));
            item.classList.add('active');

            if (item.id === 'bnavSearch') {
                e.preventDefault();
                if (searchInput) {
                    searchInput.focus();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else if (item.id === 'bnavProfile') {
                e.preventDefault();
                openSignInModal();
            }
        });
    });

    // Close any modal on clicking outside card
    window.addEventListener('click', (e) => {
        if (e.target === cityModal) cityModal.classList.remove('active');
        if (e.target === signInModal) signInModal.classList.remove('active');
        if (e.target === bookingModal) bookingModal.classList.remove('active');
        if (e.target === ticketPassModal) ticketPassModal.classList.remove('active');
        if (e.target === myOrdersModal) myOrdersModal.classList.remove('active');
    });

});
