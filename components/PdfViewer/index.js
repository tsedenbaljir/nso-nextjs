import React from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { resolveMediaUrl } from '@/utils/resolveMediaUrl';

const PdfViewer = ({ fileUrl }) => {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const resolvedUrl = resolveMediaUrl(fileUrl);

    return (
        <div style={{ height: '750px' }}>
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                <Viewer
                    fileUrl={resolvedUrl}
                    plugins={[
                        defaultLayoutPluginInstance
                    ]}
                />
            </Worker>
        </div>
    );
};

export default PdfViewer;
