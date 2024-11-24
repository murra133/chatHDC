type SourceDocuments = {
    filePath : string;
    displayName : string;
    pageNumber : number;
    totalPages : number;
    fileSize : string;
    lastModified : string;
}

type SourceDocumentsGroup = {
    documents : SourceDocuments[] | null;
};

export type {SourceDocumentsGroup, SourceDocuments};


