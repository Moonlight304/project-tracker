const express = require('express');
const app = express();
const axios = require('axios');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
require('dotenv').config();

//importing model and connecting database
const Project = require('./models/Projects.js');

// Issue: Lack of error handling for database connection failure.
// Resolution: Implement error handling for database connection to gracefully handle connection failures.
mongoose.connect(process.env.dbURL)
.then(() => {
    console.log("DB Connected");
})
.catch((e) => {
    console.log("Database connection error");
    console.log(e);
})

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.use(methodOverride('_method'));

// rendering all projects in the root route
app.get('/', async (req, res) => {
    try {
        const allProjects = await Project.find({});
        console.log("Rendering all projects");
        console.log(allProjects);
        res.render('index', { projects: allProjects });
    }
    catch (e) {
        console.error(e);
    
        res.status(500).render('error', { error: 'Internal Server Error' });
        return;
    }
})

// serving create form
app.get('/create', (req, res) => {
    res.render('create');
})

// getting project information and saving in database

// Issue: No validation for required fields in create route.
// Resolution: Implement validation for required fields to ensure data integrity.
app.post('/create', async (req, res) => {
    try {
        const { projectName, projectDescription, projectDuration, projectTag1, projectTag2 } = req.body;

        // server side input handling
        if (!projectName || !projectDescription || !projectDuration)
            res.status(400).render('error', { error: 'Input validation failed' });


        // fetching random image url and saving with project information
        const response = await axios.get('https://picsum.photos/v2/list?page=1&limit=500');
        const imageURL = response.data[Math.floor(Math.random() * 100)].download_url;

        const newProject = Project({ image: imageURL, name: projectName, description: projectDescription, duration: projectDuration, tags: [projectTag1, projectTag2] });
        await newProject.save();
        console.log("Saved new project");
        console.log(newProject);
    }
    catch (e) {
        console.error(e._message);
    
        res.status(500).render('error', { error: e._message });
        return;
    }

    res.redirect('/');
})

// rendering show page of a project

// Issue: Incomplete error handling for invalid project IDs.
// Resolution: Implement complete error handling for invalid project IDs to provide appropriate responses.
app.get('/show/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            res.status(400).render('error', { error: 'Invalid project ID' });

        const reqProject = await Project.findById(id);

        if (!reqProject)
            res.status(404).render('error', { error: 'Project not found' });

        console.log("Showing required project");
        console.log(reqProject);

        res.render('show', { project: reqProject });
    }
    catch (e) {
        console.error(e);
    
        res.status(500).render('error', { error: 'Internal Server Error' });
        return;
    }
})

// filtering projects by tags and rendering relevant projects
app.get('/tags/:tag', async (req, res) => {
    try {
        const { tag } = req.params;

        const reqProjects = await Project.find({ tags: { $in: tag } });

        console.log("Filtering projects by tag");
        console.log(reqProjects);

        res.render('tags', { projects: reqProjects, tag });
    }
    catch (e) {
        console.error(e);
    
        res.status(500).render('error', { error: 'Internal Server Error' });
        return;
    }
})

// serving edit form for a project
app.get('/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            res.status(400).render('error', { error: 'Invalid project ID' });

        const reqProject = await Project.findById(id);

        if (!reqProject)
            res.status(404).render('error', { error: 'Project not found' });

        console.log("Serving edit form");

        res.render('edit', { project: reqProject });
    }
    catch (e) {
        console.error(e);
    
        res.status(500).render('error', { error: 'Internal Server Error' });
        return;
    }
})

// processing patch request for a project and redirecting to show page of that project
app.patch('/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { projectDescription, projectTag1, projectTag2 } = req.body;

        await Project.findByIdAndUpdate(id, { $set: { description: projectDescription, tags: [projectTag1, projectTag2] } })

        console.log("Updated project");
        res.redirect(`/show/${id}`);
    }
    catch (e) {
        console.error(e);
    
        res.status(500).render('error', { error: 'Internal Server Error' });
        return;
    }
})

// processing delete request of a project
app.get('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await Project.findOneAndDelete({ _id: id });

        console.log("Deleted project");
        res.redirect('/');
    }
    catch (e) {
        console.error(e);
    
        res.status(500).render('error', { error: 'Internal Server Error' });
        return;
    }
})

// handling invalid URL's and rendering notFound page

// Issue: Lack of error handling for invalid URLs.
// Resolution: Implement error handling for invalid URLs to provide a meaningful response to users.
app.get('*', (req, res) => {
    console.log("ERROR");
    console.log("Page not found");
    res.status(404).render('notFound');
})

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
})