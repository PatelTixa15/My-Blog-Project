import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';
// const articlesInfo = {
//     'learn-react': {
//         upvotes: 0,
//         comments: [],
//     },
//     'learn-node': {
//         upvotes: 0,
//         comments: [],
//     },
//     'my-thoughts-on-resumes': {
//         upvotes: 0,
//         comments: [],
//     },
// }

const app = express();

app.use(express.static(path.join(__dirname, '/build')));

app.use(bodyParser.json());

const withDB = async (operations, res) => {
    try {
        
      //  const articleName = req.params.name;
    
        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
        const db = client.db('my-blogs');
    
       // const articlesInfo = await db.collection('articles').findOne({ name: articleName})
    
       // res.status(200).json(articlesInfo);
       await operations(db);
    
        client.close();
    
        } catch (error) {
            res.status(500).json({ message: 'Error connecting to db', error});
    
        }
    

}

app.get('/api/articles/:name', async (req, res) => {

   // try {
     
   withDB(async (db) => {
    const articleName = req.params.name;
    const articlesInfo = await db.collection('articles').findOne({ name: articleName})
    res.status(200).json(articlesInfo);

   }, res);
   
   // const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
   // const db = client.db('my-blogs');

    
   
    // client.close();

    // } catch (error) {
    //     res.status(500).json({ message: 'Error connecting to db', error});

    // }

})

app.post('/api/articles/:name/upvote', async (req, res) => {

  //  try {

  withDB(async (db) => {
    const articleName = req.params.name;

    const articlesInfo = await db.collection('articles').findOne({ name: articleName });
    await db.collection('articles').updateOne({ name: articleName }, {
        '$set': {
        upvotes: articlesInfo.upvotes + 1,
        }, 
    });
    const updateArticleInfo = await db.collection('articles').findOne({ name: articleName });
   res.status(200).json(updateArticleInfo);

      
  }, res);
//     const articleName = req.params.name;

//     // const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
//     // const db = client.db('my-blogs');

//     const articlesInfo = await db.collection('articles').findOne({ name: articleName });
//     await db.collection('articles').updateOne({ name: articleName }, {
//         '$set': {
//         upvotes: articlesInfo.upvotes + 1,
//         }, 
//     });
//     const updateArticleInfo = await db.collection('articles').findOne({ name: articleName });
//    // articlesInfo[articleName].upvotes += 1;
//    // res.status(200).send(`${articleName} now has ${articlesInfo[articleName].upvotes} upvotes!`);

//    res.status(200).json(updateArticleInfo);

// //    client.close();
// // }
// // catch (error) {
// //     res.status(500).json({ message: 'Error connecting to db', error});

// // }

});

app.post('/api/articles/:name/add-comment', (req, res) => {
    const { username, text } = req.body;
    const articleName = req.params.name;

    // articlesInfo[articleName].comments.push({ username, text });

    // res.status(200).send(articlesInfo[articleName]);

    withDB(async (db) => {
        const articlesInfo = await db.collection('articles').findOne({ name: articleName });
        await db.collection('articles').updateOne({ name: articleName }, 
            {'$set': 
            {
            comments: articlesInfo.comments.concat({ username, text}),
            },
        });
        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });

        res.status(200).json(updatedArticleInfo);
    }, res);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
})

app.listen(8000, () => console.log('Listening on port 8000'));