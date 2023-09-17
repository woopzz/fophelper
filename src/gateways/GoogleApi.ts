import CustomError from '../models/CustomError';

interface SearchOptions {
    q: string;
    fields: string;
}

interface CreateOptions {
    resource: gapi.client.drive.File;
    fields: string;
}

interface DownloadOptions {
    fileId: GD_FILE_ID;
}

interface UploadOptions {
    name: string;
    fileId: GD_FILE_ID;
    body: string;
}

export interface GoogleApi {
    searchGD: (options: SearchOptions) => Promise<gapi.client.drive.File[]>;
    createGD: (options: CreateOptions) => Promise<gapi.client.drive.File>;
    downloadGD: (options: DownloadOptions) => Promise<string>;
    uploadGD: (options: UploadOptions) => Promise<void>;
}

const CLIENT_ID = '697960931943-v8ggr3cv0kgvs1euspf7t7orbe0ksghf.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAQvT4ajswov4Cbf8-a-ZKucHc-ov3yauc';
const SCOPE = 'https://www.googleapis.com/auth/drive';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

const GD_ERROR_BAD_STATUS = 'Незадовільний статус відповіді';

export default class Gapi implements GoogleApi {
    private inited = false;

    async searchGD({ q, fields }: SearchOptions) {
        await this.requestAccessToken();
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
    async createGD({ resource, fields }: CreateOptions) {
        await this.requestAccessToken();
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
    async downloadGD({ fileId }: DownloadOptions): Promise<string> {
        await this.requestAccessToken();
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
    async uploadGD({ name, fileId, body }: UploadOptions) {
        const accessToken = await this.requestAccessToken();
        try {
            const metadata = { name, mimeType: 'text/csv' };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', new Blob([body], { type: 'text/csv' }));

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

    private requestAccessToken() {
        const token = gapi?.auth?.getToken();
        if (token) {
            return Promise.resolve(token.access_token);
        }
        return this.load().then(() => {
            return new Promise((resolve, reject) => {
                const tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: CLIENT_ID,
                    scope: SCOPE,
                    callback: (tokenResponse) => {
                        const accessToken = tokenResponse && tokenResponse.access_token;
                        if (!accessToken) {
                            reject('Не вдалося отримати токен від Gapi токен клієнта.');
                        }
                        resolve(accessToken);
                    },
                    error_callback: () => reject('Не вдалося налаштувати gapi токен клієнт.'),
                });
                tokenClient.requestAccessToken();
            }) as Promise<string>;
        });
    }
    private load() {
        if (this.inited) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            gapi.load('client', {
                callback: () =>
                    gapi.client
                        .init({
                            apiKey: API_KEY,
                            discoveryDocs: DISCOVERY_DOCS,
                        })
                        .then(
                            () => {
                                this.inited = true;
                                resolve();
                            },
                            () => reject('Не вдалося налаштувати gapi клієнт.'),
                        ),
                onerror: () => reject('Не вдалося завантажити gapi клієнт.'),
            });
        }) as Promise<void>;
    }
}
