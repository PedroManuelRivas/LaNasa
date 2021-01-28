const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "postgres",
  database: "nasa",
  port: 5432,
});

// Query para agregar usuarios
const nuevoUsuario = async (email, nombre, password) => {
  const consulta = {
    text:
      "INSERT INTO usuarios (email, nombre, password) VALUES($1, $2, $3) RETURNING *",
    values: [email, nombre, password],
  };
  try {
    await pool.query(consulta);
    return true;
  } catch (error) {
    console.log(error.code);
    return false;
  }
};

// Query para obtener usuarios
const obtenerUsuarios = async () => {
  const consulta = {
    text: "SELECT * FROM USUARIOS",
  };
  try {
    const result = await pool.query(consulta);
    return result.rows;
  } catch (error) {
    console.log(error.code);
    return error;
  }
};

// Query para para autorizar usuarios
const autorizarUsuarios = async (id, auth) => {
  const consulta = {
    text: "UPDATE usuarios SET auth=$1 where id = $2 RETURNING *",
    values: [auth, id],
  };
  try {
    const result = await pool.query(consulta);
    return result;
  } catch (error) {
    console.log(error.code);
  }
};

// Query para obtener usuario individual
const obtenerUsuario = async (email) => {
  const consulta = {
    text: "SELECT * FROM usuarios WHERE email = $1",
    values: [email],
  };
  try {
    const result = await pool.query(consulta);
    return result.rows[0];
  } catch (error) {
    console.log(error.code);
    return error;
  }
};
module.exports = {
  nuevoUsuario,
  obtenerUsuarios,
  autorizarUsuarios,
  obtenerUsuario,
};
