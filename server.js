const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT =
  process.env.PORT || 3000;


/* -----------------------------
   BASIC SECURITY
----------------------------- */

app.disable("x-powered-by");

app.use(
  cors({
    origin: true
  })
);

app.use(
  express.json({
    limit: "100kb"
  })
);


/* -----------------------------
   STATIC APP
----------------------------- */

app.use(
  express.static(__dirname)
);


/* -----------------------------
   HEALTH CHECK
----------------------------- */

app.get(
  "/api/health",
  (req, res) => {

    res.json({
      ok: true,
      application: "Smart Switch",
      version: "1.7.0"
    });

  }
);


/* -----------------------------
   DEVICE COMMAND
----------------------------- */

app.post(
  "/api/device/command",
  (req, res) => {

    try {

      const {
        deviceId,
        command
      } = req.body || {};


      if (!deviceId) {

        return res.status(400).json({
          ok: false,
          error: "Device ID is required."
        });

      }


      const normalized =
        String(command || "")
          .toUpperCase();


      if (
        normalized !== "ON" &&
        normalized !== "OFF"
      ) {

        return res.status(400).json({
          ok: false,
          error: "Command must be ON or OFF."
        });

      }


      /*
       * Production version:
       *
       * Authenticate the user with Supabase,
       * verify ownership/access,
       * locate the registered device,
       * then send the command using its
       * authorized protocol.
       */


      return res.json({

        ok: true,

        queued: true,

        deviceId,

        command: normalized

      });


    } catch (error) {

      console.error(error);

      return res.status(500).json({

        ok: false,

        error:
          "The server recovered from an internal error."

      });

    }

  }
);


/* -----------------------------
   FRONTEND FALLBACK
----------------------------- */

app.get(
  "*",
  (req, res) => {

    if (
      req.path.startsWith("/api/")
    ) {

      return res.status(404).json({
        ok: false,
        error: "API endpoint not found."
      });

    }


    res.sendFile(
      path.join(
        __dirname,
        "index.html"
      )
    );

  }
);


/* -----------------------------
   START SERVER
----------------------------- */

app.listen(
  PORT,
  () => {

    console.log(
      `Smart Switch v1.7 running on port ${PORT}`
    );

  }
);