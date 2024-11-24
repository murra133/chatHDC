interface userInfo{
    fullName: string;
    email: string;
}


interface APIKeys{
    NUMEXPR_MAX_THREADS: number;
    OpenAI_API_TYPE: string;
    OpenAI_API_BASE: string;
    OpenAI_API_KEY: string;
    OpenAI_API_VERSION: string;
}

interface AIMessageResponse{
    type: 'response';
    data: string;
}

interface AISourceDocuments{
    type: 'source_documents';
    data: any[];
}

interface AIErrors{
    type : 'error';
    message: string;
}


export type {userInfo, APIKeys, AIMessageResponse, AIErrors,AISourceDocuments};