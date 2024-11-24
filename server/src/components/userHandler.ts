import * as fs from 'fs';
import * as path from 'path';
import * as base64 from 'base64url';
import { Request, Response } from 'express';
import { userInfo } from './types/localTypes';
// load the user.json file



// Define constants (Hook it to server)
const DATA_DIR = process.env.DATA_DIR || './src/data';

// Fetch user credentials (Change to server side fetching when available)
export function fetchUserInfo(): Record<string, any> {
    const filePath = path.join(DATA_DIR, 'users.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

// Function for decoding the username and email address
export function decodeIdToken(idToken: string): Record<string, any> {
    const parts = idToken.split('.');
    if (parts.length !== 3) {
        throw new Error('ID token must consist of header, payload, and signature');
    }

    const payload = parts[1];
    const paddedPayload : string = payload + '='.repeat((4 - payload.length % 4) % 4); // Add padding
    const decodedPayload : string = Buffer.from(paddedPayload, 'base64').toString('utf-8');
    const claims = JSON.parse(decodedPayload);
    console.log('Decoded claims:', claims);
    return claims;
}

// This function decodes the provided id_token to extract user information.
// It fetches the user's full name and email address from the claims.
// If no information is found, it uses default values.
export function decodeAndExtractUserInfo(idToken: string): userInfo  {
    const claims = decodeIdToken(idToken);
    const fullName = claims.name || 'Default User';
    const email = (claims.email || 'null@hdcco.com').toLowerCase();
    const user : userInfo = { fullName, email };
    return user;
}

// This function fetches the user's vector stores. It gets user info and sets it
// as a global variable. It then returns the vector stores associated with
// the user's email, or defaults to ['INTRANET'] if no stores are found and user
// has an @hdcco.com email address.
// Fetch user's vector stores
export function fetchUserVectorStores(
    userEmail: string,
    userInfo: Record<string, string[]>
): string[] {
    if (userEmail.endsWith('@hdcco.com')) {
        return userInfo[userEmail] || ['INTRANET'];
    } else {
        return [];
    }
}