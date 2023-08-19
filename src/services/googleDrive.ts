import { GD_FILE_ID, GD_PAYMENT_CSV_NAME, GD_ERROR_BAD_STATUS } from '../data';
import CustomError from '../models/CustomError';

export async function searchGD({ q, fields }: { q: string; fields: string }): Promise<gapi.client.drive.File[]> {
    try {
        const spaces = 'drive';
        const response = await gapi.client.drive.files.list({ q, fields, spaces });
        console.debug(response);

        if (response.status !== 200) {
            throw new Error(response.statusText || GD_ERROR_BAD_STATUS);
        }

        return response.result.files || [];
    } catch (error) {
        console.error(error);
        throw new CustomError('Помилка пошуку на Google Drive.');
    }
}

export async function createGD({ resource, fields }: { resource: gapi.client.drive.File; fields: string }) {
    try {
        const response = await gapi.client.drive.files.create({ resource, fields });
        console.debug(response);

        if (response.status !== 200) {
            throw new Error(response.statusText || GD_ERROR_BAD_STATUS);
        }

        return response.result;
    } catch (error) {
        console.error(error);
        throw new CustomError('Не вдається створити новий файл на Google Drive.');
    }
}

export async function downloadGD({ fileId }: { fileId: GD_FILE_ID }): Promise<string> {
    try {
        const response = await gapi.client.drive.files.get({ fileId, alt: 'media' });
        console.debug(response);

        if (response.status !== 200) {
            throw new Error(response.statusText || GD_ERROR_BAD_STATUS);
        }

        return response.body;
    } catch (error) {
        console.error(error);
        throw new CustomError('Не вдається завантажити файл з Google Drive.');
    }
}

export async function uploadGD({ fileId, body }: { fileId: GD_FILE_ID; body: string }) {
    try {
        const metadata = {
            name: GD_PAYMENT_CSV_NAME,
            mimeType: 'text/csv',
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([body], { type: 'text/csv' }));

        const accessToken = gapi.auth.getToken().access_token;

        const response = await fetch(
            `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart&fields=id`,
            {
                method: 'PATCH',
                mode: 'cors',
                headers: {
                    Authorization: 'Bearer ' + accessToken,
                },
                body: form,
            },
        );
        console.debug(response);

        if (response.status !== 200) {
            throw new Error(response.statusText || GD_ERROR_BAD_STATUS);
        }
    } catch (error) {
        console.error(error);
        throw new CustomError('Не вдається завантажити файл на Google Drive.');
    }
}
