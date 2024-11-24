import { json } from "body-parser";
import { userInfo } from "./types/localTypes";
// import the json ../data/users.json


const findUser = (email : string) : userInfo =>{
    //let users = require('../data/users.json');
    //let username = users.find((user : userInfo) => user.email === email);
    let user : userInfo = {fullName: "Brian Murray", email: 'email'};
    return user;

}

const getVectorStoreAccess = (email : string) : string[] =>{
    // let users = json('../data/users.json');
    // let user = users.find((user : userInfo) => user.email === email);
    // return user.vectorStore;
    return ["OAI-550TF","LMNA","chatHDC.db"];
}

export {findUser, getVectorStoreAccess};