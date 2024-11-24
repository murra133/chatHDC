import React from "react";
import './SourceDocument.css';
import { type SourceDocuments } from './generalInterfaces';

interface SourceDoucmentsProps {
    documents : SourceDocuments[];
}

const SourceDocument = ( {documents} : SourceDoucmentsProps ) => {
    console.log(documents);
    return (
        <div>
        {documents.map((doc, index) => {
            return (
                <div key={index} className='document'>
                    <div className='document-title'>
                        {doc.displayName}
                    </div>
                    <div className='document-info'>
                        <div className='document-info-item'>
                            <span>Page Number</span>
                            <span>{doc.pageNumber}</span>
                        </div>
                        <div className='document-info-item'>
                            <span>Total Pages</span>
                            <span>{doc.totalPages}</span>
                        </div>
                        <div className='document-info-item'>
                            <span>File Size</span>
                            <span>{doc.fileSize}</span>
                        </div>
                        <div className='document-info-item'>
                            <span>Last Modified</span>
                            <span>{doc.lastModified}</span>
                        </div>
                    </div>
                </div>
            );
        })}
        </div>
    );
};


export default SourceDocument;