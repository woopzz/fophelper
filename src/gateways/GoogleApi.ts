import CustomError from '../models/CustomError';
import { type Act } from '../models/Act';
import { type Payment } from '../models/Payment';
import { dumpMatchings, dumpPayments, loadMatchingsFromString, loadPaymentsFromString } from '../services/payment_csv';
import { type ExternalStorage } from '../store';
import { type MatchingEssential } from '../store/slices/matchings';

const SCOPE = 'https://www.googleapis.com/auth/drive';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

const GD_FOLDER_MIMETYPE = 'application/vnd.google-apps.folder';
const GD_PDF_MIMETYPE = 'application/pdf';
const GD_ROOT_FOLDER_NAME = 'woopzz/fophelper';
const GD_ACTS_FOLDER_NAME = 'Acts';
const GD_PAYMENT_CSV_NAME = 'payments.csv';
const GD_MATCHING_CSV_NAME = 'matchings.csv';
const GD_ERROR_BAD_STATUS = 'Незадовільний статус відповіді';

export default class GoogleApi implements ExternalStorage {
    private clientId: string;
    private apiKey: string;
    private inited = false;
    private rootFolderId: GD_FILE_ID | null = null;
    private actsFolderId: GD_FILE_ID | null = null;
    private paymentsFileId: GD_FILE_ID | null = null;
    private matchingsFileId: GD_FILE_ID | null = null;

    constructor(clientId: string, api_key: string) {
        this.clientId = clientId;
        this.apiKey = api_key;
    }

    async getAllPayments() {
        await this.setupPaymentsFileId();
        const rawCSV = await this.downloadGD({ fileId: this.paymentsFileId as string });
        return loadPaymentsFromString(rawCSV);
    }

    async getAllMatchings() {
        await this.setupMatchingsFileId();
        const rawCSV = await this.downloadGD({ fileId: this.matchingsFileId as string });
        return loadMatchingsFromString(rawCSV);
    }

    async getAllActs() {
        await this.setupActsFolderId();

        const searchResult = await this.searchGD([
            {
                q: `mimeType = "${GD_PDF_MIMETYPE}" and "${this.actsFolderId}" in parents and trashed = false`,
                fields: 'files(id, name, webViewLink)',
            },
        ]);

        const acts: Act[] = [];
        for (let i = 0; i < searchResult.length; i++) {
            const { name, id: gdId, webViewLink: gdWebViewLink } = searchResult[i];
            if (!gdId || !name || !gdWebViewLink) {
                throw new CustomError('Один з актів не містить всієї потрібної інформації.');
            }
            acts.push({ name, gdId, gdWebViewLink });
        }

        return acts;
    }

    async setPayments(payments: Payment[]) {
        await this.setupPaymentsFileId();
        await this.uploadCsvGD({
            name: GD_PAYMENT_CSV_NAME,
            fileId: this.paymentsFileId as string,
            body: dumpPayments(payments),
        });
    }

    async setMatchings(matchings: MatchingEssential[]) {
        await this.setupMatchingsFileId();
        await this.uploadCsvGD({
            name: GD_MATCHING_CSV_NAME,
            fileId: this.matchingsFileId as string,
            body: dumpMatchings(matchings),
        });
    }

    private async setupRootFolderId() {
        if (this.rootFolderId === null) {
            this.rootFolderId = await this.getOrCreateFile({
                name: GD_ROOT_FOLDER_NAME,
                parentId: 'root',
                mimeType: GD_FOLDER_MIMETYPE,
            });
        }
    }

    private async setupActsFolderId() {
        if (this.actsFolderId === null) {
            await this.setupRootFolderId();
            this.actsFolderId = await this.getOrCreateFile({
                name: GD_ACTS_FOLDER_NAME,
                parentId: this.rootFolderId as string,
                mimeType: GD_FOLDER_MIMETYPE,
            });
        }
    }

    private async setupPaymentsFileId() {
        if (this.paymentsFileId === null) {
            await this.setupRootFolderId();
            this.paymentsFileId = await this.getOrCreateFile({
                name: GD_PAYMENT_CSV_NAME,
                parentId: this.rootFolderId as string,
            });
        }
    }

    private async setupMatchingsFileId() {
        if (this.matchingsFileId == null) {
            await this.setupRootFolderId();
            this.matchingsFileId = await this.getOrCreateFile({
                name: GD_MATCHING_CSV_NAME,
                parentId: this.rootFolderId as string,
            });
        }
    }

    private async getOrCreateFile({
        name,
        parentId,
        mimeType,
    }: {
        name: string;
        parentId: GD_FILE_ID;
        mimeType?: typeof GD_FOLDER_MIMETYPE;
    }): Promise<GD_FILE_ID> {
        let searchQuery = `name = "${name}" and "${parentId}" in parents and trashed = false`;
        if (mimeType) {
            searchQuery += ` and mimeType = "${mimeType}"`;
        }

        const searchResult = await this.searchGD([
            {
                q: searchQuery,
                fields: 'files(id)',
                spaces: 'drive',
            },
        ]);
        const found = searchResult.length > 0;
        const fileId = found && searchResult[0].id;

        if (fileId) {
            return fileId;
        }

        if (found) {
            throw new CustomError(`Файл "${name}" знайдено, але інформація про нього невідома.`);
        }

        const createResult = await this.createGD([
            {
                fields: 'id',
            },
            {
                name,
                mimeType,
                parents: [parentId],
            },
        ]);
        if (createResult.id) {
            return createResult.id;
        }

        throw new CustomError(`Файл "${name}" створено, але інформація про нього невідома.`);
    }

    private async searchGD(gapiOptions: Parameters<typeof gapi.client.drive.files.list>) {
        await this.requestAccessToken();
        try {
            const response = await gapi.client.drive.files.list(...gapiOptions);
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
    private async createGD(gapiOptions: Parameters<typeof gapi.client.drive.files.create>) {
        await this.requestAccessToken();
        try {
            const response = await gapi.client.drive.files.create(...gapiOptions);
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
    private async downloadGD({ fileId }: { fileId: GD_FILE_ID }): Promise<string> {
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
    private async uploadCsvGD({ name, fileId, body }: { name: string; fileId: GD_FILE_ID; body: string }) {
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
                    client_id: this.clientId,
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
                            apiKey: this.apiKey,
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
