import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';

import path from 'path';
const __dirname = path.resolve();
const __dirPath = `${__dirname}/views`;

const port = 5000;

const app = express();
app.locals.port = port;
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
// app.use('/views', express.static('views'));
// app.use(express.static('views'));

app.listen(port, function() {
    console.log(`listening on port ${port}`);
});

app.use(cors());
app.use(bodyParser.json());

app.get('/', home(app));
app.get('/index.html', home(app));
app.get(`/userDetails.html`, userDetails(app));
app.get(`/stocks.html`, stockInfo(app));

/****************************** Handlers *******************************/
function home(app){
    return errorWrap(async function (req, res){
        try{
            res.sendFile(`${__dirPath}/index.html`);
        }
        catch(err){
            console.error(err);
            throw err;
        }
    });
}

function userDetails(app){
    try{
        return errorWrap(async function (req, res){
            const firstName = req.query.Firstname;
            res.sendFile(`${__dirPath}/userDetails.html`);
        });
    }
    catch(err){
        console.error(err);
        throw err;
    }
}

function stockInfo(){
    try{
        return errorWrap(async function (req, res){
            const firstName = req.query.Firstname;
            res.sendFile(`${__dirPath}/stocks.html`);
        });
    }
    catch(err){
        console.error(err);
        throw err;
    }
}

function errorWrap(handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (err) {
            next(err);
        }
    };
}