"use client"
import { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const tinymceKey = 'rvqf3lw6552if615zl9yqk7zqocgsgsy9wuok6az3ifba8uf';

export default function WYSIWYGEditor({ setBody, defaultValue = '' }) {
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [editorContent, setEditorContent] = useState(defaultValue);

    const handleEditorChange = (content) => {
        setEditorContent(content);
        setBody(content);
    };

    useEffect(() => {
        if (defaultValue) {
            setEditorContent(defaultValue);
        }
    }, [defaultValue]);

    const handleFilePicker = async (callback, value, meta) => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];

            if (32 < file.size / 1024 / 1024) {
                alert('Файлын хэмжээ их байна. 32MB-аас бага хэмжээтэй файл оруулна уу!');
                return;
            }

            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();
                const fileUrl = `/uploads/${data.filename}`;
                callback(fileUrl, { title: data.filename });

            } catch (error) {
                console.error('Error uploading file:', error);
                alert('Файл хавсаргахад алдаа гарлаа!');
            }
        };
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Мэдээлэл оруулах
            </h1>
            <div className="rounded-lg">
                <Editor
                    apiKey={tinymceKey}
                    value={editorContent}
                    onEditorChange={handleEditorChange}
                    init={{
                        height: 500,
                        skin: 'oxide',
                        content_css: 'default',
                        plugins: 'paste autolink code image link media table charmap hr advlist lists',
                        toolbar: 'undo redo | bold italic underline | fontsizeselect formatselect | alignleft aligncenter alignright alignjustify outdent indent | numlist bullist | forecolor backcolor removeformat | image media link',
                        file_picker_types: 'file image media',
                        relative_urls: false,
                        file_picker_callback: handleFilePicker,
                        media_alt_source: false,
                        media_dimensions: false,
                        video_template_callback: (data) => `<iframe src="${data.source}" ${data.sourcemime ? `type="${data.sourcemime}"` : ''} ></iframe>`,
                        images_upload_handler: async (blobInfo, progress) => {
                            try {
                                const formData = new FormData();
                                formData.append('file', blobInfo.blob());

                                const response = await fetch('/api/upload', {
                                    method: 'POST',
                                    body: formData,
                                });

                                if (!response.ok) {
                                    throw new Error('Upload failed');
                                }

                                const data = await response.json();
                                return `/uploads/${data.fileName}`;
                            } catch (error) {
                                console.error('Error uploading image:', error);
                                throw new Error('Image upload failed');
                            }
                        },
                        content_style: `
                            body { 
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                                font-size: 16px;
                                line-height: 1.6;
                                color: #374151;
                                margin: 1rem;
                            }
                        `,
                        setup: (editor) => {
                            editor.on('init', () => {
                                setIsEditorReady(true);
                                if (document.documentElement.classList.contains('dark')) {
                                    editor.getBody().style.backgroundColor = '#1f2937';
                                    editor.getBody().style.color = '#f3f4f6';
                                }
                            });
                        }
                    }}
                    className="min-h-[500px] w-full"
                />
            </div>
        </div>
    );
}
