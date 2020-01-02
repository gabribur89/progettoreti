const { Client, Pool} = require('pg')

const client = new Client({
user: 'postgres',
host: 'localhost',
database: 'test',
password: 'admin',
port: 5432,
})

client.connect()
/*
//Test SELECT
client.query('SELECT * FROM utente', (err,res) =>{
	console.log(err,res)
	client.end()
})
/*const res = await client.query('SELECT $1::text as message', ['Hello world!'])
console.log(res.rows[0].message) // Hello world!
await client.end()
*/


// callback - Test Inserimento
const sql = 'INSERT INTO utente(nome, cognome, id) VALUES($1,$2,$3) RETURNING *'
const values = ['brian','white','24']
client.query(sql, values, (err, res) => {
  if (err) {
    console.log(err.stack)
  } else {
    console.log(res.rows[0])
 }
})

client.end()