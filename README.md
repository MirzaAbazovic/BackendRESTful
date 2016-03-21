# BackendRESTful 

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