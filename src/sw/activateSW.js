export default function() {
	if (navigator.serviceWorker) {
		if (window.location.search.indexOf('sw') > -1) {
			navigator.serviceWorker.register('/sw.js')
				.then(reg => {
					console.log('Service worker registered');
					if (!navigator.serviceWorker.controller) {
						// page not loaded by service worker - latest already installed
						return;
					}
					/**
					 * TODO: implement SW lifecycle + management UI
					if (
						reg.waiting
					) {
					}
					if (
						reg.installing
					) {
					}
					reg.addEventListener('updatefound', () => {
					});
					*/
				})
				.catch(err => {
					console.log('Service worker failed to register');
				});
		} else {
			navigator.serviceWorker.getRegistrations()
				.then(registrations => {
					for(const registration of registrations) {
						registration.unregister();
					}
				});
		}
	}
}

