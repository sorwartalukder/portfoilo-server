const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors())
app.use(express.json())

//middle wares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wt5ksu8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function contactEmail(contact) {
    const { name, email, subject, message, sender } = contact

    const auth = {
        auth: {
            api_key: process.env.EMAIL_SEND_KEY,
            domain: process.env.EMAIL_SEND_DOMAIN
        }
    }

    const transporter = nodemailer.createTransport(mg(auth));

    transporter.sendMail({
        from: email, // verified sender email
        to: "mdsorwar4039@gmail.com", // recipient email
        subject: subject, // Subject line
        text: "Hello world!", // plain text body
        html: `
        <p>This mail send to your Portfolio</p>
        <p>${message}</p>
        <br /> 
        <h3>Best wishes,</h3>
        <h3>${name}</h3>
        <p>This mail send Sorwar's ${sender}</p>
        `, // html body
    }, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info);
        }
    });

}


async function run() {
    try {
        const contactCollection = client.db('sorwarPortfolio').collection('contact');
        const projectCollection = client.db('sorwarPortfolio').collection('projects');

        app.post('/contact', async (req, res) => {
            const contact = req.body;
            contactEmail(contact)
            const result = await contactCollection.insertOne(contact)
            res.send(result)
        })
        app.get('/projects', async (req, res) => {
            const projects = await projectCollection.find({}, { sort: { _id: -1 } }).toArray()
            res.send(projects)
        })
        app.get('/projects/:id', async (req, res) => {
            const id = req.params.id;
            const projects = await projectCollection.findOne({ _id: ObjectId(id) })
            res.send(projects)
        })
        app.post('/projects', async (req, res) => {
            const project = req.body;
            const result = await projectCollection.insertOne(project)
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(e => console.error(e))



app.get('/', (req, res) => {
    res.send('portfolio  server is running')
})

app.listen(port, () => {
    console.log(`portfolio server running ${port}`)
})