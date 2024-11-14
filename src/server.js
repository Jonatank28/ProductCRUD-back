const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

//Create
app.post('/create', async (req, res) => {
  const { data } = req.body;
  try {
    if (!data.title) {
      return res.status(400).json({ message: "O título é obrigatório!" });
    }
    await db.product.create({ data })
    res.status(201).json({ message: "Produto criado com sucesso!" });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ message: "Produto já cadastrado!" });
    }
    if (err.message.includes("Expected Float") || err.message.includes("Expected Int")) {
      return res.status(400).json({ message: "Tipo incorreto: verifique os dados enviados." });
    }
    res.status(400).json({ message: err.message });
  }
})

// Edit
app.put('/edit/:id', async (req, res) => {
  const { id } = req.params
  const data = req.body;
  try {
    const verifyExistProduct = await db.product.findFirst({
      where: {
        id: Number(id)
      }
    })
    if (verifyExistProduct) {
      await db.product.update({
        where: {
          id: Number(id)
        },
        data
      })
      res.status(201).json({ message: "Produto editado com sucesso!" })
    } else {
      res.status(404).json({ message: "Produto não encontrado" })
    }
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ message: "Produto já cadastrado!" });
    }
    res.status(500).json({ message: err.message })
  }
})

// Delete
app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params
  try {
    const verifyExistProduct = await db.product.findFirst({
      where: {
        id: Number(id)
      }
    })
    if (verifyExistProduct) {
      await db.product.delete({
        where: {
          id: Number(id)
        }
      })
      res.status(201).json({ message: "Produto deletado com sucesso!" })
    } else {
      res.status(404).json({ message: "Produto não encontrado" })
    }
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// FindAll
app.get("/findAll", async (req, res) => {
  try {
    const product = await db.product.findMany()
    res.status(200).json(product)
  } catch (err) {
    res.status(400).json({ mesage: "Dados não encontrados" })
  }
})

// FindOne
app.get("/findOne/:id", async (req, res) => {
  const { id } = req.params
  try {
    const verifyExistProduct = await db.product.findFirst({
      where: {
        id: Number(id)
      }
    })
    if (!verifyExistProduct) {
      return res.status(404).json({ message: "Produto não encontrado" })
    }

    const product = await db.product.findFirst({
      where: {
        id: Number(id)
      }
    })
    res.status(200).json(product)
  } catch (err) {
    res.status(400).json({ mesage: "Dados não encontrados" })
  }
})

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});