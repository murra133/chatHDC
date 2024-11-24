import fs from 'fs';
import path from 'path';
import {glob, stream} from 'glob';
import dotenv from 'dotenv';
import { EventEmitter } from 'events';
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SqlDatabase, SqlDatabaseDataSourceParams } from "langchain/sql_db";
import { DataSource } from "typeorm";
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createSqlAgent, SqlToolkit } from 'langchain/agents/toolkits/sql';
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { AzureChatOpenAI, AzureOpenAIEmbeddings } from '@langchain/openai';
import LineListOutputParser from '../components/prompts';
import ThreadedGenerator  from './threadGenerator';
import { apiKeys } from './config';
import { Response } from 'express';
import {AIErrors, AIMessageResponse, AISourceDocuments} from './types/localTypes';
import { Runnable } from '@langchain/core/runnables';
import { Agent } from 'http';
import { AgentExecutor } from 'langchain/dist/agents/executor';
import { IterableReadableStream } from '@langchain/core/dist/utils/stream';
import { ChainValues } from '@langchain/core/utils/types';
// Load environment variables
dotenv.config();

// Paths and Directories
const DATA_DIR = process.env.DATA_DIR || './src/data';

console.log('DATA_DIR:', DATA_DIR);
// System prompts
const promptsHandler = new LineListOutputParser();


// Logging setup
console.info('Initializing chat system...');



// Initialize the language model
const llm = new AzureChatOpenAI({
    azureOpenAIEndpoint: apiKeys.OpenAI_API_BASE,
    azureOpenAIApiKey: apiKeys.OpenAI_API_KEY,
    azureOpenAIApiDeploymentName: "OpenAI-Deployment-GPT4o-mini-HDC",
    temperature: 0.2,
    azureOpenAIApiVersion: apiKeys.OpenAI_API_VERSION,

});

console.info('Language model initialized.');

const embeddings = new AzureOpenAIEmbeddings({
    azureOpenAIApiDeploymentName: 'OpenAI-Deployment-Txt-Embd-ada-2-HDC',
    azureOpenAIApiInstanceName: 'ai-eus2-hdcco',
    azureOpenAIApiKey: apiKeys.OpenAI_API_KEY,
    azureOpenAIEndpoint : apiKeys.OpenAI_API_BASE,
    azureOpenAIApiVersion: apiKeys.OpenAI_API_VERSION,
});

// Initialize chatbot collections
const chatbotsFaissStore: Record<string, Runnable> = {};
const chatbotSQLAgent: Record<string, AgentExecutor> = {};
const datasets: Record<string, any> = {};

// Load vector stores
const allFiles = glob.sync(path.join(DATA_DIR, '*_faiss_docs'));
const vectorStoreNames = allFiles.map((f) =>
    path.basename(f).replace('_faiss_docs', '')
);
console.info(`Vector stores loaded: ${vectorStoreNames.join(', ')}`);

// Load FAISS vector stores
vectorStoreNames.forEach((name) => {
    const vectorStore = FaissStore.loadFromPython(
        path.join(DATA_DIR, `${name}_faiss_docs`),
        embeddings
        ).then((store : FaissStore) => {
            const systemPrompt : string = promptsHandler.selectSystemPrompt(name);
            const qaPrompt : ChatPromptTemplate = ChatPromptTemplate.fromMessages([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: '{chat_history}' },
                { role: 'user', content: '{input}' },
            ]);
        
            const search_Kwargs :Record<string,string> = { primaryTag: '02 Doc Control' };
        
            const retriever = store.asRetriever({
                searchType: 'similarity',
                searchKwargs: search_Kwargs,
            } as any);
            
            createHistoryAwareRetriever({
                llm: llm,
                retriever: retriever,
                rephrasePrompt: promptsHandler.condenseQuestionSystemPrompt
            }).then((retriever) => {
                createStuffDocumentsChain({
                    llm, 
                    prompt:qaPrompt
                }).then((qaChain) => {
                    createRetrievalChain({
                        retriever:retriever, 
                        combineDocsChain:qaChain
                    }).then((convoQaChain) => {
                        chatbotsFaissStore[name] = convoQaChain;
                        datasets[name] = vectorStore;
                    });
                });
            });

        }).catch((error) => {
            console.error('Error loading vector store:', error);
        });



});

// Load SQL databases
const databases = glob.sync(path.join(DATA_DIR, '*.db'));
databases.forEach((dbPath) => {
    const dbName = path.basename(dbPath);
    const dbSourceParams : DataSource = new DataSource({
        type: 'sqlite',
        database: dbPath,
    });
    SqlDatabase.fromDataSourceParams({appDataSource: dbSourceParams}).then((db: SqlDatabase) => {
        const systemPrompt = promptsHandler.selectSystemPrompt(dbName);
        const qaPrompt : ChatPromptTemplate = ChatPromptTemplate.fromMessages([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: '{chat_history}' },
            { role: 'user', content: '{input}' },
        ]);
        const sqlToolKit : SqlToolkit = new SqlToolkit(db,llm);
        const agentExecute : AgentExecutor = createSqlAgent(llm, sqlToolKit);
        chatbotSQLAgent[dbName] = agentExecute;
        datasets[dbName] = db;
    });
});

// Process chatbot query
async function processChatbotQuery(
    store: string,
    query: string,
    fullUserName: string,
    res : Response
): Promise<boolean> {

    const chatbot : Runnable = chatbotsFaissStore[store];
    const dataset = datasets[store];


    if (!chatbot) {
        let message : AIErrors = {type: 'error', message: 'No chatbot found for the selected store.'};
        res.write(`data: ${JSON.stringify({ message })}\n\n`);
        return false;
    }

    try {
        const refinedQuery = query; // Assume query improvement logic here
        const stream = await chatbot.stream({
            input: refinedQuery,
            user_name: fullUserName,
            stream: true,

        })
        for await (const chunk of stream) {
            if (chunk.context) {
                const sourceDocs = getSourceDocuments(chunk.context);
                let message : AISourceDocuments = {type: 'source_documents', 'data': sourceDocs};
                res.write(`data: ${JSON.stringify( message )}\n\n`);
            }
            if (chunk.answer) {
                let message : AIMessageResponse = {type: 'response', data: chunk.answer};
                res.write(`data: ${JSON.stringify(message)}\n\n`);
            }
        };

        
    } catch (error) {
        let message : AIErrors = {type: 'error', message: `An error occurred: ${error}`};
        res.write(`data: ${JSON.stringify({ message })}\n\n`);
        return false;
    }

    return true;
}


async function processChatbotSQLQuery(
    store: string,
    query: string,
    fullUserName: string,
    res : Response
): Promise<boolean> {
    
    const chatbot : AgentExecutor = chatbotSQLAgent[store];
    console.log(chatbot);
    const dataset = datasets[store];
    if(!chatbot){
        let message : AIErrors = {type: 'error', message: 'No chatbot found for the selected store.'};
        res.write(`data: ${JSON.stringify({ message })}\n\n`);
        return false;
    };
    const stream : IterableReadableStream<ChainValues> = await chatbot.stream({
        input: query,
        user_name: fullUserName,
        stream: true,
    })

    for await (const chunk of stream) {
        console.log('Chunk:', chunk);
        if (chunk.output) {
            let message : AIMessageResponse = {type: 'response', data: chunk.output};
            res.write(`data: ${JSON.stringify(message)}\n\n`);
        }
    };


    

    return true;

}


// Get source documents for display
function getSourceDocuments(docs: any[]): any[] {
    return docs.map((doc) => {
        const { source, page, file_size, total_pages, date_modified } = doc.metadata || {};
        const displayName = path.basename(source || 'Unknown Source');

        return {
            filePath: source || 'Unknown Source',
            displayName,
            pageNumber: (page || 0) + 1,
            fileSize: file_size || 'Unknown Size',
            totalPages: total_pages || 'Unknown Size',
            dateModified: date_modified || 'Unknown Size',
        };
    });
}

// Exported functions for processing queries
export function processChatbotQueryInterface(
store: string, query: string, userName: string, startTime: number, res : Response): Promise<boolean> {
    if(store.includes('.db')) return processChatbotSQLQuery(store, query, userName, res);
    return processChatbotQuery(store, query, userName, res);
}