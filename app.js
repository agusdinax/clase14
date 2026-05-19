const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;
app.use(express.json());

const leerPaises = () => {
  try {
    const data = fs.readFileSync("./data/data.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    throw new Error("Error leyendo el archivo JSON");
  }
};

const guardarPaises = (paises) => {
  try {
    fs.writeFileSync("./data/data.json", JSON.stringify(paises, null, 2));
  } catch (error) {
    throw new Error("Error guardando el archivo JSON");
  }
};


//DATOS SOBRE LA API (CONTRATO)
app.get("/api", (req, res) => {
  res.status(200).json({
    nombre: "API Países CLASE 14 CON EXPRESS",
    version: "1.0.0",
    endpoints: [
      {
        metodo: "GET",
        ruta: "/paises",
        descripcion: "Obtiene todos los países"
      },
      {
        metodo: "GET",
        ruta: "/paises/:nombre",
        descripcion: "Obtiene un país por nombre"
      },
      {
        metodo: "GET",
        ruta: "/paises?idioma=italiano",
        descripcion: "Filtra países por idioma"
      },
      {
        metodo: "POST",
        ruta: "/paises",
        descripcion: "Agrega un nuevo país"
      },
      {
        metodo: "DELETE",
        ruta: "/paises/:nombre",
        descripcion: "Elimina un país"
      }
    ]
  });
});

//GET PARA OBTENER TODOS LOS PAISES
app.get("/paises", (req, res) => {
  try {
    const paises = leerPaises();
    const idioma = req.query.idioma;
    const normalizar = (texto) =>
      texto
        ?.toString()
        .trim()
        .toLowerCase();
    if (idioma) {
      const idiomaBuscado = normalizar(idioma);
      const filtrados = paises.filter(
        (pais) =>
          normalizar(pais.idioma) === idiomaBuscado
      );
      return res.status(200).json({
        ok: true,
        cantidad: filtrados.length,
        data: filtrados
      });
    }
    res.status(200).json({
      ok: true,
      cantidad: paises.length,
      data: paises
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

//GET PARA OBTENER UN PAIS POR NOMBRE
app.get("/paises/:nombre", (req, res) => {
  try {
    const paises = leerPaises();
    const nombre = req.params.nombre;
    const normalizar = (texto) =>
      texto
        ?.toString()
        .trim()
        .toLowerCase();
    const pais = paises.find(
      (p) =>
        normalizar(p.pais) === normalizar(nombre)
    );
    if (!pais) {
      return res.status(404).json({
        ok: false,
        error: "País no encontrado"
      });
    }
    res.status(200).json({
      ok: true,
      data: pais
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

//POST PARA AGREGAR UN NUEVO PAIS
app.post("/paises", (req, res) => {
  try {
    const paises = leerPaises();
    const nuevoPais = req.body;
    const normalizar = (texto) =>
      texto
        ?.toString()
        .trim()
        .toLowerCase();
    if (
      !nuevoPais.pais ||
      !nuevoPais.idioma ||
      !nuevoPais.continente
    ) {
      return res.status(400).json({
        ok: false,
        error: "Faltan datos obligatorios"
      });
    }

    if (!Array.isArray(nuevoPais.idioma)) {
      return res.status(400).json({
        ok: false,
        error: "Idioma debe ser un array"
      });
    }
    const existe = paises.find(
      (p) =>
        normalizar(p.pais) ===
        normalizar(nuevoPais.pais)
    );
    if (existe) {
      return res.status(409).json({
        ok: false,
        error: "El país ya existe"
      });
    }

    paises.push(nuevoPais);
    guardarPaises(paises);
    res.status(201).json({
      ok: true,
      mensaje: "País agregado correctamente",
      data: nuevoPais
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

//PARA ELIMINAR UN PAIS ENVIANDO EL NOMBRE 
app.delete("/paises/:nombre", (req, res) => {
  try {
    let paises = leerPaises();
    const nombre = req.params.nombre;
    const normalizar = (texto) =>
      texto
        ?.toString()
        .trim()
        .toLowerCase();
    const existe = paises.find(
      (p) =>
        normalizar(p.pais) === normalizar(nombre)
    );
    if (!existe) {
      return res.status(404).json({
        ok: false,
        error: "País no encontrado"
      });
    }
    paises = paises.filter(
      (p) =>
        normalizar(p.pais) !== normalizar(nombre)
    );
    guardarPaises(paises);
    res.status(200).json({
      ok: true,
      mensaje: "País eliminado correctamente",
      data: existe
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// MANEJO PARA RUTAS NO DEFINIDAS
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "404 NOT FOUND - La ruta no existe, tipeaste bien?"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});