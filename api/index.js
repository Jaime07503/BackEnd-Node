const express = require("express");
const { createClient } = require("@libsql/client");
const cors = require("cors");

const app = express();
const port = process.env.port || 3001;

var corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client = createClient({
  url: "libsql://invitacion-graduacion-martz.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTgzMjcwNDgsImlkIjoiZDY1MTM0NmItY2Q3OC00OTBhLWIxZWQtYTg4MDQ1NWEyN2E3In0.ZZ6-sjYYB5Hv1s-bYst22e2LvaOpz0RerMOidYhdlI3_twlnqTJA1jCjqQ-8ON3gnr9ao5JFaAKIEqeMzBNODA",
});

app.get("/", (req, res) => res.send("Express on Vercel"));

app.get("/families/:family", async (req, res) => {
  const familyName = req.params.family;

  const query = `
        SELECT Guest.guest_name, Guest.guest_confirmed
        FROM Guest
        JOIN Family ON Guest.id_family = Family.family_id
        WHERE Family.family_name = ?
    `;

  try {
    const result = await client.execute({
      sql: query,
      args: [familyName],
    });
    res.json({
      Family: familyName,
      Members: result.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/families/updatedMembers", async (req, res) => {
  const updatedMembers = req.body;

  if (!updatedMembers || !Array.isArray(updatedMembers)) {
    return res.status(400).send("Invalid request body");
  }

  try {
    for (let member of updatedMembers) {
      const updateQuery = `
        UPDATE Guest
        SET guest_confirmed = ?
        WHERE guest_name = ?
      `;
      await client.execute({
        sql: updateQuery,
        args: [member.guest_confirmed, member.guest_name],
      });
    }

    res.json({ message: "Datos de miembros actualizados correctamente" });
  } catch (error) {
    console.error("Error actualizando datos de miembros:", error);
    res.status(500).send("Error interno del servidor");
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
