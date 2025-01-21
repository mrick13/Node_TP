require('dotenv/config');
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = process.env.PORT || 3000;

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
});

const connectToDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connexion à la base de données réussie.');
    } catch (error) {
        console.error('Erreur de connexion à la base de données')
    }
};


connectToDb();

// Définition du modèle User
const UserModel = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
},{
    timestamps: true,
    paranoid: true,
});

// Synchronisation du modèle avec la base de données
const syncDb = async () => {
    try {
        await sequelize.sync({ alter: true }); // Synchronise le modèle en appliquant les modifications
        console.log('Base de données synchronisée.');
    } catch (error) {
        console.error('Erreur lors de la synchronisation de la base de donnée');
    }
};


syncDb();

// Middleware pour gérer les requêtes JSON et la sécurité
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    if (req.headers.authorization !== process.env.PASSWORD) {
        return res.status(401).send('Mot de passe incorrect');
    }
    next();
});


// Récupérer tous les utilisateurs
app.get('/users', async (req, res) => {
    try {
        const users = await UserModel.findAll({
            where: { deletedAt: null },
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs.' });
    }
});

// Récupérer un utilisateur par son ID
app.get('/users/:id', async (req, res) => {
    try {
        const user = await UserModel.findByPk({
            where : { id : req.params.id , deletedAt : null }
        });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur.' });
    }
});

// Créer un nouvel utilisateur
app.post('/users', async (req, res) => {
    try {
        const { name, email, avatar } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'Les champs name et email sont requis.' });
        }
        const newUser = await UserModel.create({ name, email, avatar: avatar });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur.' });
    }
});

// Mettre à jour un utilisateur
app.patch('/users/:id', async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await UserModel.findOne({
            where: { id: req.params.id, deletedAt: null },
        });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé ou supprimé.' });
        }
        user.name = name || user.name;
        user.email = email || user.email;
        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur.' });
    }
});

// Supprimer un utilisateur
app.delete('/users/:id', async (req, res) => {
    try {
        const user = await UserModel.findOne({
            where: { id: req.params.id, deletedAt: null },
        });
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé ou déjà supprimé.' });
        }
        user.deletedAt = new Date();
        await user.save();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur.' });
    }
});

app.all('*', (req, res) => {
    res.status(404).send('Not Found');
});


app.listen(port, () => {
    console.log(`Serveur en écoute sur le port ${port}`)
})

