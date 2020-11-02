import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import Path from 'path';

const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;

// const __dirname = Path.dirname(new URL(import.meta.url).pathname);

export default function serve(port, model) {
    const app = express();
    app.locals.port = port;
    app.locals.model = model;
    // app.use('/', express.static('views'));
    //app.set('views', Path.join(__dirname, 'views'));
    // app.set('view engine', 'ejs');

    setupRoutes(app);

    app.listen(port, function() {
        console.log(`listening on port ${port}`);
    });
}


function setupRoutes(app) {
    app.use(cors());
    app.use(bodyParser.json());
    app.use(function(err, req, res, next) {
        console.log("Body parser error");
        if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
            res.status(400).send({
                status: "BAD_REQUEST",
                code: 400,
                message: "Checkout the content type of the input body"
            });
        } else next();
    });
    //@TODO
    app.get('/getStocks', getStocks(app));
    app.get('/getUserStocks', getUserStocks(app));
    app.get('/close', closeConnection(app));
    app.get('/clear', clearDatabase(app));
    app.post('/addUser', addUser(app));
    app.post('/addUserStock', addUserStock(app));
    // app.delete('/delete', removeStock(app));


    app.use(do404());
    app.use(doErrors());
}

/****************************** Handlers *******************************/

//@TODO
function addUser(app){
    return errorWrap(async function (req, res){
        try {
            const obj = req.body;
            const results = await app.locals.model.addUser(obj);
            res.sendStatus(CREATED);
        }
        catch(err) {
            const mapped = mapError(err);
            res.status(mapped.status).json(mapped);
        }
    });
}

function addUserStock(app){
    return errorWrap(async function (req, res){
        try {
            const obj = req.query;
            const results = await app.locals.model.addUserStock(obj);
            res.sendStatus(CREATED);
        }
        catch(err) {
            const mapped = mapError(err);
            res.status(mapped.status).json(mapped);
        }
    });
}

function getStocks(app){
    return errorWrap(async function (req, res){
       try{
           const data = await app.locals.model.getStocks();
           res.json(data);
       }
       catch(err){
            throw err;
       }
    });
}

function getUserStocks(app){
    return errorWrap(async function (req, res){
        try{
            const userDetails = req.query;
            const data = await app.locals.model.getUserStocks(userDetails);
            res.json(data);
        }
        catch(err){
            throw err;
        }
    });
}
function closeConnection(app){
    return errorWrap(async function (req, res){
        try{
            const data = await app.locals.model.close();
            res.json(data);
        }
        catch(err){
            throw err;
        }
    });
}
function clearDatabase(app){
    return errorWrap(async function (req, res){
        try{
            const data = await app.locals.model.clear();
            res.sendStatus(OK);
        }
        catch(err){
            throw err;
        }
    });
}

/**************************** Error Handling ***************************/

/** Ensures a server error results in nice JSON sent back to client
 *  with details logged on console.
 */
function do404(app) {
    return async function(req, res) {
        const message = `${req.method} not supported for ${req.originalUrl}`;
        const result = {
            status: NOT_FOUND,
            errors: [	{ code: 'NOT_FOUND', message, }, ],
        };
        res.type('text').
        status(404).
        json(result);
    };
}

function doErrors(app) {
    return async function(err, req, res, next) {
        const result = {
            status: SERVER_ERROR,
            errors: [ { code: 'SERVER_ERROR', message: err.message } ],
        };
        res.status(SERVER_ERROR).json(result);
        console.error(err);
    };
}

/** Set up error handling for handler by wrapping it in a
 *  try-catch with chaining to error handler on error.
 */
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

const ERROR_MAP = {
    NOT_FOUND: NOT_FOUND,
    EXISTS: CONFLICT,
};

function mapError(err) {
    console.error(err);
    return err.isDomain
        ? {
            status: (ERROR_MAP[err.errorCode] || BAD_REQUEST),
            code: err.errorCode,
            message: err.message
        }
        : {
            status: SERVER_ERROR,
            code: 'INTERNAL',
            message: err.toString()
        };
}