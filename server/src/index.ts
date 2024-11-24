import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import multer, { MulterError } from 'multer';
import bodyParser from 'body-parser';
import fs from 'fs';
import { processChatbotQueryInterface } from './components/aiChatLogic';
import { fetchUserInfo, fetchUserVectorStores, decodeAndExtractUserInfo } from './components/userHandler';
import { logger } from './components/config';
import { runAIAnalysis } from './components/aiUploadLogic';
import { userInfo } from './components/types/localTypes';
import { findUser, getVectorStoreAccess } from './components/generalFunctions';

const app = express();

// Constants
const UPLOAD_FOLDER = 'uploads/';
const MAX_FILE_SIZE_MB = 200;
const ALLOWED_EXTENSIONS = ['pdf'];

// Configure Multer for file uploads
const upload = multer({
  dest: UPLOAD_FOLDER,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./components/data'));

// Utility Function: Validate allowed file types
const allowedFile = (filename: string): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase();
  return !!extension && ALLOWED_EXTENSIONS.includes(extension);
};

// Types
interface UserInfo {
  fullName: string;
  email: string;
}

interface ChatResponse {
  response: string;
  sourceDocuments: any[];
}

  // Fetch all available vector stores
  app.get('/vector_stores', (req: Request, res: Response) : void => {
    const idToken = req.headers['x-ms-token-aad-id-token'] as string;
    let email = req.body.email;
    let vectorStores : string[] = getVectorStoreAccess(email);
    res.json({'vectorStores': vectorStores});
  });
    

// Serve static files
app.get('/static/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  res.sendFile(path.resolve(__dirname, 'static', filename));
});

// Serve data files
app.get('/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  res.sendFile(path.resolve(__dirname, 'data', filename));
});

// Chat route
app.route('/')
  .get(async (req: Request, res: Response) : Promise<void> => {
    const query : string = req.query.query as string;
    const store : string = req.query.store as string;
    const email : string = req.query.email as string;


    const idToken = req.headers['x-ms-token-aad-id-token'] as string;
    let user : userInfo = { fullName: 'Brian Murray', email: 'murrayb@hdcco.com' };

    if (process.env.FLASK_ENV !== 'development' && idToken) {
      user = decodeAndExtractUserInfo(idToken);
    }

    const userInfo : Record<string,string[]> = fetchUserInfo();
    const userVectorStores = fetchUserVectorStores(user.email, userInfo);

    if (!userVectorStores) {
      res.status(403).send('No access');
      return;
    }

    const userName : string = user.fullName.split(' ')[0];

    const startTime = Date.now();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    console.log(store)
    const generate = async () => {
      try {
        await processChatbotQueryInterface(store, query, user.fullName, startTime,res)
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (error) {
        logger.error(`Error during streaming: ${error}`);
        res.write(`data: An error occurred: ${error}\n\n`);
        res.end();
      }
    };

    generate();
  })
  .post(async (req: Request, res: Response) : Promise<void> => {
    const { query, store } = req.body;
    const idToken = req.headers['x-ms-token-aad-id-token'] as string;
    let user : userInfo = { fullName: 'Default User', email: 'murrayb@hdcco.com' };

    if (process.env.FLASK_ENV !== 'development' && idToken) {
      user = decodeAndExtractUserInfo(idToken);
    }

    const userInfo : Record<string,string[]> = fetchUserInfo();
    const startTime = Date.now();
    const responseChunks: string[] = [];
    const sourceDocuments: any[] = [];

    try {
      await processChatbotQueryInterface(store, query, user.fullName, startTime, res)


    } catch (error) {
      logger.error(`Error during chatbot query: ${error}`);
      res.status(500).json({ error: `An error occurred: ${error}` });
    }
  });

// File upload route
app.post('/upload', upload.single('pdf_file'), async (req: Request, res: Response) : Promise<any> => {
    const file = req.file;
  
    if (!file) {
      return res.status(400).send('No file uploaded');
    }
  
    if (!allowedFile(file.originalname)) {
      return res.status(400).send('Invalid file type');
    }
  
    const filePath = path.join(UPLOAD_FOLDER, file.filename);
  
    try {
      // Use asynchronous rename for better performance
      await fs.promises.rename(file.path, filePath);
  
      // TODO: Call your AI analysis function here, ensure it returns a result
      const analysisResult = await runAIAnalysis(filePath); // Replace with your AI function
  
      res.render('specs.html', { analysis: analysisResult });
    } catch (error) {
      logger.error(`Error during file upload: ${error}`);
      return res.status(500).send('Error processing file');
    }
  });




// Error handler for large files
app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof MulterError && err.code === 'LIMIT_FILE_SIZE') {
    res.status(413).send(`File too large! Please upload files less than ${MAX_FILE_SIZE_MB}MB.`);
    return;
  }
  next(err);
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;