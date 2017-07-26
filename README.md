# BackendRESTful 

[![Greenkeeper badge](https://badges.greenkeeper.io/MirzaAbazovic/BackendRESTful.svg)](https://greenkeeper.io/)

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

Otvorite stranicu za Tablet 1 (ili 2) u jednoj a Uposlenici u drugoj instanci web pregledinka.

Koristene tehnologije:

Backend
- node as platform
- express as framework
- socket.io as framework for websockets
- sequelize as ORM
- mysql as database

Frontend
- angular

Demo na https://mirza-node.herokuapp.com