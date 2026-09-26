const CACHE_NAME =
  "smart-switch-v1-7";

const APP_FILES = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json"
];


self.addEventListener(
  "install",
  (event) => {

    event.waitUntil(

      caches
        .open(CACHE_NAME)
        .then(
          (cache) =>
            cache.addAll(APP_FILES)
        )
        .catch(
          (error) =>
            console.warn(
              "Cache installation failed:",
              error
            )
        )

    );

  }
);


self.addEventListener(
  "activate",
  (event) => {

    event.waitUntil(

      caches
        .keys()
        .then(
          (keys) =>
            Promise.all(

              keys
                .filter(
                  (key) =>
                    key !== CACHE_NAME
                )
                .map(
                  (key) =>
                    caches.delete(key)
                )

            )
        )
        .catch(
          (error) =>
            console.warn(
              "Cache cleanup failed:",
              error
            )
        )

    );

  }
);


self.addEventListener(
  "fetch",
  (event) => {

    if (
      event.request.method !== "GET"
    ) {
      return;
    }


    event.respondWith(

      fetch(event.request)
        .then(
          (response) => {

            if (
              response &&
              response.status === 200
            ) {

              const copy =
                response.clone();

              caches
                .open(CACHE_NAME)
                .then(
                  (cache) =>
                    cache.put(
                      event.request,
                      copy
                    )
                )
                .catch(
                  () => {}
                );

            }

            return response;

          }
        )
        .catch(
          () =>
            caches.match(
              event.request
            )
        )

    );

  }
);