# API Dokter

## API FOR WEB

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

Api dokter merupakan api dari aplikasi webdokter yang dibuat untuk memenuhi tugas dari web task untuk Software Enginering Academy Comfest

## Deskripsi

- API telah terproteksi dengan JWT (JSON Web Token)
- API telah diberi CORS
- API dibuat menggunakan Express.js

## Instalasi

Api dokter membutuhkan Node

Install semua despedensi untuk menjalankan

```sh
cd apidokter
yarn install
yarn start
```

## Akun admin

username : admin123
password : admin123

# Pemakaian API

## Auth

### Login

url : "/auth/login"

Request
Method :POST
Sample Body

```json
{
  "username": "username",
  "password": "password"
}
```

Sample Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluMTIzIiwicm9sZSI6MSwicHJvamVjdCI6IkFwbGlrYXNpRG9rdGVyIiwiaWF0IjoxNjI1Mjk4NjcxfQ.6Pdz2HICtjXm04FHrZ_Zh1y7vgd0-rFfJdMf5Cxbpn0",
  "role": 1,
  "name": "Admina Saja"
}
```

### Register

url : "/auth/register"
Request
Method :POST
Sample Body

```json
{
  "username": "username",
  "password": "password",
  "firstName": "firstname",
  "lastName": "lastname",
  "email": "email@email.com"
}
```

Sample Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluMTIzIiwicm9sZSI6MSwicHJvamVjdCI6IkFwbGlrYXNpRG9rdGVyIiwiaWF0IjoxNjI1Mjk4NjcxfQ.6Pdz2HICtjXm04FHrZ_Zh1y7vgd0-rFfJdMf5Cxbpn0",
  "status": true,
  "data": {
    "username": "username",
    "password": "password",
    "firstName": "firstname",
    "lastName": "lastname",
    "email": "email@email.com",
    "roles": 1
  }
}
```

# User

GET
url : "/user"
Request
Method : GET
Header

```json
"Authorization" : "Token"
```

Response

```json
{
  "status": true,
  "data": [
    {
      "username": "novandi",
      "email": "ad@gmail.com",
      "firstname": "novandi",
      "lastname": "kevin",
      "password": "a2257cec704fa09ef1b332e92f41566e",
      "roles": "Patient",
      "id": 2
    }
  ]
}
```

GET BY Username
url : "/user/:username"
Request
Method : GET
Header

```json
"Authorization" : "Token"
```

Response

```json
{
  "status": true,
  "data": {
    "username": "novandi",
    "email": "ad@gmail.com",
    "firstname": "novandi",
    "lastname": "kevin",
    "password": "a2257cec704fa09ef1b332e92f41566e",
    "roles": "Patient",
    "id": 2
  }
}
```

INSERT
url : "/user"
Request
Method : POST
Header

```json
"Authorization" : "Token"
```

Body

```json
{
  "username": "novandi",
  "email": "ad@gmail.com",
  "firstname": "novandi",
  "lastname": "kevin",
  "password": "pass",
  "roles": "1"
}
```

- Role 1 untuk pasien
- Role 2 untuk Admin

Response

```json
{
  "status": true,
  "data": {
    "username": "novandi",
    "email": "ad@gmail.com",
    "firstname": "novandi",
    "lastname": "kevin",
    "password": "a2257cec704fa09ef1b332e92f41566e",
    "roles": "Patient",
    "id": 2
  }
}
```

UPDATE
url : "/user/:username"
Request
Method : PUT
Header

```json
"Authorization" : "Token"
```

Body

```json
{
  "username": "novandi",
  "email": "ad@gmail.com",
  "firstname": "novandi",
  "lastname": "kevin",
  "password": "pass",
  "roles": "1"
}
```

- Role 1 untuk pasien
- Role 2 untuk Admin

Response

```json
{
  "status": true,
  "data": {
    "username": "novandi",
    "email": "ad@gmail.com",
    "firstname": "novandi",
    "lastname": "kevin",
    "password": "a2257cec704fa09ef1b332e92f41566e",
    "roles": "Patient",
    "id": 2
  }
}
```

DELETE
url : "/user/:username"
Request
Method : DELETE
Header

```json
"Authorization" : "Token"
```

Response

```json
{
  "status": true,
  "data": {
    "username": "novandi"
  }
}
```

# Dokter

GET
url : "/dokter"
Request
Method : GET
Header

```json
"Authorization" : "Token"
```

Response

```json
{
  "status": true,
  "data": [
    {
      "id": 4,
      "doctor": "Kevin",
      "address": "Sidoarjo",
      "phonenumber": "0888"
    }
  ]
}
```

GET BY ID
url : "/dokter/:id"
Request
Method : GET
Header

```json
"Authorization" : "Token"
```

Response

```json
{
  "status": true,
  "data": {
    "id": 4,
    "doctor": "Kevin",
    "address": "Sidoarjo",
    "phonenumber": "0888"
  }
}
```

INSERT
url : "/dokter"
Request
Method : POST
Header

```json
"Authorization" : "Token"
```

Body

```json
{
  "doctor": "Kevin",
  "address": "Sidoarjo",
  "phonenumber": "0888"
}
```

Response

```json
{
  "status": true,
  "data": {
    "doctor": "Kevin",
    "address": "Sidoarjo",
    "phonenumber": "0888"
  }
}
```

UPDATE
url : "/dokter/:id"
Request
Method : PUT
Header

```json
"Authorization" : "Token"
```

Body

```json
{
  "doctor": "Kevin",
  "address": "Sidoarjo",
  "phonenumber": "0888"
}
```

Response

```json
{
  "status": true,
  "data": {
    "doctor": "Kevin",
    "address": "Sidoarjo",
    "phonenumber": "0888"
  }
}
```

DELETE
url : "/dokter/:id"
Request
Method : DELETE
Header

```json
"Authorization" : "Token"
```

Response

```json
{
  "status": true,
  "data": {
    "iddoctor": "1"
  }
}
```

# Appointment

GET
url : "/appointment"
Request
Method : GET
Header

```json
"Authorization" : "Token"
```

Response

```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "iddoctor": 13,
      "starttime": "07:00:00",
      "endtime": "12:00:00",
      "description": "Sunat",
      "duration": 10,
      "doctor": "Budi",
      "address": "Sidoarjo"
    }
  ]
}
```

GET BY ID
url : "/appointment/:id"
Request
Method : GET
Header

```json
"Authorization" : "Token"
```

Response

```json
{
  "status": true,
  "data": {
    "id": 1,
    "iddoctor": 13,
    "starttime": "07:00:00",
    "endtime": "12:00:00",
    "description": "Sunat",
    "duration": 10,
    "doctor": "Budi",
    "address": "Sidoarjo"
  }
}
```

INSERT
url : "/appointment"
Request
Method : POST
Header

```json
"Authorization" : "Token"
```

Body

```json
{
  "iddoctor": 1,
  "starttime": "19:00",
  "endtime": "20:00",
  "description": "Sunat",
  "duration": 5
}
```

Duration dalam hitungan menit

Response

```json
{
  "status": true,
  "data": {
    "iddoctor": 1,
    "starttime": "19:00",
    "endtime": "20:00",
    "description": "Sunat",
    "duration": 5
  }
}
```

UPDATE
url : "/appointment/:id"
Request
Method : PUT
Header

```json
"Authorization" : "Token"
```

Body

```json
{
  "iddoctor": 1,
  "starttime": "19:00",
  "endtime": "20:00",
  "description": "Sunat",
  "duration": "5"
}
```

Response

```json
{
  "status": true,
  "data": {
    "iddoctor": 1,
    "starttime": "19:00",
    "endtime": "20:00",
    "description": "Sunat",
    "duration": 5
  }
}
```

DELETE
url : "/appointment/:id"
Request
Method : DELETE
Header

```json
"Authorization" : "Token"
```

Response

```json
{
  "status": true
}
```

# Regisrant

GET
url : "/regis"
Request
Method : GET
Header

```json
"Authorization" : "Token"
```

Response

```json
{
  "status": true,
  "data": [
    {
      "id": "5",
      "username": "novandi",
      "idappointments": 1,
      "date_regist": "2021-07-03T00:00:00.000Z",
      "date_book": "2021-07-08T00:00:00.000Z",
      "time_book": "08:00:00",
      "flagstatus": 2,
      "firstname": "novandi",
      "lastname": "kevin",
      "email": "ad@gmail.com",
      "description": "Sunat",
      "doctor": "Budi"
    }
  ]
}
```

GET BY USERNAME
url : "/regis/username/:username"
Request
Method : GET
Header

```json
"Authorization" : "Token"
```

Response

```json
{
  "status": true,
  "data": [
    {
      "id": "5",
      "username": "novandi",
      "idappointments": 1,
      "date_regist": "2021-07-03T00:00:00.000Z",
      "date_book": "2021-07-08T00:00:00.000Z",
      "time_book": "08:00:00",
      "flagstatus": 2,
      "firstname": "novandi",
      "lastname": "kevin",
      "email": "ad@gmail.com",
      "description": "Sunat",
      "doctor": "Budi"
    }
  ]
}
```

GET BY APPOINTMENT
url : "/regis/appointment/:id"
Request
Method : GET
Header

```json
"Authorization" : "Token"
```

Response

```json
{
  "status": true,
  "data": [
    {
      "id": "5",
      "username": "novandi",
      "idappointments": 1,
      "date_regist": "2021-07-03T00:00:00.000Z",
      "date_book": "2021-07-08T00:00:00.000Z",
      "time_book": "08:00:00",
      "flagstatus": 2,
      "firstname": "novandi",
      "lastname": "kevin",
      "email": "ad@gmail.com",
      "description": "Sunat",
      "doctor": "Budi"
    }
  ]
}
```

GET BY ID
url : "/regis/:id"
Request
Method : GET
Header

```json
"Authorization" : "Token"
```

Response

```json
{
  "status": true,
  "data": {
    "id": "5",
    "username": "novandi",
    "idappointments": 1,
    "date_regist": "2021-07-03T00:00:00.000Z",
    "date_book": "2021-07-08T00:00:00.000Z",
    "time_book": "08:00:00",
    "flagstatus": 2,
    "firstname": "novandi",
    "lastname": "kevin",
    "email": "ad@gmail.com",
    "description": "Sunat",
    "doctor": "Budi"
  }
}
```

INSERT
url : "/dokter"
Request
Method : POST
Header

```json
"Authorization" : "Token"
```

Body

```json
{
  "date_book": "2021-06-29",
  "date_regist": "2021-07-03",
  "flagstatus": 1,
  "idappointments": "1",
  "time_book": "09:50",
  "username": "novandi"
}
```

Response

```json
{
  "status": true,
  "data": {
    "date_book": "2021-06-29",
    "date_regist": "2021-07-03",
    "flagstatus": 1,
    "idappointments": "1",
    "time_book": "09:50",
    "username": "novandi"
  }
}
```

UPDATE
url : "/regis/:id"
Request
Method : PUT
Header

```json
"Authorization" : "Token"
```

Body

```json
{
  "date_book": "2021-06-29",
  "date_regist": "2021-07-03",
  "flagstatus": 1,
  "idappointments": "1",
  "time_book": "09:50",
  "username": "novandi"
}
```

Response

```json
{
  "status": true,
  "data": {
    "date_book": "2021-06-29",
    "date_regist": "2021-07-03",
    "flagstatus": 1,
    "idappointments": "1",
    "time_book": "09:50",
    "username": "novandi"
  }
}
```

DELETE
url : "/regis/:id"
Request
Method : DELETE
Header

```json
"Authorization" : "Token"
```

Response

```json
{
  "status": true
}
```
