"use client"
import { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';

const tinymceKey = 'rvqf3lw6552if615zl9yqk7zqocgsgsy9wuok6az3ifba8uf';

export default function WYSIWYGEditor({ setBody }) {

    const handleEditorChange = (content) => {
        setBody(content);
    };

    const handleFilePicker = (callback, value, meta) => {
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
                await fetch(
                    `https://gateway.1212.mn/api/token?username=tsedenbaljir&password=Nso.123456&grant_type=password`,
                    {
                        method: "POST",
                        headers: {
                            "Access-Control-Allow-Origin": "*",
                            "Content-Type": "application/x-www-form-urlencoded",
                            Authorization: `Basic bnNvY2xpZW50OmExYTgyNTc4LTI1MWEtNDIzNS1hYzNkLWI1ZWY2YjI0NTNhNg==`,
                        },
                    }
                ).then(async (response) => {
                    const dt = await response.json();
                    const data = await fetch('https://gateway.1212.mn/services/1212/api/fms-token',
                        {
                            method: "GET",
                            headers: {
                                "Access-Control-Allow-Origin": "*",
                                "Content-Type": "application/json",
                                Authorization: `Bearer ` + dt.access_token,
                            },
                        });
                    const datares = await data.json();
                    console.log("datares}}}", datares);

                    const uploadUrl = `https://gateway.1212.mn/services/fms/api/public/upload/0/${datares.token}`;
                    const formData = new FormData();
                    formData.append('file', file);

                    const uploadData = await axios.post(uploadUrl, formData, {
                        headers: {
                            "Access-Control-Allow-Origin": "*",
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ` + dt.access_token,
                        },
                    });

                    const fileUrl = `https://gateway.1212.mn/services/fms/api/public/download/0/${uploadData.data.pathName}`;
                    callback(fileUrl, { title: uploadData.data.originalName });
                });

            } catch (error) {
                alert('Файл хавсаргахад алдаа гарлаа!');
            }
        };
    };

    return (
        <div>
            <h1>Мэдээлэл оруулах</h1>
            <Editor
                apiKey={tinymceKey}
                initialValue="<p></p>"
                init={{
                    height: 500,
                    plugins: 'paste autolink code image link media table charmap hr advlist lists',
                    toolbar: 'undo redo | bold italic underline | fontsizeselect formatselect | alignleft aligncenter alignright alignjustify outdent indent | numlist bullist | forecolor backcolor removeformat | image media link',
                    file_picker_types: 'file image media',
                    relative_urls: false,
                    file_picker_callback: handleFilePicker,
                    media_alt_source: false,
                    media_dimensions: false,
                    video_template_callback: (data) => `<iframe src="${data.source}" ${data.sourcemime ? `type="${data.sourcemime}"` : ''} ></iframe>`,
                }}
                onEditorChange={handleEditorChange}
            />
        </div>
    );
}
