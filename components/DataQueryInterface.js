'use client'
import React, { useState, useEffect } from 'react';
import { Button, Input, message, Card, Space, Typography } from 'antd';
import { DownloadOutlined, CopyOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

const DataQueryInterface = ({ subtables, sector, subsector, id, lng, selectedValues }) => {
    const [url, setUrl] = useState(`https://data.1212.mn:443/api/v1/${lng}/NSO/${decodeURIComponent(sector)}/${decodeURIComponent(subsector)}/${subtables ? `${subtables}/` : ''}${id}`);

    const [query, setQuery] = useState(JSON.stringify({
        "query": [],
        "response": {
            "format": "json-stat2"
        }
    }, null, 2));
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        var query = [];
        for (const [code, values] of Object.entries(selectedValues)) {
            query.push({
                code: code,
                selection: {
                    filter: "item",
                    values: values
                }
            });
        }
        setQuery(JSON.stringify({
            "query": query,
            "response": {
                "format": "json-stat2"
            }
        }, null, 2));
    }, [selectedValues]);

    const handleDownloadQuery = () => {
        const blob = new Blob([query], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'query.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        message.success('Query downloaded');
    };

    const handleDownloadResult = () => {
        if (!result) {
            message.error('No result to download');
            return;
        }

        const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'result.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        message.success('Result downloaded');
    };

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(url).then(() => {
            message.success({
                content: 'URL хуулагдлаа',
                style: {
                    marginTop: '20vh',
                    marginLeft: 'auto',
                    marginRight: '20px',
                },
            });
        }).catch(() => {
            message.error({
                content: 'URL хуулах үед алдаа гарлаа',
                style: {
                    marginTop: '20vh',
                    marginLeft: 'auto',
                    marginRight: '20px',
                },
            });
        });
    };

    const handleCopyQuery = () => {
        navigator.clipboard.writeText(query).then(() => {
            message.success({
                content: 'JSON query хуулагдлаа',
                style: {
                    marginTop: '20vh',
                    marginLeft: 'auto',
                    marginRight: '20px',
                },
            });
        }).catch(() => {
            message.error({
                content: 'JSON query хуулах үед алдаа гарлаа',
                style: {
                    marginTop: '20vh',
                    marginLeft: 'auto',
                    marginRight: '20px',
                },
            });
        });
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <Card
                style={{ border: '2px dashed #1890ff' }}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    {/* API Token Button */}
                    {/* <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        size="large"
                    >
                        API TOKEN
                    </Button> */}

                    {/* URL Section */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <Text strong>URL:</Text>
                            <Button
                                type="primary"
                                icon={<CopyOutlined />}
                                onClick={handleCopyUrl}
                                size="small"
                            >
                                {lng === 'mn' ? 'URL хуулах' : 'Copy URL'}
                            </Button>
                        </div>
                        <Input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Enter API URL"
                            style={{
                                marginTop: '8px',
                                color: '#000000',
                                backgroundColor: '#f5f5f5'
                            }}
                            size="middle"
                            disabled={true}
                        />
                    </div>

                    {/* JSON Query Section */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <Text strong>JSON query:</Text>
                            <Button
                                type="primary"
                                icon={<CopyOutlined />}
                                onClick={handleCopyQuery}
                                size="small"
                            >
                                Query хуулах
                            </Button>
                        </div>
                        <TextArea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter JSON query"
                            rows={8}
                            className='text-black text-md'
                            style={{
                                marginTop: '8px',
                                letterSpacing: '0.1em',
                                color: '#000000',
                                backgroundColor: '#f5f5f5'
                            }}
                            disabled={true}
                        />
                    </div>

                    {/* Action Buttons */}
                    <Space>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={handleDownloadQuery}
                            size="large"
                        >
                            JSON query татах
                        </Button>
                    </Space>

                    {/* Result Display */}
                    {result && (
                        <div style={{ marginTop: '20px' }}>
                            <Title level={4}>Үр дүн:</Title>
                            <Card style={{ backgroundColor: '#f5f5f5' }}>
                                <pre style={{
                                    whiteSpace: 'pre-wrap',
                                    wordWrap: 'break-word',
                                    maxHeight: '400px',
                                    overflow: 'auto'
                                }}>
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </Card>
                        </div>
                    )}
                </Space>
            </Card>
        </div>
    );
};

export default DataQueryInterface;
