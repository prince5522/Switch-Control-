(() => {

  "use strict";

  /*
   * SMART SWITCH v1.7
   * Crash-resistant frontend foundation
   */

  const $ = (id) => document.getElementById(id);


  /* -----------------------------
     SAFE STORAGE
  ----------------------------- */

  function safeRead(key, fallback) {

    try {

      const value = localStorage.getItem(key);

      if (!value) {
        return fallback;
      }

      const parsed = JSON.parse(value);

      return parsed;

    } catch (error) {

      console.warn("Storage recovery:", error);

      try {
        localStorage.removeItem(key);
      } catch (_) {}

      return fallback;
    }
  }


  function safeWrite(key, value) {

    try {

      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

      return true;

    } catch (error) {

      console.warn("Storage write failed:", error);

      showToast(
        "Storage is unavailable. Your app is still running."
      );

      return false;
    }
  }


  /* -----------------------------
     APPLICATION STATE
  ----------------------------- */

  let currentUser =
    safeRead("smart_switch_user", null);

  let devices =
    safeRead("smart_switch_devices", []);

  let users =
    safeRead("smart_switch_users", []);

  if (!Array.isArray(devices)) {
    devices = [];
  }

  if (!Array.isArray(users)) {
    users = [];
  }


  /* -----------------------------
     TOAST
  ----------------------------- */

  function showToast(message) {

    try {

      const toast = $("toast");

      if (!toast) {
        return;
      }

      toast.textContent = message;
      toast.classList.add("show");

      setTimeout(() => {

        toast.classList.remove("show");

      }, 3000);

    } catch (error) {

      console.warn("Toast error:", error);

    }
  }


  /* -----------------------------
     AUTH TABS
  ----------------------------- */

  function showLogin() {

    $("loginTab").classList.add("active");
    $("signupTab").classList.remove("active");

    $("loginForm").classList.remove("hidden");
    $("signupForm").classList.add("hidden");

    $("authMessage").textContent = "";
  }


  function showSignup() {

    $("signupTab").classList.add("active");
    $("loginTab").classList.remove("active");

    $("signupForm").classList.remove("hidden");
    $("loginForm").classList.add("hidden");

    $("authMessage").textContent = "";
  }


  $("loginTab").addEventListener(
    "click",
    showLogin
  );

  $("signupTab").addEventListener(
    "click",
    showSignup
  );


  /* -----------------------------
     CREATE ACCOUNT
  ----------------------------- */

  $("signupForm").addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      try {

        const username =
          $("signupUsername").value.trim();

        const name =
          $("signupName").value.trim();

        const phone =
          $("signupPhone").value.trim();

        const email =
          $("signupEmail").value.trim().toLowerCase();

        const password =
          $("signupPassword").value;

        const confirm =
          $("signupConfirm").value;


        if (!username || !name || !phone || !email) {

          $("authMessage").textContent =
            "Please complete all fields.";

          return;
        }


        if (password.length < 8) {

          $("authMessage").textContent =
            "Password must contain at least 8 characters.";

          return;
        }


        if (password !== confirm) {

          $("authMessage").textContent =
            "Passwords do not match.";

          return;
        }


        const exists =
          users.some(
            (user) =>
              user.email === email ||
              user.username === username
          );


        if (exists) {

          $("authMessage").textContent =
            "That username or email is already registered.";

          return;
        }


        const newUser = {

          id:
            createId(),

          username,
          name,
          phone,
          email,

          /*
           * DEVELOPMENT ONLY.
           *
           * When Supabase Auth is connected,
           * passwords must NOT be stored here.
           */

          password,

          role:
            users.length === 0
              ? "admin"
              : "user",

          active: true,

          createdAt:
            new Date().toISOString()
        };


        users.push(newUser);

        safeWrite(
          "smart_switch_users",
          users
        );


        $("signupForm").reset();

        $("loginEmail").value = email;

        $("authMessage").textContent =
          "Account created successfully. You can now log in.";

        showLogin();

      } catch (error) {

        recoverFromError(error);

      }

    }
  );


  /* -----------------------------
     LOGIN
  ----------------------------- */

  $("loginForm").addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      try {

        const email =
          $("loginEmail").value
            .trim()
            .toLowerCase();

        const password =
          $("loginPassword").value;


        const user =
          users.find(
            (item) =>
              item.email === email &&
              item.password === password
          );


        if (!user) {

          $("authMessage").textContent =
            "Email or password is incorrect.";

          return;
        }


        if (user.active === false) {

          $("authMessage").textContent =
            "Your account has been disabled by the administrator.";

          return;
        }


        currentUser = {

          id: user.id,
          username: user.username,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role

        };


        safeWrite(
          "smart_switch_user",
          currentUser
        );


        openApplication();

      } catch (error) {

        recoverFromError(error);

      }

    }
  );


  /* -----------------------------
     PASSWORD VISIBILITY
  ----------------------------- */

  $("showLoginPassword").addEventListener(
    "click",
    () => {

      const field =
        $("loginPassword");

      field.type =
        field.type === "password"
          ? "text"
          : "password";
    }
  );


  $("forgotPassword").addEventListener(
    "click",
    () => {

      showToast(
        "Password reset will be connected to the online authentication system."
      );

    }
  );


  /* -----------------------------
     OPEN APP
  ----------------------------- */

  function openApplication() {

    $("authScreen").classList.add("hidden");

    $("appScreen").classList.remove("hidden");

    updateProfile();

    renderDevices();

    updateAdminControls();

  }


  function updateProfile() {

    if (!currentUser) {
      return;
    }

    $("welcomeName").textContent =
      currentUser.name;

    $("dashboardName").textContent =
      currentUser.name;

    $("dashboardUsername").textContent =
      "@" + currentUser.username;
  }


  /* -----------------------------
     DASHBOARD
  ----------------------------- */

  function openDashboard() {

    $("sideDashboard")
      .classList.add("open");

    $("dashboardOverlay")
      .classList.remove("hidden");
  }


  function closeDashboard() {

    $("sideDashboard")
      .classList.remove("open");

    $("dashboardOverlay")
      .classList.add("hidden");
  }


  $("menuButton")
    .addEventListener(
      "click",
      openDashboard
    );


  $("closeDashboard")
    .addEventListener(
      "click",
      closeDashboard
    );


  $("dashboardOverlay")
    .addEventListener(
      "click",
      closeDashboard
    );


  /* -----------------------------
     DEVICE MANAGEMENT
  ----------------------------- */

  $("deviceForm").addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      try {

        const device = {

          id: createId(),

          name:
            $("deviceName")
              .value
              .trim(),

          type:
            $("deviceType")
              .value,

          host:
            $("deviceHost")
              .value
              .trim(),

          port:
            Number(
              $("devicePort")
                .value
            ),

          protocol:
            $("deviceProtocol")
              .value,

          state:
            "OFF",

          createdAt:
            new Date().toISOString()

        };


        if (!device.name) {

          showToast(
            "Enter a device name."
          );

          return;
        }


        if (
          device.port < 1 ||
          device.port > 65535
        ) {

          showToast(
            "Enter a valid port."
          );

          return;
        }


        devices.push(device);

        safeWrite(
          "smart_switch_devices",
          devices
        );


        event.target.reset();

        $("devicePort").value = 80;

        renderDevices();

        showToast(
          "Device added successfully."
        );

      } catch (error) {

        recoverFromError(error);

      }

    }
  );


  function renderDevices() {

    const list =
      $("deviceList");

    if (!list) {
      return;
    }


    $("deviceCount").textContent =
      devices.length;


    if (devices.length === 0) {

      list.innerHTML = `
        <div class="device">
          <div class="device-icon">⚡</div>

          <div class="device-info">
            <strong>No devices yet</strong>
            <small>Add your first controller below.</small>
          </div>
        </div>
      `;

      return;
    }


    list.innerHTML =
      devices
        .map(
          (device, index) => `

          <div class="device">

            <div class="device-icon">
              ⚡
            </div>

            <div class="device-info">

              <strong>
                ${escapeHTML(device.name)}
              </strong>

              <small>
                ${escapeHTML(device.type)}
              </small>

              <small>
                ${escapeHTML(device.host || "No IP")}
                :${device.port}
                · ${escapeHTML(device.protocol)}
              </small>

              <small>
                Status:
                <strong>
                  ${device.state}
                </strong>
              </small>

            </div>

            <button
              class="device-action"
              data-device-index="${index}"
            >
              ${
                device.state === "ON"
                  ? "Turn OFF"
                  : "Turn ON"
              }
            </button>

          </div>
        `
        )
        .join("");


    document
      .querySelectorAll(
        "[data-device-index]"
      )
      .forEach(
        (button) => {

          button.addEventListener(
            "click",
            () => {

              const index =
                Number(
                  button.dataset.deviceIndex
                );

              toggleDevice(index);

            }
          );

        }
      );
  }


  async function toggleDevice(index) {

    try {

      const device =
        devices[index];

      if (!device) {
        return;
      }


      const newState =
        device.state === "ON"
          ? "OFF"
          : "ON";


      /*
       * Update interface immediately.
       * This keeps the app responsive.
       */

      device.state =
        newState;


      safeWrite(
        "smart_switch_devices",
        devices
      );


      renderDevices();


      /*
       * Tell backend.
       */

      try {

        const response =
          await fetch(
            "/api/device/command",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  deviceId: device.id,
                  command: newState
                })
            }
          );


        if (!response.ok) {

          throw new Error(
            "Server rejected command"
          );
        }


        showToast(
          `${device.name} is ${newState}.`
        );

      } catch (networkError) {

        /*
         * Network failure must NOT crash app.
         */

        showToast(
          "Saved locally. Device server unavailable."
        );

      }

    } catch (error) {

      recoverFromError(error);

    }
  }


  /* -----------------------------
     AI ASSISTANT
  ----------------------------- */

  $("assistantForm")
    .addEventListener(
      "submit",
      (event) => {

        event.preventDefault();

        try {

          const input =
            $("assistantInput")
              .value
              .trim();

          if (!input) {
            return;
          }


          processAssistantCommand(
            input
          );


          $("assistantInput").value = "";


        } catch (error) {

          recoverFromError(error);

        }

      }
    );


  function processAssistantCommand(
    command
  ) {

    const text =
      command.toLowerCase();


    if (
      text.includes("how are you")
    ) {

      $("assistantReply").textContent =
        "I'm doing great 😊. I'm here to help you control Smart Switch.";

      return;
    }


    if (
      text.includes("hello") ||
      text.includes("hi")
    ) {

      $("assistantReply").textContent =
        `Hey ${currentUser?.name || "there"}! 👋 How can I help?`;

      return;
    }


    const device =
      devices.find(
        (item) =>
          text.includes(
            item.name.toLowerCase()
          )
      );


    if (
      device &&
      (
        text.includes("turn on") ||
        text.includes("switch on")
      )
    ) {

      device.state = "ON";

      saveDevices();

      renderDevices();

      $("assistantReply").textContent =
        `Done, ${currentUser.name} — ${device.name} is ON.`;

      return;
    }


    if (
      device &&
      (
        text.includes("turn off") ||
        text.includes("switch off")
      )
    ) {

      device.state = "OFF";

      saveDevices();

      renderDevices();

      $("assistantReply").textContent =
        `Done, ${currentUser.name} — ${device.name} is OFF.`;

      return;
    }


    $("assistantReply").textContent =
      "I'm not sure what you mean yet. You can ask me about Smart Switch or say something like “turn on Living Room.”";
  }


  /* -----------------------------
     VOICE
  ----------------------------- */

  $("voiceButton")
    .addEventListener(
      "click",
      startVoice
    );


  function startVoice() {

    try {

      const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


      if (!Recognition) {

        showToast(
          "Voice control is not supported on this browser."
        );

        return;
      }


      const recognition =
        new Recognition();


      recognition.lang = "en-KE";

      recognition.interimResults =
        false;


      recognition.onresult =
        (event) => {

          const spoken =
            event
              .results[0][0]
              .transcript;

          $("assistantInput").value =
            spoken;

          $("assistantForm")
            .requestSubmit();

        };


      recognition.onerror =
        () => {

          showToast(
            "I couldn't hear that. Please try again."
          );

        };


      recognition.start();

    } catch (error) {

      recoverFromError(error);

    }
  }


  /* -----------------------------
     ADMIN
  ----------------------------- */

  function updateAdminControls() {

    const isAdmin =
      currentUser &&
      currentUser.role === "admin";


    if (isAdmin) {

      $("adminButton")
        .classList.remove("hidden");

      $("inviteButton")
        .classList.remove("hidden");

    } else {

      $("adminButton")
        .classList.add("hidden");

      $("inviteButton")
        .classList.add("hidden");
    }
  }


  $("adminButton")
    .addEventListener(
      "click",
      () => {

        if (
          !currentUser ||
          currentUser.role !== "admin"
        ) {

          showToast(
            "Administrator access required."
          );

          return;
        }


        closeDashboard();

        $("adminSection")
          .classList.remove("hidden");

        renderUsers();

        $("adminSection")
          .scrollIntoView({
            behavior: "smooth"
          });

      }
    );


  function renderUsers() {

    const list =
      $("userList");

    if (!list) {
      return;
    }


    list.innerHTML =
      users
        .map(
          (user) => `

          <div class="device">

            <div class="device-icon">
              👤
            </div>

            <div class="device-info">

              <strong>
                ${escapeHTML(user.name)}
              </strong>

              <small>
                @${escapeHTML(user.username)}
              </small>

              <small>
                ${escapeHTML(user.email)}
              </small>

              <small>
                ${escapeHTML(user.phone)}
              </small>

              <small>
                Role:
                ${escapeHTML(user.role)}
              </small>

            </div>

          </div>
        `
        )
        .join("");
  }


  /* -----------------------------
     INVITATIONS
  ----------------------------- */

  function openInvite() {

    if (
      !currentUser ||
      currentUser.role !== "admin"
    ) {

      showToast(
        "Administrator access required."
      );

      return;
    }


    $("inviteModal")
      .classList.remove("hidden");

  }


  function closeInvite() {

    $("inviteModal")
      .classList.add("hidden");

  }


  $("inviteButton")
    .addEventListener(
      "click",
      () => {

        closeDashboard();

        openInvite();

      }
    );


  $("adminInviteButton")
    .addEventListener(
      "click",
      openInvite
    );


  $("closeInvite")
    .addEventListener(
      "click",
      closeInvite
    );


  $("inviteForm")
    .addEventListener(
      "submit",
      (event) => {

        event.preventDefault();

        try {

          const email =
            $("inviteEmail")
              .value
              .trim()
              .toLowerCase();


          const token =
            createId() +
            createId();


          const invitationLink =
            window.location.origin +
            "/invite/" +
            token;


          showToast(
            "Invitation created."
          );


          /*
           * Production version will send this
           * through the online backend.
           */

          $("inviteForm").reset();

          closeInvite();

          setTimeout(
            () => {

              window.prompt(
                "Copy this invitation link:",
                invitationLink
              );

            },
            200
          );


        } catch (error) {

          recoverFromError(error);

        }

      }
    );


  /* -----------------------------
     AI TUTORIAL
  ----------------------------- */

  const tutorialSteps = [

    {
      title: "Welcome to Smart Switch",
      text:
        "Hi! I'm your Smart Switch guide. I'll show you how the important parts of the app work."
    },

    {
      title: "Your Dashboard",
      text:
        "Press the ☰ button at the top. Your dashboard slides in from the side. Press outside it or × to slide it back."
    },

    {
      title: "Add a Device",
      text:
        "Go to Add Device and enter the name and network address of your authorized ESP8266, ESP-01, ESP32 or compatible controller."
    },

    {
      title: "IP Address",
      text:
        "The IP address identifies your device on the network. The device must also provide a compatible control API or protocol."
    },

    {
      title: "Voice Control",
      text:
        "Press the microphone button and speak a command such as: turn on Living Room."
    },

    {
      title: "Stay Safe",
      text:
        "Never expose an unsecured device-control endpoint directly to the public internet. Use authentication and a secure backend."
    }

  ];


  let tutorialIndex = 0;


  function openTutorial() {

    tutorialIndex = 0;

    $("tutorialModal")
      .classList.remove("hidden");

    updateTutorial();

  }


  function updateTutorial() {

    const step =
      tutorialSteps[tutorialIndex];

    $("tutorialTitle")
      .textContent = step.title;

    $("tutorialText")
      .textContent = step.text;

    $("tutorialBack")
      .disabled =
        tutorialIndex === 0;

    $("tutorialNext")
      .textContent =
        tutorialIndex ===
        tutorialSteps.length - 1
          ? "Finish"
          : "Next";

  }


  $("tutorialButton")
    .addEventListener(
      "click",
      () => {

        closeDashboard();

        openTutorial();

      }
    );


  $("tutorialNext")
    .addEventListener(
      "click",
      () => {

        if (
          tutorialIndex <
          tutorialSteps.length - 1
        ) {

          tutorialIndex++;

          updateTutorial();

        } else {

          $("tutorialModal")
            .classList.add("hidden");

        }

      }
    );


  $("tutorialBack")
    .addEventListener(
      "click",
      () => {

        if (tutorialIndex > 0) {

          tutorialIndex--;

          updateTutorial();

        }

      }
    );


  /* -----------------------------
     DASHBOARD NAVIGATION
  ----------------------------- */

  document
    .querySelectorAll(
      ".dashboard-item[data-section]"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            const section =
              button.dataset.section;

            closeDashboard();


            if (
              section === "devices"
            ) {

              $("devicesSection")
                .scrollIntoView({
                  behavior: "smooth"
                });

            }


            if (
              section === "addDevice"
            ) {

              $("addDeviceSection")
                .scrollIntoView({
                  behavior: "smooth"
                });

            }

          }
        );

      }
    );


  /* -----------------------------
     LOGOUT
  ----------------------------- */

  $("logoutButton")
    .addEventListener(
      "click",
      () => {

        try {

          localStorage.removeItem(
            "smart_switch_user"
          );

        } catch (_) {}


        currentUser = null;

        location.reload();

      }
    );


  /* -----------------------------
     SAVE
  ----------------------------- */

  function saveDevices() {

    safeWrite(
      "smart_switch_devices",
      devices
    );

  }


  /* -----------------------------
     ID
  ----------------------------- */

  function createId() {

    if (
      window.crypto &&
      typeof crypto.randomUUID ===
        "function"
    ) {

      return crypto.randomUUID();

    }


    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substring(2)
    );

  }


  /* -----------------------------
     SECURITY DISPLAY
  ----------------------------- */

  function escapeHTML(value) {

    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  /* -----------------------------
     CRASH PROTECTION
  ----------------------------- */

  let recoveryActive = false;


  function recoverFromError(error) {

    console.error(
      "Smart Switch recovered from:",
      error
    );


    if (recoveryActive) {
      return;
    }


    recoveryActive = true;


    try {

      showToast(
        "Smart Switch recovered from an error. Please try again."
      );

    } catch (_) {}


    setTimeout(
      () => {
        recoveryActive = false;
      },
      4000
    );

  }


  /*
   * Catch JavaScript errors.
   */

  window.addEventListener(
    "error",
    (event) => {

      recoverFromError(
        event.error ||
        event.message
      );

    }
  );


  /*
   * Catch rejected promises.
   */

  window.addEventListener(
    "unhandledrejection",
    (event) => {

      event.preventDefault();

      recoverFromError(
        event.reason
      );

    }
  );


  /*
   * Network protection.
   */

  window.addEventListener(
    "offline",
    () => {

      showToast(
        "You're offline. Smart Switch remains available."
      );

    }
  );


  window.addEventListener(
    "online",
    () => {

      showToast(
        "Connection restored."
      );

    }
  );


  /*
   * Save before the page is hidden.
   */

  window.addEventListener(
    "pagehide",
    () => {

      try {
        saveDevices();
      } catch (_) {}

    }
  );


  /*
   * Service worker must never be able
   * to crash the application.
   */

  if (
    "serviceWorker" in navigator
  ) {

    navigator.serviceWorker
      .register("/sw.js")
      .catch(
        (error) => {

          console.warn(
            "Service worker unavailable:",
            error
          );

        }
      );

  }


  /* -----------------------------
     START
  ----------------------------- */

  try {

    if (currentUser) {

      openApplication();

    } else {

      showLogin();

    }

  } catch (error) {

    recoverFromError(error);

  }

})();