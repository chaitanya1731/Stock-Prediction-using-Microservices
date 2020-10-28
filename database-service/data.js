// -*- mode: JavaScript; -*-
import mongo from 'mongodb';

export default class DatabaseService {
    constructor(props) {
        Object.assign(this, props)
    }

    /** options.dbUrl contains URL for mongo database */
    static async make() {
        const dbUrl = "mongodb://localhost:27017/stocksDb";
        let client;
        try {
            client = await mongo.connect(dbUrl, MONGO_CONNECT_OPTIONS );
            const db = client.db();
            const props = {
                client, db,
                stocksCollection: db.collection(STOCKS)
            };

            const data = new DatabaseService(props);
            return data;
        }
        catch (err) {
            const msg = `cannot connect to URL "${dbUrl}": ${err}`;
            throw msg;
        }

    }

    /** Release all resources held by this blog.  Specifically, close
     *  any database connections.
     */
    async addUserStock(userDetails){
        try{
            userDetails._id = (Math.random() * 9999 + 1000).toFixed(4);
            const res = await this.stocksCollection.insertOne(userDetails);
        }
        catch (e) {
            throw e;
        }
    }

    async getStocks(){
        try{
            const arr = this.stocksCollection.find({}).toArray();
            return arr;
        }
        catch (e) {
            throw e;
        }
    }

    async close() {
        await this.client.close();
    }

    /** Remove all data for this service */
    async clear() {
        await this.db.dropDatabase();
    }


}

const MONGO_CONNECT_OPTIONS = {
    useUnifiedTopology: true,
    useNewUrlParser: true
};
const STOCKS = "stocks";
