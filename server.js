const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const {
  nuevoUsuario,
  obtenerUsuarios,
  autorizarUsuarios,
  obtenerUsuario,
} = require("./querys");
const expressFileUpload = require("express-fileupload");
const secretKey = "LATAM";
const app = express();
const enviarCorreo = require("./mailer");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "handlebars");
app.engine("handlebars", exphbs({ layoutsDir: __dirname + "/views" }));
app.use(
  expressFileUpload({
    limits: { fileSize: 5000000 },
    abortOnLimit: true,
    responseOnLimit:
      "Peso de archivo sobrepasa límites permitidos, por favor intente nuevamente con un archivo más ligero",
  })
);
app.listen(3000, () => {
  console.log("Servidor encendido en el puerto 3000");
});

// Ruta principal
app.get("/", (req, res) => {
  res.render("Home", { layout: "Home" });
});

// Ruta agregar usuarios
app.post("/usuario", async (req, res) => {
  const { email, nombre, password } = req.body;
  const response = await nuevoUsuario(email, nombre, password);
  const template = `<h1> Hola ${nombre} </h1>. <h2>Gracias por realizar el registro a nuestro sitio web. En las próximas 24 horas, un administrador revisará tu solicitud para unirte a nuestro portal. Gracias por ser parte de nuestra comunidad.<h2>
  <h1>La NASA te lo agradece</h1>`;
  if (response) {
    res.status(201).render("Bienvenido", { layout: "Bienvenido", nombre });
    await enviarCorreo(email, "Verificación de Correo", template);
  } else {
    res
      .status(500)
      .render("Errorregistro", { layout: "Errorregistro", nombre });
  }
});

// Ruta para obtener usuarios
app.get("/Admin", async (req, res) => {
  const users = await obtenerUsuarios();
  res.render("Admin", { layout: "Admin", users });
});

// Ruta para autorizar usuarios
app.post("/auth", async (req, res) => {
  const { id, auth } = req.body;
  const result = await autorizarUsuarios(id, auth);
  const { email, nombre } = result.rows[0];
  if (auth) {
    try {
      console.log(email);
      const template = `<h1> Felicidades ${nombre} </h1>. <h2>A partir de este momento, puedes hacer uso completo de nuestro portal. Sientete libre de subir tus aportes en nuestra galería de Aliens.<h2>`;
      // Envío de correo para indicar que fué autorizado
      await enviarCorreo(email, "Bienvenido a LA NASA", template);
      res.send(result);
    } catch (e) {
      res
        .status(500)
        .send(
          `<script>alert("No se pudo enviar correo debido a que está mal estructurado su correo electrónico</script>`
        );
    }
  } else {
    const template = `<h1> Lo sentimos ${nombre} </h1>. <h2>Se ha revocado temporalmente tu acceso a nuestro portal. Comunicate con uno de nuestros admin para mas detalles.`;
    // Envío de correo para indicar que fué autorizado
    await enviarCorreo(email, "Permanencia revocada", template);
  }
});

// Ruta para ingresar a portal
app.get("/Login", (req, res) => {
  res.render("Login", { layout: "Login" });
});

// Ruta para verificar usuarios
app.post("/verificar", async (req, res) => {
  const { email } = req.body;
  const user = await obtenerUsuario(email);
  let token = user && user.auth ? jwt.sign(user, secretKey) : false;
  user
    ? user.auth
      ? res.redirect("/Evidencias?token=" + token)
      : res.send(`<script>alert("Usuario no autorizado.") </script>`)
    : res.send(
        `<script>alert("Usuario no encontrado en Base de Datos")</script>`
      );

  res.send();
});

// Ruta para subir imágenes
app.get("/Evidencias", (req, res) => {
  const { token } = req.query;
  jwt.verify(token, secretKey, (err, payload) => {
    err
      ? res.status(401).send({ error: "401 No autorizado", message: err })
      : res.render("Evidencias", {
          layout: "Evidencias",
          nombre: payload.nombre,
        });
  });
});

// Ruta para subir imágenes
app.post("/upload", (req, res) => {
  const { foto } = req.files;
  const { name } = foto;
  foto.mv(`${__dirname}/public/img/${name}`, (err) => {
    res.send("Archivo Cargado");
  });
});
