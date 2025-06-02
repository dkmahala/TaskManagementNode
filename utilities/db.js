const sql = require('mssql');
const config=require('./config')
console.log('db password check---->', config.DB_PASSWORD)
const dbconfig = {
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  server: config.DB_HOST, 
  database: config.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

const poolPromise = new sql.ConnectionPool(dbconfig)
  .connect()
  .then(pool => {
    console.log('Connected to Database');
    return pool;
  })
  .catch(err => console.error('DB Connection Failed: ', err));

const query = async (queryText, inputs = []) => {
    const pool = await poolPromise;
    const request = pool.request();
  
    inputs.forEach(({ name, type, value }) => {
      request.input(name, type, value);
    });
  
    return request.query(queryText);
  };
  
module.exports = {
    sql, 
    poolPromise,
    query, 
};
  

