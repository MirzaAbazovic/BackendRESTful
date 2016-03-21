# BackendRESTful 

## Instalacija 

Preuzmite kod i instalirajte potrebne node pakete

```console
git clone https://github.com/programiraj/BackendRESTful.git
cd  BackendRESTful
npm install
```
Prije pokretanja je potrebno kreirati bazu na mysql serveru npr. 
```sql
CREATE  SCHEMA `backend_restful` ;
```
i promjeniti postavke za konekciju na mysql u index.js
```javascript
//db connection string
var sequelize = new Sequelize('ime_baze', 'korisnicko_ime', 'lozinka', {
    host: 'ip-servera',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});
```
Nakon toga pokrenuti app
```console
 npm start
```

Sa browserom odite na http://localhost:8080 tu ce se u realnom vremenu pokazivati izmjene koje radite nad podacima

Dok je stranica otvorena sa curl ili postmanom napravite nekoliko promjene ili upita
Trenutno je implemetiran API za snimanje customera i dohvatanje svih customera

## Save customer

POST /api/customers HTTP/1.1
Host: localhost:8080
Accept: application/json
Content-Type: application/json
Cache-Control: no-cache
{
  "name" : "John Doe",
  "address" :"Ulica 45",
  "birthday": "1978-02-02"
}


```console
curl -X POST -H "Accept: application/json" -H "Content-Type: application/json" -H "Cache-Control: no-cache" -d '{
  "name" : "John Doe",
  "address" :"Ulica 45",
  "birthday": "1978-02-02"
}' "http://localhost:8080/api/customers"
```

## Get all customers

GET /api/customers HTTP/1.1
Host: localhost:8080
Accept: application/json
Content-Type: application/json
Cache-Control: no-cache


```console 
curl -X GET -H "Accept: application/json" -H "Content-Type: application/json" -H "Cache-Control: no-cache" "http://localhost:8080/api/customers"
```

Na tabeli koja se nalazi na http://localhost:8080 se u realnom vremenu ispisuju datum akcije, entitet nad kojim se vrsi akcija, tip akcije i podaci.

Koristene tehnologije:

Backend
- node as platform
- express as framework
- socket.io as framework for websockets
- sequelize as ORM
- mysql as database

Frontend
- jquery
- dataTables