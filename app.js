const express = require('express');
const dotenv = require('dotenv');
const fs = require('fs');
const AWS = require('aws-sdk');
const axios = require('axios');
const port = 5000;
var app = express();
app.use(express.json());

AWS.config.update({
	region: process.env.REGION,
	accessKeyId: process.env.ACCESSKEYID,
	secretAccessKey: process.env.SECRETACCESSKEYS,
	sessionToken: process.env.SESSIONTOCKEN,
});
const s3 = new AWS.S3();

const bucketName = 's3-file-operations';
const s3File = 'file.txt';
const robUrl = 'http://52.91.127.198:8080/start';

function sendRequest() {
	let response = axios
		.post(robUrl, {
			banner: process.env.BANNER,
			ip: '44.193.1.188:5000',
		})
		.then(function (res) {
			console.log(res.data);
		})
		.catch(function (error) {
			console.log(error);
		});
}
sendRequest();

app.post('/storedata', (req, res) => {
	const content = req.body.data;
	const params = { Bucket: bucketName, Key: s3File, Body: content };
	s3.upload(params, function (err, data) {
		if (err) {
			console.log(err);
		} else {
			console.log('File created successfully!!');
			const uri = data.Location;
			res.status(200).send({ s3uri: uri });
		}
	});
});

app.post('/appenddata', (req, res) => {
	newData = req.body.data;
	const getParams = {
		Bucket: bucketName,
		Key: s3File,
	};
	s3.getObject(getParams, (err, data) => {
		if (err) {
			console.log(err, err.stack);
		} else {
			const uploadNewData = data.Body.toString() + newData;
			const uploadParams = {
				Bucket: bucketName,
				Key: s3File,
				Body: uploadNewData,
			};
			s3.upload(uploadParams, (err, data) => {
				if (err) {
					console.log(err);
				} else {
					res.sendStatus(200);
					console.log('File updated successfully!');
				}
			});
		}
	});
});

app.post('/deletefile', (req, res) => {
	const deleteFileUri = req.body.s3uri;
	const deletaParams = {
		Bucket: bucketName,
		Key: s3File,
	};
	s3.deleteObject(deletaParams, (err, data) => {
		if (err) {
			console.log(err);
		} else {
			res.sendStatus(200);
		}
	});
});

app.listen(port);
console.log('App is running on port: ' + port);
